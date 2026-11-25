export const PENDING_PREFIX='pending-proteksi-';
export const isPendingItem=row=>typeof row.id==='string'&&row.id.startsWith(PENDING_PREFIX);
export const pendingStatus=progress=>progress===100?'Selesai':progress>0?'Dalam tindak lanjut':'Terbuka';
export function pendingRecord(fields,id){
 if(!id?.startsWith(PENDING_PREFIX))throw new Error('ID temuan tidak valid.');
 const title=String(fields.title||'').trim(),owner=String(fields.owner||'').trim();
 if(!title||title.length>100)throw new Error('Temuan dan lokasi wajib diisi, maksimal 100 karakter.');
 if(!owner||owner.length>60)throw new Error('Penanggung jawab wajib diisi, maksimal 60 karakter.');
 const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
 if(!validDate(fields.start)||!validDate(fields.end)||fields.end<fields.start)throw new Error('Target tindak lanjut harus sama dengan atau setelah tanggal temuan.');
 if(!['Rendah','Sedang','Tinggi'].includes(fields.priority))throw new Error('Prioritas tidak valid.');
 const progress=Number(fields.progress);
 if(![0,50,100].includes(progress))throw new Error('Status temuan tidak valid.');
 return {id,title,owner,team:'Proteksi & Meter',start:fields.start,end:fields.end,priority:fields.priority,progress};
}
export function todayWit(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jayapura',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
 return `${values.year}-${values.month}-${values.day}`;
}
