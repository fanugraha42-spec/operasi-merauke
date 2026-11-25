export const TASK_CATEGORIES=[
 {id:'proteksi',label:'Proteksi'},
 {id:'scada-telekomunikasi',label:'SCADA dan Telekomunikasi'},
 {id:'jasa-pekerjaan',label:'Jasa Pekerjaan'},
 {id:'material-penunjang',label:'Material Penunjang'},
 {id:'pelayanan-teknik',label:'Pelayanan Teknik'}
];
export const taskCategory=task=>TASK_CATEGORIES.some(c=>c.id===task.category)?task.category:'proteksi';
export const categoryLabel=task=>TASK_CATEGORIES.find(c=>c.id===taskCategory(task)).label;
export function categorySummary(tasks){return TASK_CATEGORIES.map(category=>{
 const rows=tasks.filter(t=>taskCategory(t)===category.id);
 return {...category,total:rows.length,planned:rows.filter(t=>t.progress===0).length,active:rows.filter(t=>t.progress>0&&t.progress<100).length,completed:rows.filter(t=>t.progress===100).length,average:rows.length?rows.reduce((sum,t)=>sum+t.progress,0)/rows.length/100:0};
});}
