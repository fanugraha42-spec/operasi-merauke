import {useEffect,useMemo,useRef,useState} from 'react';
import {loadLocal,sheetEmbed} from './lib.js';
import {createSharedStore} from './shared-store.js';

const environment=import.meta.env;
export function usePortalData(seed,defaults){
 const shared=Boolean(environment.VITE_SUPABASE_URL||environment.VITE_SUPABASE_PUBLISHABLE_KEY);
 const connection=useMemo(()=>{
  if(!shared)return {};
  try{return {store:createSharedStore({url:environment.VITE_SUPABASE_URL,key:environment.VITE_SUPABASE_PUBLISHABLE_KEY})};}
  catch(error){return {error:error.message};}
 },[shared]);
 const [data,setData]=useState(()=>({tasks:shared?[]:loadLocal('merauke.tasks.v1',seed),sheets:shared?defaults:{...defaults,...loadLocal('merauke.sheets.v1',{})},sources:{}}));
 const [status,setStatus]=useState({ready:!shared,error:connection.error||'',lastSynced:null,busy:false});
 const revision=useRef(0),busy=useRef(false),inFlight=useRef(false),alive=useRef(true),refreshRef=useRef(null);
 useEffect(()=>{
  alive.current=true;
  async function refresh(){
   if(!connection.store||inFlight.current||busy.current)return;
   inFlight.current=true;
   const version=revision.current;
   try{
    const snapshot=await connection.store.read();
    if(alive.current&&version===revision.current){
     const sources=Object.fromEntries(snapshot.sources.map(row=>[row.id,row]));
     setData({tasks:snapshot.tasks,sources,sheets:{...defaults,...Object.fromEntries(snapshot.sources.map(row=>[row.id,row.url]))}});
     setStatus(previous=>({...previous,ready:true,error:'',lastSynced:new Date()}));
    }
   }catch(error){if(alive.current&&version===revision.current)setStatus(previous=>({...previous,ready:false,error:error.message}));}
   finally{inFlight.current=false;}
  }
  refreshRef.current=refresh;
  refresh();
  const timer=shared?setInterval(()=>{if(!document.hidden)refresh();},10000):null;
  const visible=()=>{if(!document.hidden)refresh();};
  window.addEventListener('focus',refresh);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',visible);
  return()=>{alive.current=false;clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',visible);};
 },[connection,shared,defaults]);
 async function mutate(operation){
  if(busy.current)throw new Error('Masih menyimpan perubahan sebelumnya.');
  if(shared&&!status.ready)throw new Error(status.error||'Data bersama masih dimuat. Tunggu sebentar.');
  busy.current=true;revision.current++;
  setStatus(previous=>({...previous,busy:true}));
  try{return await operation();}
  finally{busy.current=false;revision.current++;if(alive.current)setStatus(previous=>({...previous,busy:false}));refreshRef.current?.();}
 }
 return {
  ...data,shared,...status,
  refresh:()=>refreshRef.current?.(),
  async saveTask(task,original){return mutate(async()=>{
   const saved=shared?await connection.store.saveTask(task,original):task;
   if(!shared){const tasks=original?data.tasks.map(t=>t.id===saved.id?saved:t):[...data.tasks,saved];localStorage.setItem('merauke.tasks.v1',JSON.stringify(tasks));}
   setData(previous=>{
    const tasks=original?previous.tasks.map(t=>t.id===saved.id?saved:t):[...previous.tasks,saved];
    return {...previous,tasks};
   });
  });},
  async deleteTask(task){return mutate(async()=>{
   if(shared)await connection.store.deleteTask(task);
   else localStorage.setItem('merauke.tasks.v1',JSON.stringify(data.tasks.filter(t=>t.id!==task.id)));
   setData(previous=>({...previous,tasks:previous.tasks.filter(t=>t.id!==task.id)}));
  });},
  async saveSheet(id,url,original){return mutate(async()=>{
   sheetEmbed(url);
   const row=shared?await connection.store.saveSheet(id,url,original):{id,url};
   if(!shared)localStorage.setItem('merauke.sheets.v1',JSON.stringify({...data.sheets,[id]:url}));
   setData(previous=>({...previous,sheets:{...previous.sheets,[id]:row.url},sources:{...previous.sources,[id]:row}}));
  });}
 };
}
