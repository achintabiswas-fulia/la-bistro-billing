/* La Bistro customer fields + print/WhatsApp fix v69. */
(()=>{
'use strict';
const BOX='lbCustomerV69';
const HIDDEN_NAME='customer';
const HIDDEN_PHONE='customerPhone';
let busy=false;
let lastHasItems=false;
const $=id=>document.getElementById(id);
function cartEl(){return document.querySelector('.cart')||document.querySelector('[class~="cart"]')}
function hasItems(){
 try{
  const c=window.__freshCart&&Object.keys(window.__freshCart).length?window.__freshCart:(window.cart||{});
  return Object.keys(c||{}).some(k=>Number(c[k]?.qty||0)>0);
 }catch(_){return !!document.querySelector('.cart-row')}
}
function hiddenFields(){
 let n=$(HIDDEN_NAME),p=$(HIDDEN_PHONE);
 if(!n){n=document.createElement('input');n.id=HIDDEN_NAME;n.type='text';n.style.cssText='position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;opacity:0!important';document.body.appendChild(n)}
 if(!p){p=document.createElement('input');p.id=HIDDEN_PHONE;p.type='tel';p.style.cssText='position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;opacity:0!important';document.body.appendChild(p)}
 return{n,p};
}
function style(){
 if($('lbCustomerV69Style'))return;
 const s=document.createElement('style');s.id='lbCustomerV69Style';
 s.textContent=`#${BOX}{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;box-sizing:border-box!important;background:#fff8df!important;border:1px solid #c8a94e!important;border-radius:10px!important;padding:10px!important;margin:0 0 10px!important;color:#111!important;position:relative!important;z-index:99999!important;flex:none!important}#${BOX} .v69-title{font-weight:800!important;font-size:17px!important;line-height:1.25!important;margin:0 0 9px!important;color:#111!important}#${BOX} .v69-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important;width:100%!important}#${BOX} input{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;min-width:0!important;height:45px!important;box-sizing:border-box!important;padding:9px 11px!important;border:1px solid #b8953b!important;border-radius:8px!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;font:15px Arial,sans-serif!important;outline:none!important}#${BOX} input::placeholder{color:#666!important;opacity:1!important}@media(max-width:560px){#${BOX} .v69-grid{grid-template-columns:1fr!important}}`;
 document.head.appendChild(s);
}
function build(){
 if(document.getElementById('customer')&&document.getElementById('customerPhone')) return true;
 const cart=cartEl();if(!cart)return false;
 style();
 const {n,p}=hiddenFields();
 let b=$(BOX);
 if(!b){
  b=document.createElement('section');b.id=BOX;
  b.innerHTML='<div class="v69-title">Customer Details / কাস্টমারের তথ্য</div><div class="v69-grid"><input id="v69Name" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="v69Phone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel"></div>';
  cart.insertBefore(b,cart.firstChild);
  $('v69Name').addEventListener('input',e=>n.value=e.target.value);
  $('v69Phone').addEventListener('input',e=>p.value=e.target.value);
 }
 const vn=$('v69Name'),vp=$('v69Phone');
 // A new/empty bill always starts with blank customer fields.
 if(vn&&document.activeElement!==vn&&!lastHasItems){vn.value='';n.value=''}
 if(vp&&document.activeElement!==vp&&!lastHasItems){vp.value='';p.value=''}
 return true;
}
function clearCustomer(){
 const {n,p}=hiddenFields();n.value='';p.value='';
 if($('v69Name'))$('v69Name').value='';
 if($('v69Phone'))$('v69Phone').value='';
}
function phone(){let p=String($('v69Phone')?.value||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;return p}
function snapshot(){
 try{
  const c=window.__freshCart&&Object.keys(window.__freshCart).length?window.__freshCart:(window.cart||{});
  const items=Object.keys(c||{}).map(k=>{const x=c[k]||{},i=x.item||[];return{en:String(i[0]||x.en||''),bn:String(i[1]||x.bn||''),price:Number(i[2]??x.price??0),qty:Number(x.qty||0)}}).filter(x=>x.en&&x.qty>0);
  if(!items.length)return null;
  const subtotal=items.reduce((a,x)=>a+x.price*x.qty,0);
  const dp=Math.max(0,Number($('lbDiscountPct')?.value||$('freshDiscount')?.value||$('discount')?.value||0)||0);
  const discount=Math.min(subtotal,subtotal*dp/100);
  const gp=Math.max(0,Number($('gst')?.value||$('freshGst')?.value||0)||0);
  const gst=Math.max(0,subtotal-discount)*gp/100;
  const customer=String($('v69Name')?.value||'').trim()||'Customer';
  const ph=String($('v69Phone')?.value||'').trim();
  const payment=String(document.querySelector('.payment.active')?.textContent||'Cash').split('/')[0].trim()||'Cash';
  return{id:'LB-'+Date.now().toString(36).toUpperCase(),customer,phone:ph,items,subtotal,discount,gst,total:Math.max(0,subtotal-discount)+gst,payment};
 }catch(e){console.error(e);return null}
}
function whatsapp(s){
 const p=phone();
 if(p.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');$('v69Phone')?.focus();return false}
 let m='LA BISTRO\nলা বিস্ট্রো\n\nBill: '+s.id+'\nCustomer: '+s.customer+'\nWhatsApp: '+s.phone+'\n\n';
 s.items.forEach(x=>m+=x.qty+' x '+x.en+' = ₹'+(x.qty*x.price).toFixed(0)+'\n');
 m+='\nSubtotal: ₹'+s.subtotal.toFixed(0)+'\nDiscount: ₹'+s.discount.toFixed(0)+'\nGST: ₹'+s.gst.toFixed(0)+'\nTOTAL: ₹'+s.total.toFixed(0)+'\nPayment: '+s.payment+'\n\nThank you / ধন্যবাদ';
 const url='https://wa.me/'+p+'?text='+encodeURIComponent(m);
 const w=window.open(url,'_blank');if(!w)location.href=url;return true;
}
function printOnly(s){
 const {n,p}=hiddenFields();n.value=s.customer;p.value=s.phone;
 try{if(typeof window.printReceipt==='function'){window.printReceipt();return true}if(window.LB&&typeof window.LB.print==='function'){window.LB.print(s);return true}window.print();return true}catch(e){console.error(e);return false}
}
async function printBoth(btn){
 if(busy)return;busy=true;if(btn)btn.disabled=true;
 try{
  const s=snapshot();if(!s){alert('Add items first / আগে আইটেম যোগ করুন');return}
  // Open WhatsApp during the original tap so Android does not block the new window.
  whatsapp(s);
  // Print the same customer/bill data.
  printOnly(s);
  // Save only after the print action has been prepared.
  if(window.LB&&typeof window.LB.saveSale==='function')try{await window.LB.saveSale(false)}catch(_){ }
 }finally{busy=false;if(btn)btn.disabled=false}
}
function wire(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('button,[role="button"],[onclick]');if(!b)return;
  const t=(b.textContent||'').replace(/\s+/g,' ').toLowerCase();
  if(t.includes('print bill')||t.includes('বিল প্রিন্ট')){e.preventDefault();e.stopImmediatePropagation();printBoth(b);return}
  if(t.includes('whatsapp bill')||t.includes('হোয়াটসঅ্যাপ বিল')||t.includes('whatsapp')){e.preventDefault();e.stopImmediatePropagation();const s=snapshot();if(s)whatsapp(s);else alert('Add items first / আগে আইটেম যোগ করুন')}
 },true);
}
function start(){
 build();wire();
 [200,500,1000,2000,4000,7000].forEach(t=>setTimeout(build,t));
 const mo=new MutationObserver(()=>{build();const now=hasItems();if(lastHasItems&&!now)clearCustomer();lastHasItems=now});
 mo.observe(document.body,{childList:true,subtree:true});
 setInterval(()=>{build();const now=hasItems();if(lastHasItems&&!now)clearCustomer();lastHasItems=now},1000);
 lastHasItems=hasItems();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
