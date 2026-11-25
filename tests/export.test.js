import test from 'node:test';import assert from 'node:assert/strict';
import {createTaskWorkbook} from '../src/export-tasks.js';
import {TASK_CATEGORIES,categorySummary,taskCategory} from '../src/task-categories.js';
import {readFile} from 'node:fs/promises';
const task=(id,category,progress)=>({id,category,progress,title:'Pekerjaan '+id,owner:'PIC',team:'Support',start:'2026-11-25',end:'2026-11-27',priority:'Tinggi'});
test('XLSX survives roundtrip with typed dates, numbers, category summary and active rows',async()=>{
 const rows=[task('a','proteksi',100),task('b','scada-telekomunikasi',50),task('c','material-penunjang',0),task('pending-proteksi-x','proteksi',0)];
 const workbook=await createTaskWorkbook(rows,[rows[1]]);const buffer=await workbook.xlsx.writeBuffer();
 const {default:ExcelJS}=await import('exceljs');const loaded=new ExcelJS.Workbook();await loaded.xlsx.load(buffer);
 const sheet=loaded.getWorksheet('Seluruh Pekerjaan');assert.equal(sheet.rowCount,4);assert.equal(sheet.getCell('G2').value instanceof Date,true);assert.equal(sheet.getCell('I2').value,3);assert.equal(sheet.getCell('J2').value,1);assert.equal(sheet.getCell('J2').numFmt,'0%');assert.equal(sheet.views[0].state,'frozen');assert.ok(sheet.autoFilter);
 assert.equal(loaded.getWorksheet('Tampilan Aktif').rowCount,2);assert.equal(loaded.getWorksheet('Tampilan Aktif').getCell('C2').value,'SCADA dan Telekomunikasi');
 const summary=loaded.getWorksheet('Rekap Kategori');assert.equal(summary.rowCount,6);assert.equal(summary.getCell('B2').value,1);assert.equal(summary.getCell('E2').value,1);assert.equal(summary.getCell('F2').value,1);
});
test('legacy tasks retain visibility and five categories remain distinct',()=>{assert.equal(TASK_CATEGORIES.length,5);assert.equal(taskCategory({}), 'proteksi');const summary=categorySummary(TASK_CATEGORIES.map(c=>task(c.id,c.id,50)));assert.ok(summary.every(c=>c.total===1&&c.active===1&&c.average===.5));});
test('SCADA navigation appears immediately after Proteksi with IP lists, Radio and ISR',async()=>{const menus=JSON.parse(await readFile(new URL('../menu.json',import.meta.url),'utf8'));const roots=menus.filter(m=>!m.path.includes('/'));const i=roots.findIndex(m=>m.path==='proteksi-meter');assert.equal(roots[i+1].label,'SCADA & Telekomunikasi');assert.deepEqual(menus.filter(m=>m.path.startsWith('scada-telekomunikasi/')).map(m=>m.label),['List IP RTU GH','List IP Relay','List IP Keypoint','Radio','ISR']);});
