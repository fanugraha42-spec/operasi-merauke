import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const sources=JSON.parse(await readFile(new URL('../src/original-sources.json',import.meta.url),'utf8'));
const menus=JSON.parse(await readFile(new URL('../menu.json',import.meta.url),'utf8'));
const pages=menus.filter(m=>m.path==='support/wiring-diagram-keypoint'||m.path.startsWith('support/manual-book-')||m.path==='support/software'||m.path.startsWith('support/software/'));
test('all 18 requested Support pages retain their original source and nonempty catalogs',()=>{
 assert.equal(pages.length,18);
 for(const page of pages){const source=sources[page.path];assert.equal(source.url,'https://sites.google.com/view/harpro-up2dkalbar/'+page.path);assert.ok(source.resources.length>0);assert.ok(source.resources.every(r=>r.title.trim()&&r.url.startsWith('https://')));}
});
test('previews refer to the same source file or folder, never a replacement document',()=>{
 for(const page of pages)for(const r of sources[page.path].resources){
  if(!r.embed)continue;
  const file=r.url.match(/\/file\/d\/([\w-]+)/),folder=r.url.match(/\/folders\/([\w-]+)/);
  if(file)assert.ok(r.embed.includes('/'+file[1]+'/'));
  if(folder)assert.equal(new URL(r.embed).searchParams.get('id'),folder[1]);
  assert.ok(['drive.google.com','docs.google.com'].includes(new URL(r.embed).hostname));
 }
});
test('Software includes vendor downloads and preserves all twelve submenu catalogs',()=>{
 assert.equal(pages.filter(p=>p.path.startsWith('support/software/')).length,12);
 const catalog=sources['support/software'].resources;
 assert.ok(catalog.some(r=>new URL(r.url).hostname==='www.se.com'&&!r.embed));
 assert.ok(sources['support/software/connectivity-package-abb'].resources.some(r=>new URL(r.url).hostname==='new.abb.com'&&!r.embed));
});
