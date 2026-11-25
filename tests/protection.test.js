import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PRODUCT_ROOT,PENDING_ROUTE,protectionSheets,resolveRoute} from '../src/protection.js';
import {PENDING_PREFIX,isPendingItem,pendingRecord,pendingStatus} from '../src/pending.js';
import {sheetEmbed} from '../src/lib.js';
const menus=JSON.parse(await readFile(new URL('../menu.json',import.meta.url),'utf8'));
const sources=JSON.parse(await readFile(new URL('../src/original-sources.json',import.meta.url),'utf8'));
test('Products contains exactly the 13 requested pages, with no duplicate protection branches',()=>{
 const children=menus.filter(m=>m.path.startsWith(PRODUCT_ROOT));
 assert.deepEqual(children.map(m=>m.label),['Setting OCR / GFR','Setting UFR','Setting Sectionalizer','Data Screening Keypoint','Fault Locator','Feeder Underbuilt','Jurnal DCC','Sectionalizer Solution','Recloser Solution','Relay Solution','3 Way Solution','SOP dan IK Proteksi','Pending Item Proteksi']);
 assert.equal(new Set(menus.map(m=>m.path)).size,menus.length);
 assert.ok(!menus.some(m=>m.path.startsWith('proteksi-meter/solutions')));
 assert.ok(menus.some(m=>m.path==='pemeliharaan-em/products/jadwal-padam'));
});
test('old bookmarks open the relocated pages and OCR path is preserved',()=>{
 assert.equal(resolveRoute('proteksi-meter/solutions/relay-solution'),PRODUCT_ROOT+'relay-solution');
 assert.equal(resolveRoute('proteksi-meter/sop-dan-ik-proteksi'),PRODUCT_ROOT+'sop-dan-ik-proteksi');
 assert.equal(resolveRoute('proteksi-meter/pending-item-proteksi'),PENDING_ROUTE);
 assert.equal(resolveRoute(PRODUCT_ROOT+'settings-ocr-gfr-20-kv'),PRODUCT_ROOT+'settings-ocr-gfr-20-kv');
});
test('new Sheets retain their selected tabs and each original reference has resources',()=>{
 assert.match(sheetEmbed(protectionSheets[PRODUCT_ROOT+'data-screening-keypoint']),/gid=105127280$/);
 assert.match(sheetEmbed(protectionSheets[PRODUCT_ROOT+'jurnal-dcc']),/gid=946304004$/);
 assert.equal(Object.keys(sources).length,5);
 for(const [path,source] of Object.entries(sources)){
  assert.ok(menus.some(m=>m.path===path));
  assert.ok(source.url.startsWith('https://sites.google.com/view/harpro-up2dkalbar/'));
  assert.ok(source.resources.length);
  for(const resource of source.resources)assert.ok(resource.embed.startsWith('https://drive.google.com/'));
 }
});
const fields={title:' Indikator trip padam · GH Merauke ',owner:' Tim Proteksi ',start:'2026-11-25',end:'2026-11-26',progress:'0',priority:'Tinggi'};
test('findings fit the existing shared task schema and stay separate from monitoring tasks',()=>{
 const row=pendingRecord(fields,PENDING_PREFIX+'test');
 assert.ok(isPendingItem(row));assert.ok(!isPendingItem({id:'ordinary-task'}));
 assert.equal(row.title,'Indikator trip padam · GH Merauke');assert.equal(row.owner,'Tim Proteksi');assert.equal(row.team,'Proteksi & Meter');
 assert.equal(row.progress,0);assert.equal(pendingStatus(0),'Terbuka');assert.equal(pendingStatus(50),'Dalam tindak lanjut');assert.equal(pendingStatus(100),'Selesai');
});
test('invalid finding dates, status, oversized fields, or unscoped IDs are rejected',()=>{
 for(const changed of [{end:'2026-11-24'},{start:'2026-02-30'},{progress:'25'},{title:' '.repeat(5)},{title:'x'.repeat(101)},{owner:''},{priority:'Urgent'}])assert.throws(()=>pendingRecord({...fields,...changed},PENDING_PREFIX+'test'));
 assert.throws(()=>pendingRecord(fields,'ordinary-task'));
});
