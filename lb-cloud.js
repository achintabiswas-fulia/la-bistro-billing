/* La Bistro Billing — completed bill cloud sync. */
(()=>{'use strict';
const B=window.LB;if(!B)return;
const CLOUD={url:'https://hzlnqiojekckaywjyhcy.supabase.co',key:'sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl',store:'la-bistro'};B.cloud=CLOUD;
const ep=()=>CLOUD.url+'/rest/v1/la_bistro_sales';
const hd=()=>({apikey:CLOUD.key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'});
const num=v=>Number(v)||0;
const money=v=>Math.round(num(v)*100)/100;
function billNow(){
 const cart=B.cart||window.cart||{};const ks=Object.keys(cart);if(!ks.length)return null;
 const items=ks.map(k=>{const x=cart[k]||{};return {id:k,name:x.name||k,bn:x.bn||x.bengali||'',price:num(x.price),qty:num(x.qty)} }).filter(x=>x.qty>0);
 if(!items.length)return null;
 items.forEach(x=>x.total=money(x.price*x.qty));
 const subtotal=money(items.reduce((a,x)=>a+x.total,0));
 const dEl=document.querySelector('#discount, #discountPercent, #discountInput');
 const gEl=document.querySelector('#gst, #gstPercent, #gstInput');
 const discountPct=num(dEl?.value),gstPct=num(gEl?.value);
 const discount=money(subtotal*discountPct/100),gst=money((subtotal-discount)*gstPct/100),total=money(subtotal-discount+gst);
 const phone=(document.getElementById('customerPhone')?.value||'').trim();
 return {id:'LB-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),at:new Date().toISOString(),items,subtotal,discountPct,discount,gstPct,gst,total,payment:B.payment||B.paymentMethod||'Cash',customerPhone:phone};
}
function merge(a,b){const m=new Map();[...(a||[]),...(b||[])].forEach(x=>{if(x?.id)m.set(String(x.id),x)});return [...m.values()].sort((x,y)=>String(x.at||'').localeCompare(String(y.at||'')))}
async function remote(){const r=await fetch(ep()+'?store_id=eq.'+encodeURIComponent(CLOUD.store)+'&order=created_at.asc',{headers:hd(),cache:'no-store'});if(!r.ok)throw Error(await r.text());return (await r.json()).map(x=>x.sale).filter(Boolean)}
async function saveBill(s){B.sales=merge(B.sales||[],[s]);B.save?.('lb_sales_v2',B.sales);const r=await fetch(ep()+'?on_conflict=id',{method:'POST',headers:hd(),body:JSON.stringify([{id:s.id,store_id:CLOUD.store,sale:s,created_at:s.at}])});if(!r.ok)throw Error(await r.text());window.renderSales?.();window.renderReports?.();}
async function pull(){try{B.sales=merge(B.sales||[],await remote());B.save?.('lb_sales_v2',B.sales);window.renderSales?.();window.renderReports?.();}catch(e){console.error('Cloud sales sync:',e)}}
window.lbCloudPull=pull;
let installed=false;
function install(){if(installed)return;installed=true;document.addEventListener('click',e=>{const el=e.target.closest('button,a');if(!el)return;const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(!t.includes('print bill')&&!t.includes('whatsapp bill'))return;const s=billNow();if(s)saveBill(s).catch(err=>console.error('Bill save:',err));},true)}
window.addEventListener('load',()=>setTimeout(()=>{install();pull();setInterval(pull,15000)},1200));
})();
