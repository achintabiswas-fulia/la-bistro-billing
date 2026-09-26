/* La Bistro Billing — shared cloud sync. */
(()=>{'use strict';
const B=window.LB;if(!B)return;
const CLOUD={url:'https://hzlnqiojekckaywjyhcy.supabase.co',key:'sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl',store:'la-bistro'};B.cloud=CLOUD;
const ep=()=>CLOUD.url+'/rest/v1/la_bistro_sales';
const hd=()=>({apikey:CLOUD.key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'});
function merge(a,b){const m=new Map();[...(a||[]),...(b||[])].forEach(x=>{if(x?.id)m.set(String(x.id),x)});return [...m.values()].sort((x,y)=>String(x.at||'').localeCompare(String(y.at||'')))}
async function remote(){const r=await fetch(ep()+'?store_id=eq.'+encodeURIComponent(CLOUD.store)+'&order=created_at.asc',{headers:hd(),cache:'no-store'});if(!r.ok)throw Error(await r.text());return(await r.json()).map(x=>x.sale).filter(Boolean)}
async function pushRows(rows){if(!rows.length)return true;const r=await fetch(ep()+'?on_conflict=id',{method:'POST',headers:hd(),body:JSON.stringify(rows)});if(!r.ok)throw Error(await r.text());return true}
async function push(){const local=Array.isArray(B.sales)?B.sales:[];return pushRows(local.map(s=>({id:String(s.id),store_id:CLOUD.store,sale:s,created_at:s.at||new Date().toISOString()})))}
async function pull(){try{B.sales=merge(B.sales||[],await remote());B.save?.('lb_sales_v2',B.sales);window.renderSales?.();window.renderReports?.();return true}catch(e){console.error('Cloud sales sync:',e);return false}}
window.lbCloudPush=async()=>{try{await push();return true}catch(e){console.error('Cloud push:',e);return false}};
window.lbCloudPull=pull;
window.addEventListener('load',()=>setTimeout(async()=>{await pull();setInterval(pull,15000)},1200));
})();