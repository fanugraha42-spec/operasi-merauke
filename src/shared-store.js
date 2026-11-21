import {sheetEmbed} from './lib.js';

export const CONFLICT_MESSAGE='Data ini sudah diubah atau dihapus pengguna lain. Tutup formulir, muat ulang data, lalu coba lagi.';
const taskFields=['id','title','team','owner','start','end','progress','priority'];
const cleanTask=task=>Object.fromEntries(taskFields.map(key=>[key,task[key]]));

export function createSharedStore({url,key,fetchImpl=fetch}) {
 const base=new URL(url);
 if(base.protocol!=='https:'||base.pathname!=='/'||base.search||base.hash) throw new Error('Project URL Supabase tidak valid.');
 if(!key) throw new Error('Publishable key Supabase belum diisi.');
 if(!key.startsWith('sb_publishable_')) {
  try {if(JSON.parse(atob(key.split('.')[1].replaceAll('-','+').replaceAll('_','/'))).role!=='anon')throw Error();}
  catch {throw new Error('Gunakan publishable key atau anon key. Kunci rahasia tidak boleh dipasang pada frontend.');}
 }
 const headers={apikey:key,'Content-Type':'application/json',Prefer:'return=representation'};
 if(!key.startsWith('sb_publishable_'))headers.Authorization='Bearer '+key;
 async function request(table,{method='GET',params={},body}={}) {
  const query=new URLSearchParams(params);
  let response;
  try {response=await fetchImpl(`${base.origin}/rest/v1/${table}?${query}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(15000)});}
  catch {throw new Error('Koneksi penyimpanan bersama terputus. Perubahan belum disimpan. Coba lagi saat terhubung.');}
  if(!response.ok){
   if(response.status===409)throw new Error(CONFLICT_MESSAGE);
   throw new Error('Penyimpanan bersama belum dapat diakses. Periksa koneksi, konfigurasi proyek, dan skrip database.');
  }
  const data=await response.json();
  if(!Array.isArray(data))throw new Error('Respons penyimpanan bersama tidak valid.');
  return data;
 }
 async function all(table,order){
  const rows=[];
  for(let offset=0;;offset+=500){
   const page=await request(table,{params:{select:'*',order,offset,limit:500}});
   rows.push(...page);
   if(page.length<500)return rows;
  }
 }
 async function change(table,id,revision,method,body){
  const rows=await request(table,{method,params:{id:'eq.'+id,revision:'eq.'+revision},body});
  if(rows.length!==1)throw new Error(CONFLICT_MESSAGE);
  return rows[0];
 }
 return {
  async read(){const [tasks,sources]=await Promise.all([all('portal_tasks','id.asc'),all('portal_sheet_sources','id.asc')]);return {tasks,sources};},
  async saveTask(task,original){
   const body=cleanTask(task);
   if(original)return change('portal_tasks',original.id,original.revision,'PATCH',body);
   const rows=await request('portal_tasks',{method:'POST',body});
   if(rows.length!==1)throw new Error('Pekerjaan belum tersimpan.');
   return rows[0];
  },
  deleteTask(task){return change('portal_tasks',task.id,task.revision,'DELETE');},
  async saveSheet(id,url,original){
   sheetEmbed(url);
   if(original)return change('portal_sheet_sources',id,original.revision,'PATCH',{url});
   const rows=await request('portal_sheet_sources',{method:'POST',body:{id,url}});
   if(rows.length!==1)throw new Error('Sumber Sheets belum tersimpan.');
   return rows[0];
  }
 };
}
