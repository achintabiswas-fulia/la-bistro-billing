/* La Bistro customer details + WhatsApp fix. */
(()=>{
'use strict';
const BOX='lbCustomerV72';
const $=id=>document.getElementById(id);
function cart(){return document.querySelector('.cart');}
function css(){
 if($('lbCustomerV72Style'))return;
 const s=document.createElement('style');s.id='lbCustomerV72Style';
 s.textContent=`#${BOX}{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;box-sizing:border-box!important;background:#fff8df!important;border:1px solid #c8a94e!important;border-radius:10px!important;padding:10px!important;margin:0 0 10px!important;position:relative!important;z-index:999999!important;flex:none!important}#${BOX} .v72-title{font-weight:800!important;font-size:17px!important;margin:0 0 9px!important;color:#111!important}#${BOX} .v72-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important}#${BOX} input{display:block!important;width:100%!important;height:45px!important;box-sizing:border-box!important;padding:9px 11px!important;border:1px solid #b8953b!important;border-radius:8px!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;font-size:15px!important}@media(max-width:560px){#${BOX} .v72-grid{grid-template-columns:1fr!important}}`;
 document.head.appendChild(s);
}
function hidden(){
 let n=$('customer'),p=$('customerPhone');
 if(!n){n=document.createElement('input');n.id='customer';n.type='text';n.hidden=true;document.body.appendChild(n)}
 if(!p){p=document.createElement('input');p.id='customerPhone';p.type='tel';p.hidden=true;document.body.appendChild(p)}
 return{n,p};
}
function build(){
 const c=cart();if(!c)return false;
 css();const h=hidden();let b=$(BOX);
 if(!b){
  b=document.createElement('section');b.id=BOX;
  b.innerHTML='<div class="v72-title">Customer Details / কাস্টমারের তথ্য</div><div class="v72-grid"><input id="v72Name" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="v72Phone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel"></div>';
  const title=c.querySelector('h2');c.insertBefore(b,title||c.firstChild);
  $('v72Name').addEventListener('input',()=>h.n.value=$('v72Name').value);
  $('v72Phone').addEventListener('input',()=>h.p.value=$('v72Phone').value);
 }
 const n=$('v72Name'),p=$('v72Phone');
 if(n&&document.activeElement!==n&&h.n.value)n.value=h.n.value;
 if(p&&document.activeElement!==p&&h.p.value)p.value=h.p.value;
 return true;
}
function phone(){let p=String($('v72Phone')?.value||$('customerPhone')?.value||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;return p;}
function bill(){
 let c={};try{c=window.__freshCart&&Object.keys(window.__freshCart).length?window.__freshCart:(window.cart||{});}catch(_){ }
 const items=Object.keys(c||{}).map(k=>{const x=c[k]||{},i=x.item||[];return{en:String(i[0]||''),bn:String(i[1]||''),price:Number(i[2]||0),qty:Number(x.qty||0)}}).filter(x=>x.en&&x.qty>0);
 if(!items.length)return null;
 const sub=items.reduce((a,x)=>a+x.price*x.qty,0);
 const dp=Number($('lbDiscountPct')?.value||$('discount')?.value||0)||0;
 const dis=Math.min(sub,sub*dp/100);
 const gp=Number($('gst')?.value||0)||0;
 const gst=(sub-dis)*gp/100;
 return{items,sub,dis,gst,total:sub-dis+gst,name:String($('v72Name')?.value||$('customer')?.value||'Customer').trim()||'Customer',rawPhone:String($('v72Phone')?.value||$('customerPhone')?.value||'').trim()};
}
function openWA(s){
 const p=phone();
 if(p.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');$('v72Phone')?.focus();return false;}
 let m='LA BISTRO / লা বিস্ট্রো\nCustomer: '+s.name+'\nWhatsApp: '+s.rawPhone+'\n\n';
 s.items.forEach(x=>m+=x.qty+' x '+x.en+' / '+x.bn+' = ₹'+(x.qty*x.price).toFixed(0)+'\n');
 m+='\nSubtotal: ₹'+s.sub.toFixed(0)+'\nDiscount: ₹'+s.dis.toFixed(0)+'\nGST: ₹'+s.gst.toFixed(0)+'\nTOTAL: ₹'+s.total.toFixed(0)+'\n\nThank you / ধন্যবাদ';
 const u='https://wa.me/'+p+'?text='+encodeURIComponent(m);const w=window.open(u,'_blank');if(!w)location.href=u;return true;
}
let busy=false;
function both(btn){if(busy)return;busy=true;if(btn)btn.disabled=true;const s=bill();if(!s){alert('Add items first / আগে আইটেম যোগ করুন');busy=false;if(btn)btn.disabled=false;return;}openWA(s);setTimeout(()=>{if(window.LB&&typeof window.LB.print==='function'){window.LB.print({id:'WHATSAPP',at:new Date().toISOString(),orderType:'Dine In',table:'-',customer:s.name,phone:s.rawPhone,payment:(document.querySelector('.payment.active')?.textContent||'Cash').split('/')[0].trim(),items:s.items,subtotal:s.sub,discountPct:Number($('lbDiscountPct')?.value||0)||0,discount:s.dis,taxRate:Number($('gst')?.value||0)||0,tax:s.gst,total:s.total});}else window.print();busy=false;if(btn)btn.disabled=false},200)}
function wire(){document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=(b.textContent||'').replace(/\s+/g,' ').toLowerCase();if(t.includes('whatsapp bill')||t.includes('whatsapp')){e.preventDefault();e.stopImmediatePropagation();const s=bill();if(s)openWA(s);else alert('Add items first / আগে আইটেম যোগ করুন');}},true)}
function start(){build();wire();[100,300,700,1500,3000,6000].forEach(t=>setTimeout(build,t));setInterval(build,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
