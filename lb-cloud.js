/* La Bistro Billing — shared cloud sync. Only synchronization logic; billing/UI stays unchanged. */
(()=>{'use strict';
const CLOUD={url:'https://hzlnqiojekckaywjyhcy.supabase.co/functions/v1/lb-sync',key:'LB-SYNC-2026-09-27-7f3c9a21',store:'la-bistro'};
let B=null,timer=null,pushTimer=null,started=false;
const H=()=>({'Content-Type':'application/json','x-lb-key':CLOUD.key});
const waitForLB=()=>new Promise(resolve=>{let n=0;const t=setInterval(()=>{if(window.LB&&typeof window.LB.save==='function'){clearInterval(t);resolve(window.LB)}else if(++n>=200){clearInterval(t);resolve(window.LB||null)}},250)});
const deletedSet=()=>{try{return new Set(JSON.parse(localStorage.getItem('lb_deleted_sales_v1')||'[]').map(String))}catch(e){return new Set()}};
const saveDeleted=a=>{try{localStorage.setItem('lb_deleted_sales_v1',JSON.stringify([...new Set((a||[]).map(String))]))}catch(e){}};
const applyRemote=d=>{if(!B||!d)return;const p=d.store||{};const dels=new Set([...deletedSet(),...(Array.isArray(p.deletedSales)?p.deletedSales:[])].map(String));saveDeleted([...dels]);const rs=Array.isArray(d.sales)?d.sales:[];const sm=new Map();[...(B.sales||[]),...rs].forEach(x=>{if(x?.id!=null&&!dels.has(String(x.id)))sm.set(String(x.id),x)});B.sales=[...sm.values()].sort((a,b)=>String(a.at||'').localeCompare(String(b.at||'')));B.save?.('lb_sales_v2',B.sales);
if(Array.isArray(p.customItems)){const mm=new Map();[...(B.customItems||[]),...p.customItems].forEach(x=>{if(x?.id!=null)mm.set(String(x.id),x)});B.customItems=[...mm.values()];B.save?.('lb_custom_menu_v2',B.customItems)}
if(Array.isArray(p.customCategories)){const cm=new Map();[...(B.customCategories||[]),...p.customCategories].forEach(x=>{const key=String(typeof x==='string'?x:(x?.id??x?.name??x?.en??''));if(key)cm.set(key,x)});B.customCategories=[...cm.values()];B.save?.('lb_custom_categories_v1',B.customCategories)}
if(p.stock&&typeof p.stock==='object'){B.stock={...(B.stock||{}),...p.stock};B.save?.('lb_stock_v2',B.stock)}
if(p.customers&&typeof p.customers==='object'){B.customers={...(B.customers||{}),...p.customers};B.save?.('lb_customers_v2',B.customers)}
if(typeof p.logo==='string'&&p.logo){try{localStorage.setItem('laBistroLogo',p.logo);localStorage.setItem('la_bistro_logo',p.logo)}catch(e){}const img=document.querySelector('header .logo');if(img)img.src=p.logo}
window.renderSales?.();window.renderReports?.();window.renderMenu?.();window.injectLBMenu?.();window.renderCart?.();window.renderCustomMenuItems?.();window.renderCustomCategories?.();window.dispatchEvent(new CustomEvent('lb-cloud-updated'));};
const pullNow=async()=>{if(!B){lastSyncError='Billing module is not ready';return false}try{const r=await fetch(CLOUD.url,{method:'GET',headers:H(),cache:'no-store'});if(!r.ok)throw Error(await r.text());applyRemote(await r.json());return true}catch(e){lastSyncError=String(e?.message||e);console.error('Cloud pull:',e);return false}};
const pushNow=async()=>{if(!B){lastSyncError='Billing module is not ready';return false}if(!navigator.onLine){lastSyncError='Phone is offline';return false}try{const dels=[...deletedSet()];const ds=new Set(dels.map(String));const body={sales:(Array.isArray(B.sales)?B.sales:[]).filter(x=>x?.id!=null&&!ds.has(String(x.id))),store:{customItems:Array.isArray(B.customItems)?B.customItems:[],customCategories:Array.isArray(B.customCategories)?B.customCategories:[],stock:B.stock&&typeof B.stock==='object'?B.stock:{},customers:B.customers&&typeof B.customers==='object'?B.customers:{},logo:(()=>{try{return localStorage.getItem('laBistroLogo')||localStorage.getItem('la_bistro_logo')||''}catch(e){return''}})(),deletedSales:dels}};const r=await fetch(CLOUD.url,{method:'POST',headers:H(),body:JSON.stringify(body),cache:'no-store'});if(!r.ok)throw Error(await r.text());const d=await r.json();applyRemote(d);return true}catch(e){lastSyncError=String(e?.message||e);console.error('Cloud push:',e);return false}};
const syncNow=async()=>{if(!B){lastSyncError='Billing module is not ready';return false}lastSyncError='';const pulled=await pullNow();if(!pulled)return false;const pushed=await pushNow();lastSyncAt=Date.now();lastSyncOk=pushed;if(!pushed&& !lastSyncError)lastSyncError='Cloud save failed';return pushed};
const schedulePush=()=>{clearTimeout(pushTimer);pushTimer=setTimeout(syncNow,500)};
let lastSyncAt=null,lastSyncOk=null,lastSyncError='';
window.renderLBCloud=()=>{
  const box=document.getElementById('lbContent');
  if(!box)return;
  const status=lastSyncOk===true?'Connected / সংযুক্ত':lastSyncOk===false?'Sync failed / সিঙ্ক ব্যর্থ':'Checking connection / সংযোগ পরীক্ষা হচ্ছে';
  const stamp=lastSyncAt?new Date(lastSyncAt).toLocaleString('en-IN'):'Not checked yet / এখনও পরীক্ষা হয়নি';
  box.innerHTML=`<h3>☁️ Cloud / ক্লাউড</h3>
  <p><b>Status / অবস্থা:</b> <span id="lbCloudStatus">${status}</span></p>
  <p><b>Last check / শেষ পরীক্ষা:</b> <span id="lbCloudStamp">${stamp}</span></p>
  <p id="lbCloudError" style="overflow-wrap:anywhere;color:#b00020">${lastSyncError}</p>
  <button class="lbPrimary" id="lbCloudSyncNow">🔄 Sync Now / এখন সিঙ্ক করুন</button>
  <p>Keep both phones connected to the internet. Do not delete bills.</p>`;
  document.getElementById('lbCloudSyncNow').onclick=async()=>{
    const b=document.getElementById('lbCloudSyncNow');
    b.disabled=true;b.textContent='⏳ Syncing…';
    lastSyncError='';
    const ok=await syncNow();
    lastSyncAt=Date.now();lastSyncOk=ok;
    document.getElementById('lbCloudStatus').textContent=ok?'Connected / সংযুক্ত':'Sync failed / সিঙ্ক ব্যর্থ';
    document.getElementById('lbCloudStamp').textContent=new Date(lastSyncAt).toLocaleString('en-IN');
    document.getElementById('lbCloudError').textContent=lastSyncError;
    b.disabled=false;b.textContent='🔄 Sync Now / এখন সিঙ্ক করুন';
  };
};
const start=async()=>{if(started)return;B=await waitForLB();if(!B||typeof B.save!=='function')return;started=true;B.cloud=CLOUD;const originalSave=B.save.bind(B);B.save=function(k,v){const out=originalSave(k,v);if(k==='lb_sales_v2'||k==='lb_custom_menu_v2'||k==='lb_custom_categories_v1'||k==='lb_stock_v2'||k==='lb_customers_v2')schedulePush();return out};window.lbCloudPush=syncNow;window.lbCloudPull=pullNow;await syncNow();timer=setInterval(syncNow,10000);window.addEventListener('online',syncNow);document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncNow()});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();