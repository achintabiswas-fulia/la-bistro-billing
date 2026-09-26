/* La Bistro Billing — shared cloud sales sync for 10 phones */
(()=>{'use strict';const B=window.LB;
const DEFAULT_CLOUD={url:'https://hzlnqiojekckaywjyhcy.supabase.co',key:'sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl',store:'la-bistro'};
const configured=()=>!!(B?.cloud?.url&&B?.cloud?.key);
const headers=()=>({apikey:B.cloud.key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'});
const base=()=>B.cloud.url.replace(/\/$/,'')+'/rest/v1/';
const storeEndpoint=()=>base()+'la_bistro_store';
const salesEndpoint=()=>base()+'la_bistro_sales';
function mergeSales(local,remote){const m=new Map();[...(remote||[]),...(local||[])].forEach(x=>{if(x?.id)m.set(x.id,x)});return [...m.values()].sort((a,b)=>String(a.at||'').localeCompare(String(b.at||'')))}
function mergeCustomers(local,remote){const out={...(remote||{})};for(const [k,v] of Object.entries(local||{})){const r=out[k];if(!r){out[k]=v;continue}out[k]={...r,...v,total:Math.max(Number(r.total||0),Number(v.total||0)),visits:Math.max(Number(r.visits||0),Number(v.visits||0)),lastAt:String(r.lastAt||'')>String(v.lastAt||'')?r.lastAt:v.lastAt}}return out}
async function getStore(){if(!configured())return null;const r=await fetch(storeEndpoint()+'?store_id=eq.'+encodeURIComponent(B.cloud.store||'la-bistro'),{headers:headers(),cache:'no-store'});if(!r.ok)throw Error(await r.text());const a=await r.json();return a[0]||null}
async function getRemoteSales(){if(!configured())return [];const r=await fetch(salesEndpoint()+'?store_id=eq.'+encodeURIComponent(B.cloud.store||'la-bistro')+'&order=created_at.asc',{headers:headers(),cache:'no-store'});if(!r.ok)throw Error(await r.text());const a=await r.json();return (a||[]).map(x=>x.sale).filter(Boolean)}
async function push(){if(!configured())return false;try{
 const row=await getStore();const rp=row?.payload||{};let remoteSales=[];try{remoteSales=await getRemoteSales()}catch(e){console.warn('Sales pull before push:',e)}
 const allSales=mergeSales(mergeSales(B.sales,rp.sales),remoteSales);
 if(allSales.length){
   const rows=allSales.map(s=>({id:s.id,store_id:B.cloud.store||'la-bistro',sale:s,created_at:s.at||new Date().toISOString()}));
   const sr=await fetch(salesEndpoint()+'?on_conflict=id',{method:'POST',headers:headers(),body:JSON.stringify(rows)});
   if(!sr.ok)throw Error('Sales save: '+await sr.text());
 }
 B.sales=allSales;B.save('lb_sales_v2',B.sales);
 B.customers=mergeCustomers(B.customers,rp.customers||{});B.stock={...(rp.stock||{}),...(B.stock||{})};B.customItems=B.customItems?.length?B.customItems:(rp.customItems||[]);
 B.save('lb_stock_v2',B.stock);B.save('lb_customers_v2',B.customers);B.save('lb_custom_menu_v2',B.customItems);
 const payload={sales:allSales,stock:B.stock,customers:B.customers,customItems:B.customItems};
 const rr=await fetch(storeEndpoint()+'?on_conflict=store_id',{method:'POST',headers:headers(),body:JSON.stringify({store_id:B.cloud.store||'la-bistro',payload,updated_at:new Date().toISOString()})});
 if(!rr.ok)console.warn('Store metadata save:',await rr.text());
 return true;
 }catch(e){console.warn('Cloud push:',e);B.toast?.('Cloud save error — bill kept');return false}}
async function pull(silent=false){if(!configured())return false;try{
 const row=await getStore();const d=row?.payload||{};let remoteSales=[];try{remoteSales=await getRemoteSales()}catch(e){console.warn('Sales pull:',e)}
 const merged=mergeSales(mergeSales(B.sales,d.sales||[]),remoteSales);B.sales=merged;B.stock={...(B.stock||{}),...(d.stock||{})};B.customers=mergeCustomers(B.customers,d.customers||{});B.customItems=(B.customItems?.length?B.customItems:(d.customItems||[]));
 B.save('lb_sales_v2',B.sales);B.save('lb_stock_v2',B.stock);B.save('lb_customers_v2',B.customers);B.save('lb_custom_menu_v2',B.customItems);window.renderMenu?.();window.renderCart?.();if(!silent)B.toast?.('Cloud data synced');return true;
 }catch(e){if(!silent)B.toast?.('Cloud sync error');console.warn('Cloud pull:',e);return false}}
window.lbCloudPush=push;window.lbCloudPull=pull;
window.saveLBCloud=async()=>{B.cloud={url:clUrl.value.trim().replace(/\/$/,''),key:clKey.value.trim(),store:clStore.value.trim()||'la-bistro'};B.save('lb_cloud_v2',B.cloud);if(!configured())return B.toast('Enter Supabase URL and publishable key');const ok=await pull(true);const up=await push();B.toast(ok&&up?'Cloud connected':'Cloud connection failed')};
window.renderLBCloud=()=>{lbContent.innerHTML=`<h3>☁️ Shared Sales — 10 Phones</h3><p class=lbNote>Sales are stored as individual bills in the shared cloud database, so bills from multiple phones are kept separately. Store ID: la-bistro.</p><label>Supabase Project URL<input class=lbInput id="clUrl" value="${B.esc(B.cloud.url)}"></label><label>Publishable key<input class=lbInput id="clKey" value="${B.esc(B.cloud.key)}"></label><label>Store ID<input class=lbInput id="clStore" value="${B.esc(B.cloud.store||'la-bistro')}"></label><div class=lbActions><button onclick="saveLBCloud()">Connect / Save</button><button onclick="lbCloudPull()">Sync Now</button></div><p class=lbNote>Print or WhatsApp uses the normal locked billing action. The bill is saved to Today’s Sales and cloud before the current bill is cleared.</p>`};
window.addEventListener('load',()=>setTimeout(async()=>{B.cloud=DEFAULT_CLOUD;B.save('lb_cloud_v2',B.cloud);if(configured()){await pull(true);await push();setInterval(async()=>{await pull(true)},15000)}},1200));
})();
