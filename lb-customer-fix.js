/* La Bistro customer fields + print/WhatsApp fix v67. Single active module. */
(()=>{
'use strict';
const BOX='lbCustomerV67';
let busy=false;
const $=id=>document.getElementById(id);
function getCart(){return document.querySelector('.cart')}
function legacy(){
 let n=$('customer'),p=$('customerPhone');
 if(!n){n=document.createElement('input');n.id='customer';n.type='text';n.style.cssText='position:absolute;left:-99999px;width:1px;height:1px;opacity:0';document.body.appendChild(n)}
 if(!p){p=document.createElement('input');p.id='customerPhone';p.type='tel';p.style.cssText='position:absolute;left:-99999px;width:1px;height:1px;opacity:0';document.body.appendChild(p)}
 return{n,p};
}
function addStyle(){
 if($('lbCustomerV67Style'))return;
 const s=document.createElement('style');s.id='lbCustomerV67Style';
 s.textContent=`#${BOX}{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;width:100%!important;box-sizing:border-box!important;background:#fff8df!important;border:1px solid #c8a94e!important;border-radius:10px!important;padding:10px!important;margin:0 0 10px!important;color:#111!important;z-index:9999!important}#${BOX} .v67-title{font-weight:800!important;font-size:17px!important;margin-bottom:8px!important;color:#111!important}#${BOX} .v67-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}#${BOX} input{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;min-width:0!important;height:44px!important;box-sizing:border-box!important;padding:9px 10px!important;border:1px solid #b8953b!important;border-radius:8px!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;font:15px Arial,sans-serif!important}#${BOX} input::placeholder{color:#666!important;opacity:1!important}@media(max-width:560px){#${BOX} .v67-grid{grid-template-columns:1fr!important;grid-template-columns:1fr!important}}`;
 document.head.appendChild(s);
}
function ensure(){
 const c=getCart();if(!c)return false;addStyle();const {n,p}=legacy();let b=$(BOX);
 if(!b){
  b=document.createElement('section');b.id=BOX;
  b.innerHTML='<div class="v67-title">Customer Details / কাস্টমারের তথ্য</div><div class="v67-grid"><input id="v67Name" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="v67Phone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel"></div>';
  const items=c.querySelector('.cart-items');
  if(items)c.insertBefore(b,items);else c.insertBefore(b,c.firstChild);
  $('v67Name').addEventListener('input',e=>n.value=e.target.value);
  $('v67Phone').addEventListener('input',e=>p.value=e.target.value);
 }
 const vn=$('v67Name'),vp=$('v67Phone');
 if(vn&&document.activeElement!==vn)vn.value=n.value||'';
 if(vp&&document.activeElement!==vp)vp.value=p.value||'';
 return true;
}
function clearCustomer(){const {n,p}=legacy();n.value='';p.value='';if($('v67Name'))$('v67Name').value='';if($('v67Phone'))$('v67Phone').value=''}
function normalizedPhone(){let p=String($('v67Phone')?.value||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;return p}
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
  const customer=String($('v67Name')?.value||'').trim()||'Customer';
  const phone=String($('v67Phone')?.value||'').trim();
  const payment=String(document.querySelector('.payment.active')?.textContent||'Cash').split('/')[0].trim()||'Cash';
  return{id:'LB-'+Date.now().toString(36).toUpperCase(),customer,phone,items,subtotal,discount,gst,total:Math.max(0,subtotal-discount)+gst,payment};
 }catch(e){console.error(e);return null}
}
function whatsapp(s){
 const p=normalizedPhone();if(p.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');$('v67Phone')?.focus();return false}
 let m='LA BISTRO\n\nBill: '+s.id+'\nCustomer: '+s.customer+'\n\n';s.items.forEach(x=>m+=x.qty+' x '+x.en+' = ₹'+(x.qty*x.price).toFixed(0)+'\n');m+='\nSubtotal: ₹'+s.subtotal.toFixed(0)+'\nDiscount: ₹'+s.discount.toFixed(0)+'\nGST: ₹'+s.gst.toFixed(0)+'\nTOTAL: ₹'+s.total.toFixed(0)+'\nPayment: '+s.payment+'\n\nThank you / ধন্যবাদ';
 const url='https://wa.me/'+p+'?text='+encodeURIComponent(m);const w=window.open(url,'_blank');if(!w)location.href=url;return true;
}
async function printBoth(btn){if(busy)return;busy=true;if(btn)btn.disabled=true;try{const s=snapshot();if(!s){alert('Add items first / আগে আইটেম যোগ করুন');return}if(window.LB&&typeof window.LB.saveSale==='function')try{await window.LB.saveSale(false)}catch(_){}if(window.LB&&typeof window.LB.print==='function')window.LB.print(s);else if(typeof window.printReceipt==='function')window.printReceipt(s);whatsapp(s)}finally{busy=false;if(btn)btn.disabled=false}}
function wire(){document.addEventListener('click',e=>{const b=e.target.closest('button,[role="button"],[onclick]');if(!b)return;const t=(b.textContent||'').replace(/\s+/g,' ').toLowerCase();if(t.includes('print bill')||t.includes('বিল প্রিন্ট')){e.preventDefault();e.stopImmediatePropagation();printBoth(b)}},true)}
function start(){ensure();wire();[250,800,1500,3000,6000].forEach(t=>setTimeout(ensure,t));new MutationObserver(()=>ensure()).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
