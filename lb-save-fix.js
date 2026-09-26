/* La Bistro: final-bill actions only.
   PRINT BILL and WHATSAPP BILL save the CURRENT cart once, sync it to Supabase,
   then clear the current bill. Save Sale and every other control are untouched.
*/
(()=>{
'use strict';
const CLOUD_URL='https://hzlnqiojekckawjyhcy.supabase.co';
const CLOUD_KEY='sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl';
const STORE_ID='la-bistro';
let finalBusy=false;

function getCart(){
  try{
    const fresh=window.__freshCart;
    if(fresh && Object.keys(fresh).length) return fresh;
    if(typeof cart!=='undefined' && cart && Object.keys(cart).length) return cart;
  }catch(e){}
  if(window.cart && Object.keys(window.cart).length) return window.cart;
  return window.__freshCart||{};
}
function getItems(){
  const c=getCart();
  return Object.keys(c).map(k=>{
    const x=c[k]||{}, it=x.item||[];
    return {en:String(it[0]||x.en||''),bn:String(it[1]||x.bn||''),price:Number(it[2]??x.price??0),qty:Number(x.qty||0)};
  }).filter(x=>x.en&&x.qty>0);
}
function num(id, fallback=0){return Math.max(0,Number(document.getElementById(id)?.value||fallback)||0)}
function currentSale(){
  const items=getItems();
  if(!items.length)return null;
  const subtotal=items.reduce((s,x)=>s+x.price*x.qty,0);
  const fresh=!!(window.__freshCart&&Object.keys(window.__freshCart).length);
  let discountPct=num(fresh?'freshDiscount':'lbDiscountPct',0);
  if(!discountPct) discountPct=num('discount',0);
  const discount=Math.min(subtotal,subtotal*discountPct/100);
  const gst=num(fresh?'freshGst':'gst',0);
  const tax=Math.max(0,subtotal-discount)*gst/100;
  const total=Math.max(0,subtotal-discount)+tax;
  let payment='Cash';
  try{
    if(fresh) payment=document.querySelector('.fresh-pay.active')?.dataset.pay||'Cash';
    else payment=String(window.payment||document.querySelector('.payment.active')?.textContent||'Cash').split('/')[0].trim()||'Cash';
  }catch(e){}
  const customer=(document.getElementById('customer')?.value||'Customer').trim()||'Customer';
  const phone=(document.getElementById('customerPhone')?.value||'').trim();
  const table=(document.getElementById('table')?.value||'-').trim()||'-';
  const orderType=(document.getElementById('orderType')?.value||'Dine In').trim()||'Dine In';
  const at=new Date().toISOString();
  const id='LB-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
  return {id,at,customer,phone,table,orderType,payment,items,subtotal,discountPct,discount,gst:gst,taxRate:gst,tax,total,_sig:id};
}
function localAdd(s){
  const LB=window.LB;
  if(!LB)return false;
  LB.sales=Array.isArray(LB.sales)?LB.sales:[];
  LB.sales.push(s);
  if(typeof LB.save==='function')LB.save('lb_sales_v2',LB.sales);else localStorage.setItem('lb_sales_v2',JSON.stringify(LB.sales));
  try{window.renderSales?.();window.renderReports?.()}catch(e){}
  return true;
}
async function cloudAdd(s){
  const r=await fetch(CLOUD_URL+'/rest/v1/la_bistro_sales?on_conflict=id',{
    method:'POST',
    headers:{apikey:CLOUD_KEY,Authorization:'Bearer '+CLOUD_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({id:s.id,store_id:STORE_ID,sale:s,created_at:s.at})
  });
  if(!r.ok)throw new Error('Cloud save failed '+r.status+': '+await r.text());
}
function clearCurrentBill(){
  try{
    const c=getCart();
    Object.keys(c).forEach(k=>delete c[k]);
  }catch(e){}
  try{if(window.__freshCart)Object.keys(window.__freshCart).forEach(k=>delete window.__freshCart[k])}catch(e){}
  ['discount','gst','lbDiscountPct','freshDiscount','freshGst'].forEach(id=>{const x=document.getElementById(id);if(x)x.value=0});
  try{window.renderMenu?.();window.renderCart?.();window.injectLBMenu?.();window.renderFreshBill?.()}catch(e){}
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function printSaved(s){
  if(typeof window.LB?.print==='function'){window.LB.print(s);return}
  const rows=s.items.map(x=>`<tr><td>${x.qty}</td><td>${esc(x.en)}<br><small>${esc(x.bn)}</small></td><td>₹${(x.qty*x.price).toFixed(0)}</td></tr>`).join('');
  const h=`<!doctype html><html><head><meta charset="utf-8"><title>La Bistro Bill</title><style>@page{size:58mm auto;margin:0}body{width:58mm;margin:0 auto;font:10px Arial;color:#000}h2{text-align:center;margin:3px 0}table{width:100%;border-collapse:collapse}td{padding:3px 0;border-bottom:1px dotted #888;vertical-align:top}.r{text-align:right}.big{font-size:14px;font-weight:bold}</style></head><body><h2>LA BISTRO</h2><div style="text-align:center">Multi Cuisine Family Restaurant<br>${esc(s.orderType)} • ${esc(s.table)}<br>${s.id}</div><hr><table><tr><td>Qty</td><td>Item</td><td>Total</td></tr>${rows}</table><hr><div class="r">Subtotal: ₹${s.subtotal.toFixed(0)}<br>Discount: ₹${s.discount.toFixed(0)}<br>GST: ₹${s.tax.toFixed(0)}<br><span class="big">TOTAL: ₹${s.total.toFixed(0)}</span></div><p>Payment: ${esc(s.payment)}</p><center>Thank you / ধন্যবাদ</center><script>onload=()=>window.print()<\/script></body></html>`;
  const w=window.open('','_blank');if(!w){alert('Please allow pop-ups to print. The bill is already saved.');return}w.document.open();w.document.write(h);w.document.close();
}
function whatsappSaved(s){
  let phone=String(s.phone||'').replace(/\D/g,'');
  if(phone.startsWith('0'))phone=phone.slice(1);
  if(phone.length===10)phone='91'+phone;
  if(phone.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return false}
  const lines=s.items.map(x=>`• ${x.en} / ${x.bn} × ${x.qty} = ₹${(x.qty*x.price).toFixed(0)}`).join('\n');
  const msg=`LA BISTRO\nলা বিস্ট্রো\nMulti Cuisine Family Restaurant\n\nCustomer: ${s.customer}\nBill: ${s.id}\n\n${lines}\n\nSubtotal: ₹${s.subtotal.toFixed(0)}\nDiscount: ₹${s.discount.toFixed(0)}\nGST: ₹${s.tax.toFixed(0)}\nTOTAL: ₹${s.total.toFixed(0)}\nPayment: ${s.payment}\n\nThank you / ধন্যবাদ`;
  const w=window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank');
  if(!w){alert('Please allow pop-ups to open WhatsApp. The bill is already saved.');return false}
  return true;
}
async function finalize(mode,button){
  if(finalBusy)return;
  const s=currentSale();
  if(!s){alert('Add items first / আগে আইটেম যোগ করুন');return}
  finalBusy=true;
  if(button)button.disabled=true;
  try{
    localAdd(s);
    await cloudAdd(s);
    if(mode==='print')printSaved(s);else if(!whatsappSaved(s)){finalBusy=false;if(button)button.disabled=false;return}
    clearCurrentBill();
    try{window.LB?.toast?.('Bill saved to Today Sales / বিল আজকের বিক্রয়ে সেভ হয়েছে')}catch(e){}
  }catch(e){
    console.error('La Bistro final bill save:',e);
    alert('Bill was not saved. Please try again.');
  }finally{
    finalBusy=false;
    if(button)button.disabled=false;
  }
}
function wire(){
  window.printReceipt=()=>finalize('print',document.querySelector('#lbPrint'));
  window.sendWhatsAppBill=()=>finalize('whatsapp',document.querySelector('#lbWhatsApp')||null);
  const p=document.getElementById('lbPrint');if(p){p.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();finalize('print',p)}}
  const w=document.getElementById('lbWhatsApp');if(w){w.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();finalize('whatsapp',w)}}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(t.includes('print bill')){e.preventDefault();e.stopImmediatePropagation();finalize('print',b)}
    else if(t.includes('whatsapp bill')){e.preventDefault();e.stopImmediatePropagation();finalize('whatsapp',b)}
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(wire,100));else setTimeout(wire,100);
window.addEventListener('load',()=>setTimeout(wire,500));

/* Hide the accidental source-code text rendered below the app. This does not touch app controls. */
function hideAccidentalSourceText(){
  const root=document.body;
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const remove=[];
  let n;
  while(n=walker.nextNode()){
    const t=(n.nodeValue||'');
    if(t.includes('function printReceipt(){') || t.includes('function sendWhatsAppBill(){') || t.includes('const keys=Object.keys(cart)')) remove.push(n);
  }
  remove.forEach(x=>x.parentNode?.removeChild(x));
}
const sourceObserver=new MutationObserver(hideAccidentalSourceText);
if(document.body) sourceObserver.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hideAccidentalSourceText); else setTimeout(hideAccidentalSourceText,0);
})();