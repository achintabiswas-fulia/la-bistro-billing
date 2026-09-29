/* La Bistro: customer details + customer WhatsApp bill only. Do not change menu/header layout. */
(()=>{
'use strict';
const BOX='lbCustomerV74';
const $=id=>document.getElementById(id);
const cart=()=>document.querySelector('.cart');

function css(){
 if($('lbCustomerV74Style')) return;
 const s=document.createElement('style');
 s.id='lbCustomerV74Style';
 s.textContent=`
.top-actions{display:none!important}
#${BOX}{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;box-sizing:border-box!important;background:#fff!important;border:1px solid #c8a94e!important;border-radius:11px!important;padding:11px!important;margin:0 0 10px!important;position:relative!important;z-index:999999!important;flex:none!important;color:#111!important}
#${BOX} .v74-title{font-family:'Playfair Display',serif!important;font-size:20px!important;font-weight:700!important;margin:0 0 8px!important;color:#111!important}
#${BOX} .v74-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important}
#${BOX} input{display:block!important;width:100%!important;height:44px!important;box-sizing:border-box!important;padding:8px 10px!important;border:1px solid #c8a94e!important;border-radius:8px!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;font-size:15px!important}
@media(max-width:560px){#${BOX} .v74-grid{grid-template-columns:1fr!important}}
`;
 document.head.appendChild(s);
}

function hiddenFields(){
 let n=$('customer'),p=$('customerPhone');
 if(!n){n=document.createElement('input');n.id='customer';n.type='text';n.hidden=true;document.body.appendChild(n)}
 if(!p){p=document.createElement('input');p.id='customerPhone';p.type='tel';p.hidden=true;document.body.appendChild(p)}
 return{n,p};
}

function build(){
 const c=cart(); if(!c) return;
 css();
 const h=hiddenFields();
 let b=$(BOX);
 if(!b){
  b=document.createElement('section');
  b.id=BOX;
  b.innerHTML='<div class="v74-title">Customer Details / কাস্টমারের তথ্য</div><div class="v74-grid"><input id="v74Name" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="v74Phone" type="tel" inputmode="numeric" placeholder="Phone / WhatsApp Number / ফোন / WhatsApp নম্বর" autocomplete="tel"></div>';
  const title=[...c.querySelectorAll('h2')].find(x=>(x.textContent||'').toLowerCase().includes('current bill')) || c.querySelector('h2');
  c.insertBefore(b,title||c.firstChild||null);
  $('v74Name').addEventListener('input',()=>{h.n.value=$('v74Name').value;});
  $('v74Phone').addEventListener('input',()=>{h.p.value=$('v74Phone').value;});
 }
 const n=$('v74Name'),p=$('v74Phone');
 if(n&&document.activeElement!==n)n.value=h.n.value||'';
 if(p&&document.activeElement!==p)p.value=h.p.value||'';
}

function customerPhone(){
 let p=String($('v74Phone')?.value||$('customerPhone')?.value||'').replace(/\D/g,'');
 if(p.startsWith('0'))p=p.slice(1);
 if(p.length===10)p='91'+p;
 return p;
}

function bill(){
 let c={};
 try{c=window.__freshCart&&Object.keys(window.__freshCart).length?window.__freshCart:(window.cart||{});}catch(_){ }
 const items=Object.keys(c||{}).map(k=>{
  const x=c[k]||{},i=x.item||[];
  return{en:String(i[0]||''),bn:String(i[1]||''),price:Number(i[2]||0),qty:Number(x.qty||0)};
 }).filter(x=>x.en&&x.qty>0);
 if(!items.length)return null;
 const sub=items.reduce((a,x)=>a+x.price*x.qty,0);
 const dp=Number($('lbDiscountPct')?.value||$('discount')?.value||0)||0;
 const dis=Math.min(sub,sub*dp/100);
 const gp=Number($('gst')?.value||0)||0;
 const gst=(sub-dis)*gp/100;
 return{items,sub,dis,gst,total:sub-dis+gst,name:String($('v74Name')?.value||$('customer')?.value||'Customer').trim()||'Customer',rawPhone:String($('v74Phone')?.value||$('customerPhone')?.value||'').trim()};
}

function openWA(s){
 const p=customerPhone();
 if(p.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');$('v74Phone')?.focus();return false;}
 let m='LA BISTRO / লা বিস্ট্রো\nCustomer: '+s.name+'\nPhone / WhatsApp: '+s.rawPhone+'\n\n';
 s.items.forEach(x=>m+=x.qty+' x '+x.en+' / '+x.bn+' = ₹'+(x.qty*x.price).toFixed(0)+'\n');
 m+='\nSubtotal: ₹'+s.sub.toFixed(0)+'\nDiscount: ₹'+s.dis.toFixed(0)+'\nGST: ₹'+s.gst.toFixed(0)+'\nTOTAL: ₹'+s.total.toFixed(0)+'\n\nThank you / ধন্যবাদ';
 const u='https://wa.me/'+p+'?text='+encodeURIComponent(m);
 const w=window.open(u,'_blank');
 if(!w)location.href=u;
 return true;
}

function wire(){
 if(window.__lbV74Wired)return;
 window.__lbV74Wired=true;
 document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  const t=(b.textContent||'').replace(/\s+/g,' ').toLowerCase();
  if(t.includes('whatsapp bill')||t.includes('whatsapp')){
   e.preventDefault();e.stopImmediatePropagation();
   const s=bill();
   if(s)openWA(s); else alert('Add items first / আগে আইটেম যোগ করুন');
  }
 },true);
}

function start(){
 css();build();wire();
 [100,300,700,1500,3000,6000].forEach(t=>setTimeout(build,t));
 setInterval(build,1500);
 const observer=new MutationObserver(()=>build());
 const observe=()=>{const c=cart();if(c)observer.observe(c,{childList:true,subtree:true});};
 observe();
 setTimeout(observe,1000);setTimeout(observe,3000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
