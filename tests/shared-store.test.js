import test from 'node:test';
import assert from 'node:assert/strict';
import {createSharedStore,CONFLICT_MESSAGE} from '../src/shared-store.js';

const task=(id,title=id)=>({id,title,team:'Support',owner:'Tim Operasi',start:'2026-11-21',end:'2026-11-22',progress:10,priority:'Sedang'});
// Two clients share a simulated PostgREST database. Each mutation checks revision,
// representing the SQL UPDATE/DELETE WHERE id AND revision predicate.
function database(){
 const tables={portal_tasks:new Map(),portal_sheet_sources:new Map()};
 const calls=[];
 async function fetchImpl(input,options){
  const url=new URL(input),table=tables[url.pathname.split('/').at(-1)],params=url.searchParams;
  calls.push({url,options});
  let rows=[...table.values()];
  const id=params.get('id')?.slice(3),revision=params.get('revision')?.slice(3);
  if(id!==undefined)rows=rows.filter(r=>r.id===id&&String(r.revision)===revision);
  const body=options.body?JSON.parse(options.body):null;
  if(options.method==='POST'){
   if(table.has(body.id))return Response.json({code:'23505'},{status:409});
   const row={...body,revision:1};table.set(row.id,row);return Response.json([row]);
  }
  if(options.method==='PATCH')rows=rows.map(r=>{const next={...r,...body,revision:r.revision+1};table.set(r.id,next);return next;});
  if(options.method==='DELETE')for(const r of rows)table.delete(r.id);
  if(options.method==='GET'){
   const offset=Number(params.get('offset')||0),limit=Number(params.get('limit')||500);
   rows=rows.slice(offset,offset+limit);
  }
  return Response.json(rows);
 }
 const client=()=>createSharedStore({url:'https://example.supabase.co',key:'sb_publishable_test',fetchImpl});
 return {client,tables,calls};
}

test('changes on one client appear on another, including updates and deletion',async()=>{
 const db=database(),a=db.client(),b=db.client();
 const created=await a.saveTask(task('a'));
 assert.equal((await b.read()).tasks[0].title,'a');
 const updated=await b.saveTask({...created,priority:'Tinggi',progress:75},created);
 assert.equal((await a.read()).tasks[0].priority,'Tinggi');
 assert.equal(updated.revision,2);
 await a.deleteTask(updated);
 assert.equal((await b.read()).tasks.length,0);
});
test('editing or deleting a stale task cannot overwrite another visitor',async()=>{
 const db=database(),a=db.client(),b=db.client();
 const original=await a.saveTask(task('a'));
 await b.saveTask({...original,title:'Perubahan tim B'},original);
 await assert.rejects(a.saveTask({...original,title:'Tertimpa'},original),{message:CONFLICT_MESSAGE});
 await assert.rejects(a.deleteTask(original),{message:CONFLICT_MESSAGE});
 assert.equal((await a.read()).tasks[0].title,'Perubahan tim B');
});
test('saving one task preserves work concurrently created by another visitor',async()=>{
 const db=database(),a=db.client(),b=db.client();
 const original=await a.saveTask(task('a'));
 await b.saveTask(task('b'));
 await a.saveTask({...original,progress:60},original);
 assert.equal((await a.read()).tasks.length,2);
 assert.ok(db.calls.filter(c=>c.options.method==='PATCH').every(c=>c.url.searchParams.has('revision')));
});
test('shared sheet source uses per-route revisions and rejects simultaneous creation',async()=>{
 const db=database(),a=db.client(),b=db.client();
 const first='https://docs.google.com/spreadsheets/d/abc/edit?gid=1';
 const second='https://docs.google.com/spreadsheets/d/def/edit?gid=2';
 const row=await a.saveSheet('support/sld-20-kv',first);
 assert.equal((await b.read()).sources[0].url,first);
 await assert.rejects(b.saveSheet(row.id,second),{message:CONFLICT_MESSAGE});
 const changed=await b.saveSheet(row.id,second,row);
 await assert.rejects(a.saveSheet(row.id,first,row),{message:CONFLICT_MESSAGE});
 assert.equal((await a.read()).sources[0].url,second);
 assert.equal(changed.revision,2);
 await assert.rejects(a.saveSheet('other','https://evil.example/test'));
});
test('network failures reject mutations and do not claim success',async()=>{
 const client=createSharedStore({url:'https://example.supabase.co',key:'sb_publishable_test',fetchImpl:()=>{throw Error('offline')}});
 await assert.rejects(client.saveTask(task('a')),/belum disimpan/);
});
test('reads paginate so tasks beyond the default response limit remain visible',async()=>{
 const db=database();for(let i=0;i<510;i++)db.tables.portal_tasks.set(String(i),{...task(String(i)),revision:1});
 assert.equal((await db.client().read()).tasks.length,510);
});
test('publishable keys stay in apikey header and service keys are rejected',async()=>{
 const db=database();await db.client().read();
 assert.equal(db.calls[0].options.headers.apikey,'sb_publishable_test');
 assert.equal(db.calls[0].options.headers.Authorization,undefined);
 const key='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';
 assert.throws(()=>createSharedStore({url:'https://example.supabase.co',key}),/Kunci rahasia/);
});
test('legacy anon keys are supported',async()=>{
 let headers;
 const key='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role:'anon'})).toString('base64url')+'.signature';
 const client=createSharedStore({url:'https://example.supabase.co',key,fetchImpl:async(u,o)=>{headers=o.headers;return Response.json([])}});
 await client.read();assert.equal(headers.Authorization,'Bearer '+key);
});

test('field findings sync via existing task rows without replacing ordinary jobs',async()=>{
 const {pendingRecord,PENDING_PREFIX,isPendingItem}=await import('../src/pending.js');
 const db=database(),a=db.client(),b=db.client();
 await a.saveTask(task('ordinary-job'));
 const fields={title:'Temuan GH Merauke',owner:'Tim Proteksi',start:'2026-11-25',end:'2026-11-26',priority:'Tinggi',progress:0};
 const row=await a.saveTask(pendingRecord(fields,PENDING_PREFIX+'a'));
 const seen=(await b.read()).tasks;
 assert.equal(seen.filter(isPendingItem).length,1);assert.equal(seen.filter(t=>!isPendingItem(t)).length,1);
 const updated=await b.saveTask(pendingRecord({...fields,progress:100},row.id),row);
 assert.equal((await a.read()).tasks.find(isPendingItem).progress,100);
 await a.deleteTask(updated);
 assert.deepEqual((await b.read()).tasks.map(t=>t.id),['ordinary-job']);
});
