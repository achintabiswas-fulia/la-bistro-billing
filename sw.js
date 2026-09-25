const CACHE='la-bistro-billing-v25';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js','./lb-repair-v3.js','./lb-sales-fix.js'];

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

function injection(){return `<script>
(()=>{'use strict';
function n(v){const x=Number(String(v??'').replace(/[^0-9.]/g,''));return Number.isFinite(x)?x:0;}
function val(id,d=''){const e=document.getElementById(id);return e&&e.value!=null&&e.value!==''?e.value:d;}
function readBill(){
  const rows=[...document.querySelectorAll('.cart-row')];
  const items=[];
  rows.forEach(r=>{
    const en=(r.querySelector('.cart-name')?.textContent||'').trim();
    const bn=(r.querySelector('.cart-bn')?.textContent||'').trim();
    const qtxt=r.querySelector('.bill-qty')?.textContent||r.querySelector('.row-controls span')?.textContent||'';
    const qty=Math.max(0,parseInt(String(qtxt).replace(/[^0-9]/g,''),10)||0);
    const tt=r.querySelector('.bill-total')?.textContent||r.querySelector('.amount')?.textContent||'';
    const line=n(tt);
    const price=qty?line/qty:0;
    if(en&&qty>0&&price>0)items.push({en,bn,price,qty});
  });
  if(!items.length)return null;
  const subtotal=items.reduce((s,x)=>s+x.qty*x.price,0);
  const pct=Math.max(0,Math.min(100,n(val('lbDiscountPct',0))));
  const discount=subtotal*pct/100;
  const rate=Math.max(0,n(val('gst',0)));
  const taxable=Math.max(0,subtotal-discount);
  const tax=taxable*rate/100;
  const total=taxable+tax;
  const payment=(document.querySelector('.payment.active')?.textContent||'Cash').replace(/\\s+/g,' ').trim().split('/')[0].trim();
  return {customer:val('customer','Customer'),phone:val('customerPhone',''),table:val('table','-'),orderType:val('orderType','Dine In'),payment,items,subtotal,discountPct:pct,discount,taxRate:rate,tax,total};
}
function saveFromVisibleBill(){
  const b=readBill();
  if(!b){alert('Add items first / আগে আইটেম যোগ করুন');return null;}
  const sig=JSON.stringify(b);
  let sales=[];try{sales=JSON.parse(localStorage.getItem('lb_sales_v2')||'[]')}catch(e){sales=[]}
  const now=Date.now();
  let s=sales.find(x=>x._visibleSig===sig&&now-Date.parse(x.at||0)<10000);
  if(!s){s={id:'LB-'+now.toString(36).toUpperCase(),at:new Date(now).toISOString(),...b,_visibleSig:sig};sales.push(s);localStorage.setItem('lb_sales_v2',JSON.stringify(sales));if(window.LB)window.LB.sales=sales;}
  return s;
}
if(window.LB){
  window.LB.saveSale=async function(print){
    const s=saveFromVisibleBill();
    if(!s)return;
    if(print&&typeof window.LB.print==='function')window.LB.print(s);
  };
}
window.printReceipt=async function(){
  const s=saveFromVisibleBill();
  if(!s)return;
  if(window.LB&&typeof LB.print==='function')LB.print(s);else alert('Print system is still loading. Please try again.');
};
window.sendWhatsAppBill=async function(){
  const s=saveFromVisibleBill();
  if(!s)return;
  let p=String(s.phone||'').replace(/\\D/g,'');
  if(p.length===10)p='91'+p;
  if(p.length<10){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return;}
  const lines=(s.items||[]).map(x=>'• '+(x.en||x.bn||'Item')+' x '+x.qty+' = ₹'+Number(x.qty*x.price).toFixed(0)).join('\\n');
  const msg='LA BISTRO\\nলা বিস্ট্রো\\n\\nBill: '+s.id+'\\nCustomer: '+(s.customer||'Customer')+'\\n\\n'+lines+'\\n\\nSubtotal: ₹'+Number(s.subtotal||0).toFixed(0)+'\\nDiscount: -₹'+Number(s.discount||0).toFixed(0)+'\\nGST: ₹'+Number(s.tax||0).toFixed(0)+'\\nTOTAL: ₹'+Number(s.total||0).toFixed(0)+'\\n\\nThank you / ধন্যবাদ';
  window.open('https://wa.me/'+p+'?text='+encodeURIComponent(msg),'_blank');
};
window.bluetoothPrinter=function(){
  if(!navigator.bluetooth){alert('Bluetooth printing is not supported in this browser.');return;}
  navigator.bluetooth.requestDevice({acceptAllDevices:true}).catch(e=>{if(e&&e.name!=='NotFoundError')alert('Bluetooth could not be opened.');});
};
function wire(){document.addEventListener('click',function(e){
  const b=e.target.closest('button,a,.btn');if(!b)return;
  const t=(b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase();
  if(t.includes('print bill')||t.includes('print & save')||t==='print'||t.startsWith('print /')){e.preventDefault();e.stopImmediatePropagation();window.printReceipt();return;}
  if(t.includes('whatsapp')){e.preventDefault();e.stopImmediatePropagation();window.sendWhatsAppBill();return;}
  if(t.includes('bluetooth')){e.preventDefault();e.stopImmediatePropagation();window.bluetoothPrinter();return;}
},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
<\\/script>`}

self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>r.text().then(t=>new Response(t.replace(/<\\/body>/i,injection()+'</body>'),{status:r.status,statusText:r.statusText,headers:r.headers}))).catch(()=>caches.match(e.request)));}else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));}});
