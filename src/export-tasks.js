import {TASK_CATEGORIES,categoryLabel,categorySummary} from './task-categories.js';
import {isPendingItem} from './pending.js';
import {dayDiff} from './lib.js';
export async function createTaskWorkbook(tasks,visible=tasks){
 const {default:ExcelJS}=await import('exceljs');
 const workbook=new ExcelJS.Workbook();workbook.creator='Bidang Operasi UP3 Merauke';
 const jobs=tasks.filter(t=>!isPendingItem(t));
 function details(name,rows){
  const sheet=workbook.addWorksheet(name,{views:[{state:'frozen',ySplit:1}]});
  sheet.columns=[{header:'No',key:'no',width:7},{header:'ID Pekerjaan',key:'id',width:38},{header:'Kategori',key:'category',width:29},{header:'Pekerjaan',key:'title',width:48},{header:'Tim',key:'team',width:25},{header:'Penanggung Jawab',key:'owner',width:26},{header:'Tanggal Mulai',key:'start',width:18},{header:'Tanggal Selesai',key:'end',width:18},{header:'Durasi (hari)',key:'duration',width:16},{header:'Progres',key:'progress',width:14},{header:'Status',key:'status',width:18},{header:'Prioritas',key:'priority',width:14}];
  rows.forEach((t,i)=>sheet.addRow({no:i+1,id:t.id,category:categoryLabel(t),title:t.title,team:t.team,owner:t.owner,start:new Date(t.start+'T00:00:00Z'),end:new Date(t.end+'T00:00:00Z'),duration:dayDiff(t.start,t.end)+1,progress:t.progress/100,status:t.progress===100?'Selesai':t.progress>0?'Berjalan':'Rencana',priority:t.priority}));
  sheet.getColumn('start').numFmt='dd/mm/yyyy';sheet.getColumn('end').numFmt='dd/mm/yyyy';sheet.getColumn('progress').numFmt='0%';
  format(sheet);return sheet;
 }
 function format(sheet){sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF292B27'}};sheet.getRow(1).height=28;sheet.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,sheet.rowCount),column:sheet.columnCount}};sheet.eachRow((row,index)=>{row.alignment={vertical:'top',wrapText:true};if(index>1&&index%2===0)row.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF1F0EC'}};});}
 details('Seluruh Pekerjaan',jobs);
 details('Tampilan Aktif',visible.filter(t=>!isPendingItem(t)));
 const summary=workbook.addWorksheet('Rekap Kategori',{views:[{state:'frozen',ySplit:1}]});
 summary.columns=[{header:'Kategori',key:'label',width:30},{header:'Total Pekerjaan',key:'total',width:20},{header:'Rencana',key:'planned',width:16},{header:'Berjalan',key:'active',width:16},{header:'Selesai',key:'completed',width:16},{header:'Rata-rata Progres',key:'average',width:23}];
 categorySummary(jobs).forEach(row=>summary.addRow(row));summary.getColumn('average').numFmt='0.0%';format(summary);
 const guide=workbook.addWorksheet('Keterangan');guide.columns=[{width:30},{width:90}];
 guide.addRows([['Portal','Bidang Operasi UP3 Merauke'],['Diekspor pada (WIT)',new Date().toLocaleString('id-ID',{timeZone:'Asia/Jayapura'})],['Seluruh Pekerjaan','Semua kategori pekerjaan, tanpa temuan Pending Item Proteksi.'],['Tampilan Aktif','Kategori/tab dan filter tim/pencarian yang aktif saat ekspor. Periode timeline tidak memotong data ekspor.'],['Rekap Kategori','Ringkasan seluruh pekerjaan per kategori pada waktu ekspor.'],['Progres','Nilai numerik 0–1 dengan format persen Excel.'],['Durasi','Jumlah hari kalender, termasuk tanggal mulai dan selesai.'],['Kategori tugas lama','Tugas yang belum memiliki kategori dimasukkan ke Proteksi; ubah melalui detail pekerjaan.']]);guide.eachRow(row=>row.alignment={wrapText:true,vertical:'top'});
 return workbook;
}
export async function downloadTaskWorkbook(tasks,visible){
 const workbook=await createTaskWorkbook(tasks,visible),buffer=await workbook.xlsx.writeBuffer();
 const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='rekap-pekerjaan-operasi-merauke.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
