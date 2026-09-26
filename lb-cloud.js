/* La Bistro Billing — shared cloud sync. Only completed Print/WhatsApp bills are added as sales. */
(()=>{'use strict';const B=window.LB;
const DEFAULT_CLOUD={url:'https://hzlnqiojekckaywjyhcy.supabase.co',key:'sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl',store:'la-bistro'};
const configured=()=>!!(B?.cloud?.url&&B?.cloud?.key);
const headers=()=>({apikey:B.cloud.key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'});
const base=()=>B.cloud.url.replace(/\/$/,'')+'/rest/v1/';
const salesEndpoint=()=>base()+'la_bistro_sales';
const storeEndpoint=()=>base()+'la_bistro_store';
const mergeSales=(a,b)=>{const m=new Map();[...(a||[]),...(b||[])].forEach(s=>{if(s?.id)m.set(String(s.id),s)});return [...m.values()].sort((x,y)=>String(x.at||'').localeCompare(String(y.at||'')))};
async function getRemoteSales(){if(!configured())return [];const r=await fetch(salesEndpoint()+'?store_id=eq.'+encodeURIComponent(B.cloud.store||'la-bistro')+'&order=created_at.asc',{headers:headers(),cache:'no-store'});if(!r.ok)throw Error(await r.text());return(await r.json()).map(x=>x.sale).filter(Boolean)}
async function pushSales(){if(!configured())return false;try{const local=Array.isArray(B.sales)?B.sales:[];const remote=await getRemoteSales();const all=mergeSales(remote,local);if(all.length){const rows=all.map(s=>({id:String(s.id),store_id:B.cloud.store||'la-bistro',sale:s,created_at:s.at||new Date().toISOString()}));const r=await fetch(salesEndpoint()+'?on_conflict=id',{method:'POST',headers:headers(),body:JSON.stringify(rows)});if(!r.ok)throw Error(await r.text())}B.sales=all;B.save('lb_sales_v2',all);return true}catch(e){console.error(e);B.toast?.('Bill was not saved');return false}}
async function pullSales(){try{const all=await getRemoteSales();if(all.length){B.sales=mergeSales(B.sales,all);B.save('lb_sales_v2',B.sales);window.renderSales?.();window.renderReports?.();window.renderCart?.()}return true}catch(e){console.error(e);return false}}
window.lbCloudPush=pushSales;window.lbCloudPull=pullSales;
function install(){if(window.__lbFinalSaveOnly)return;window.__lbFinalSaveOnly=true;document.addEventListener('click',async e=>{const el=e.target.closest('button,a,.btn');if(!el)return;const label=(el.textContent||el.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().toLowerCase();if(!label.includes('print')&&!label.includes('whatsapp'))return;setTimeout(async()=>{await pushSales();setTimeout(()=>{window.renderSales?.();window.renderReports?.()},100)},100)},true)}
window.addEventListener('load',()=>setTimeout(async()=>{B.cloud=DEFAULT_CLOUD;B.save('lb_cloud_v2',B.cloud);if(configured()){await pullSales();setInterval(pullSales,15000)}install()},1200));
})();
