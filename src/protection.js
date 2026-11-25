export const PRODUCT_ROOT='proteksi-meter/products/';
export const PENDING_ROUTE=PRODUCT_ROOT+'pending-item-proteksi';
export const protectionSheets={
 [PRODUCT_ROOT+'data-screening-keypoint']:'https://docs.google.com/spreadsheets/d/1e7tDeyT8mFmpYdj06IqF8zzSb5SlYoR3tLfxev7hO80/edit?gid=105127280#gid=105127280',
 [PRODUCT_ROOT+'jurnal-dcc']:'https://docs.google.com/spreadsheets/d/1URLWrbnzua0iJxtBEXE2k2JXQIwufzW5EQqcqDlxtYI/edit?gid=946304004#gid=946304004'
};
export const routeAliases={
 'proteksi-meter/solutions': 'proteksi-meter/products',
 ...Object.fromEntries(['sectionalizer-solution','recloser-solution','relay-solution','3-way-solution'].map(slug=>['proteksi-meter/solutions/'+slug,PRODUCT_ROOT+slug])),
 'proteksi-meter/sop-dan-ik-proteksi':PRODUCT_ROOT+'sop-dan-ik-proteksi',
 'proteksi-meter/pending-item-proteksi':PENDING_ROUTE
};
export const resolveRoute=path=>routeAliases[path]||path;
