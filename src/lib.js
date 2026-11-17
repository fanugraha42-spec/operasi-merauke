export function sheetEmbed(input) {
 const u=new URL(input);
 if(u.protocol!=='https:'||u.hostname!=='docs.google.com') throw new Error('Gunakan tautan HTTPS Google Sheets.');
 const m=u.pathname.match(/^\/spreadsheets\/d\/([\w-]+)(?:\/|$)/);
 if(!m) throw new Error('Tautan spreadsheet tidak valid.');
 if(m[1]==='e' && u.pathname.includes('/pubhtml')) return u.href;
 const gid=u.searchParams.get('gid')||new URLSearchParams(u.hash.slice(1)).get('gid')||'0';
 if(!/^\d+$/.test(gid)) throw new Error('ID tab spreadsheet tidak valid.');
 return `https://docs.google.com/spreadsheets/d/${m[1]}/preview/sheet?gid=${gid}`;
}
export const dayDiff=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
export function timelinePosition(task,start,days){
 const left=Math.max(0,dayDiff(start,task.start)), right=Math.min(days,dayDiff(start,task.end)+1);
 return right<=left?null:{left:left/days*100,width:(right-left)/days*100};
}
export function loadLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
