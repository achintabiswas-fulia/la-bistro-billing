/* La Bistro Billing — shared cloud sync for sales, menu, stock and customers. */
(()=>{'use strict';
const B=window.LB;if(!B)return;
const CLOUD={url:'https://hzlnqiojekckaywjyhcy.supabase.co',key:'sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl',store:'la-bistro'};B.cloud=CLOUD;
const salesEp=()=>CLOUD.url+'/rest/v1/la_bistro_sales';
const storeEp=()=>CLOUD.url+'/rest/v1/la_bistro_store';
const hd=()=>({apikey:CLOUD.key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'});
function merge(a,b){const m=new Map();[...(a||[]),...(b||[])].forEach(x=>{if(x?.id)m.set(String(x.id),x)});return [...m.values()].sort((x,y)=>String(x.at||'').localeCompare(String(y.at||'')))}
async function remoteSales(){const r=await fetch(salesEp()+'?store_id=eq.'+encodeURIComponent(CLOUD.store)+'&order=created_at.asc',{headers:hd(),cache:'no-store'});if(!r.ok)throw Error(await r.text());return(await r.json()).map(x=>x.sale).filter(Boolean)}
async function pushSales(rows){if(!rows.length)return true;const r=await fetch(salesEp()+'?on_conflict=id',{method:'POST',headers:hd(),body:JSON.stringify(rows)});if(!r.ok)throw Error(await r.text());return true}
async function pushSalesOnly(){const local=Array.isArray(B.sales)?B.sales:[];return pushSales(local.map(s=>({id:String(s.id),store_id:CLOUD.store,sale:s,created_at:s.at||new Date().toISOString()})))}
async function remoteStore(){const r=await fetch(storeEp()+'?store_id=eq.'+encodeURIComponent(CLOUD.store)+'&select=payload,updated_at',{headers:hd(),cache:'no-store'});if(!r.ok)throw Error(await r.text());const a=await r.json();return a[0]?.payload||{}}
async function pushStore(){const payload={customItems:Array.isArray(B.customItems)?B.customItems:[],stock:B.stock||{},customers:B.customers||{}};const r=await fetch(storeEp()+'?on_conflict=store_id',{method:'POST',headers:hd(),body:JSON.stringify({store_id:CLOUD.store,payload,updated_at:new Date().toISOString()})});if(!r.ok)throw Error(await r.text());return true}
async function pull(){try{const rs=await remoteSales();B.sales=merge(B.sales||[],rs);B.save?.('lb_sales_v2',B.sales);const p=await remoteStore();if(Array.isArray(p.customItems)){const map=new Map();[...(B.customItems||[]),...p.customItems].forEach(x=>{if(x?.id)map.set(String(x.id),x)});B.customItems=[...map.values()];B.save?.('lb_custom_menu_v2',B.customItems)}if(p.stock&&typeof p.stock==='object'){B.stock={...(p.stock||{}),...(B.stock||{})};B.save?.('lb_stock_v2',B.stock)}if(p.customers&&typeof p.customers==='object'){B.customers={...(p.customers||{}),...(B.customers||{})};B.save?.('lb_customers_v2',B.customers)}window.renderSales?.();window.renderReports?.();window.renderMenu?.();window.injectLBMenu?.();return true}catch(e){console.error('Cloud pull:',e);return false}}
async function pushAll(){try{await pushSalesOnly();await pushStore();return true}catch(e){console.error('Cloud push:',e);return false}}
window.lbCloudPush=pushAll;window.lbCloudPull=pull;
window.addEventListener('load',()=>setTimeout(async()=>{await pushAll();await pull();setInterval(async()=>{await pushAll();await pull()},10000)},1200));
})();
