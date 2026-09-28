/* La Bistro customer + WhatsApp v66: keep existing billing logic, restore customer fields and connect them to print/WhatsApp. */
(()=>{
'use strict';
const BOX='lbCustomerV66', NAME='customer', PHONE='customerPhone';
let busy=false;
const $=id=>document.getElementById(id);
function cart(){return document.querySelector('.cart')}
function ensureLegacy(){
  let n=$(NAME),p=$(PHONE);
  if(!n){n=document.createElement('input');n.id=NAME;n.type='text';n.autocomplete='name';n.style.cssText='position:absolute;left:-99999px;width:1px;height:1px;opacity:0';document.body.appendChild(n)}
  if(!p){p=document.createElement('input');p.id=PHONE;p.type='tel';p.autocomplete='tel';p.style.cssText='position:absolute;left:-99999px;width:1px;height:1px;opacity:0';document.body.appendChild(p)}
  return {n,p};
}
function makeBox(){
 const c=cart(); if(!c)return false;
 ensureLegacy();
 let b=$(BOX);
 if(!b){
   b=document.createElement('section'); b.id=BOX;
   b.innerHTML='<div class="v66-title">Customer Details / কাস্টমারের তথ্য</div><div class="v66-grid"><input id="v66Name" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="v66Phone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel"></div>';
   const st=document.createElement('style');st.id='lbCustomerV66Style';st.textContent='#'+BOX+'{display:block!important;visibility:visible!important;opacity:1!important;background:#fff8df!important;border:1px solid #c8a94e!important;border-radius:10px!important;padding:10px!important;margin:0 0 10px!important;color:#111!important;position:relative!important;z-index:100001!important}#'+BOX+' .v66-title{font-weight:800!important;font-size:16px!important;line-height:22px!important;margin-bottom:8px!important;color:#111!important}#'+BOX+' .v66-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}#'+BOX+' input{display:block!important;width:100%!important;height:44px!important;padding:9px 10px!important;border:1px solid #b8953b!important;border-radius:8px!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;font:15px Arial,sans-serif!important}#'+BOX+' input::placeholder{color:#666!important;opacity:1!important}@media(max-width:560px){#'+BOX+' .v66-grid{grid-template-columns:1fr!important}}';document.head.appendChild(st);
   const items=c.querySelector('.cart-items'); if(items)c.insertBefore(b,items); else c.insertBefore(b,c.firstElementChild||null);
   const vn=$('v66Name'),vp=$('v66Phone'),{n,p}=ensureLegacy();
   vn.addEventListener('input',()=>{n.value=vn.value}); vp.addEventListener('input',()=>{p.value=vp.value});
 }
 const {n,p}=ensureLegacy(),vn=$('v66Name'),vp=$('v66Phone');
 if(vn&&document.activeElement!==vn)vn.value=n.value||'';
 if(vp&&document.activeElement!==vp)vp.value=p.value||'';
 return true;
}
function phone(){let p=String($('v66Phone')?.value||$('customerPhone')?.value||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;return p}
function snapshot(){
 try{
   const c=window.__freshCart&&Object.keys(window.__freshCart).length?window.__freshCart:(window.cart||{}),keys=Object.keys(c||{});
   const items=keys.map(k=>{const x=c[k]||{},i=x.item||[];return{en:String(i[0]||x.en||''),bn:String(i[1]||x.bn||''),price:Number(i[2]??x.price??0),qty:Number(x.qty||0)}}).filter(x=>x.en&&x.qty>0);
   if(!items.length)return null;
   const subtotal=items.reduce((s,x)=>s+x.price*x.qty,0),dp=Math.max(0,Number($('lbDiscountPct')?.value||$('freshDiscount')?.value||$('discount')?.value||0)||0),discount=Math.min(subtotal,subtotal*dp/100),gstPct=Math.max(0,Number($('gst')?.value||$('freshGst')?.value||0)||0),tax=Math.max(0,subtotal-discount)*gstPct/100,total=Math.max(0,subtotal-discount)+tax;
   const customer=String($('v66Name')?.value||$('customer')?.value||'Customer').trim()||'Customer',ph=String($('v66Phone')?.value||$('customerPhone')?.value||'').trim();
   let payment=String(document.querySelector('.payment.active')?.textContent||'Cash').split('/')[0].trim()||'Cash';
   return{id:'LB-'+Date.now().toString(36).toUpperCase(),at:new Date().toISOString(),customer,phone:ph,items,subtotal,discount,total,payment};
 }catch(e){return null}
}
function waUrl(s){const p=phone();if(p.length<12)return null;let msg='LA BISTRO\n\nCustomer: '+s.customer+'\nPhone: '+s.phone+'\n\n';s.items.forEach(x=>{msg+=x.qty+' x '+x.en+' = ₹'+(x.qty*x.price).toFixed(0)+'\n'});msg+='\nSubtotal: ₹'+s.subtotal.toFixed(0)+'\nDiscount: ₹'+s.discount.toFixed(0)+'\nTOTAL: ₹'+s.total.toFixed(0)+'\nPayment: '+s.payment+'\n\nThank you / ধন্যবাদ';return'https://wa.me/'+p+'?text='+encodeURIComponent(msg)}
async function save(s){try{if(window.LB&&typeof window.LB.saveSale==='function'){await window.LB.saveSale(false);return true}return false}catch(e){return false}}
function openWA(s){const u=waUrl(s);if(!u){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');$('v66Phone')?.focus();return false}const w=window.open(u,'_blank');if(!w){location.href=u}return true}
async function printAndWhatsApp(btn){if(busy)return;busy=true;if(btn)btn.disabled=true;try{const s=snapshot();if(!s){alert('Add items first / আগে আইটেম যোগ করুন');return}await save(s);if(window.LB&&typeof window.LB.print==='function')window.LB.print(s);else if(typeof window.printReceipt==='function'&&window.printReceipt!==printAndWhatsApp)window.printReceipt(s);openWA(s)}catch(e){console.error(e);alert('Print/WhatsApp failed. Please try again / আবার চেষ্টা করুন')}finally{busy=false;if(btn)btn.disabled=false}}
function wire(){
 document.addEventListener('click',e=>{const el=e.target.closest('button,[role="button"],[onclick]');if(!el)return;const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t.includes('print bill')||t.includes('বিল প্রিন্ট')){e.preventDefault();e.stopImmediatePropagation();printAndWhatsApp(el)}},true);
}
function start(){makeBox();wire();[300,1000,2500,5000].forEach(t=>setTimeout(makeBox,t));const mo=new MutationObserver(()=>{makeBox()});mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
