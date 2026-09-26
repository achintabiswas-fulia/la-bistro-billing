/* La Bistro Billing — shared cloud sync + locked completed-bill actions. */
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
function buildSale(){
 const cart=window.cart||{};const keys=Object.keys(cart);if(!keys.length)return null;
 const items=keys.map(k=>{const x=cart[k]||{};const it=x.item||[];return {en:String(it[0]||''),bn:String(it[1]||''),price:Number(it[2]||0),qty:Number(x.qty||0)}}).filter(x=>x.qty>0);
 if(!items.length)return null;
 const subtotal=items.reduce((s,x)=>s+x.qty*x.price,0);
 const dp=Math.max(0,Math.min(100,Number(document.getElementById('lbDiscountPct')?.value||0)));
 const discount=subtotal*dp/100;
 const taxRate=Math.max(0,Number(document.getElementById('gst')?.value||0));
 const tax=(subtotal-discount)*taxRate/100;
 const meta=B.meta?B.meta():{customer:(document.getElementById('customer')?.value||'Customer').trim(),phone:(document.getElementById('customerPhone')?.value||'').trim(),table:(document.getElementById('table')?.value||'-').trim(),orderType:(document.getElementById('orderType')?.value||'Dine In').trim(),payment:window.payment||'Cash'};
 return {id:'LB-'+Date.now().toString(36).toUpperCase(),at:new Date().toISOString(),...meta,items,subtotal,discountPct:dp,discount,taxRate,tax,total:Math.max(0,subtotal-discount)+tax,_sig:'cloud-final-'+Date.now()};
}
function localSave(s){
 B.sales=Array.isArray(B.sales)?B.sales:[];
 B.sales.push(s);B.save?.('lb_sales_v2',B.sales);
 window.renderSales?.();window.renderReports?.();
}
async function saveCurrentImmediately(){
 const s=buildSale();if(!s)return null;
 localSave(s);
 try{await pushRows([{id:String(s.id),store_id:CLOUD.store,sale:s,created_at:s.at}]);}catch(e){console.error('Cloud save failed; local bill is saved:',e)}
 return s;
}
function clearBill(){window.cart={};try{document.getElementById('discount').value=0}catch(e){}try{document.getElementById('gst').value=0}catch(e){}try{document.getElementById('lbDiscountPct').value=0}catch(e){}window.renderMenu?.();window.renderCart?.()}
function sendWhatsApp(s){let phone=String(s.phone||'').replace(/\D/g,'');if(phone.startsWith('0'))phone=phone.slice(1);if(phone.length===10)phone='91'+phone;if(phone.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return false}const lines=(s.items||[]).map(x=>`• ${x.en} / ${x.bn} × ${x.qty} = ${B.money(x.qty*x.price)}`).join('\n');const msg=`LA BISTRO\nলা বিস্ট্রো\nMulti Cuisine Family Restaurant\nPrafullanagar, Belemath, Nadia\nContact: 7811838548\n\nCustomer: ${s.customer||'Customer'}\nBill: ${s.id}\nOrder: ${s.orderType}\nTable: ${s.table}\n\n${lines}\n\nSubtotal: ${B.money(s.subtotal)}\nDiscount (${Number(s.discountPct||0)}%): -${B.money(s.discount)}\nGST (${Number(s.taxRate||0)}%): ${B.money(s.tax)}\nTOTAL: ${B.money(s.total)}\nPayment: ${s.payment}\n\nThank you / ধন্যবাদ`;const w=window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank');if(!w){alert('Please allow pop-ups to open WhatsApp. The bill is already saved.');return false}return true}
window.addEventListener('load',()=>setTimeout(async()=>{
 await pull();
 setInterval(pull,15000);
 // Capture PRINT/WHATSAPP before the existing button handler. This guarantees
 // the current bill is placed in Today's Sales before print/WhatsApp can clear it.
 document.addEventListener('click',async e=>{
   const el=e.target.closest('button');if(!el)return;
   const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
   if(!t.includes('print bill')&&!t.includes('whatsapp bill'))return;
   if(el.dataset.lbFinalSave==='1')return;
   el.dataset.lbFinalSave='1';
   const s=await saveCurrentImmediately();
   if(s){setTimeout(()=>{el.dataset.lbFinalSave='';},1500)}else{el.dataset.lbFinalSave='';}
 },true);
 // Keep the existing tested print/WhatsApp functions available.
 window.printReceipt=()=>{if(typeof B.saveSale==='function')return B.saveSale(true);};
 window.sendWhatsAppBill=()=>{if(typeof B.saveSale==='function')return B.saveSale(false);};
},1200));
})();
