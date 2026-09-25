const CACHE='la-bistro-billing-v24';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js','./lb-repair-v3.js','./lb-sales-fix.js'];

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

function injection(){return `<script>
(()=>{'use strict';
window.printReceipt=async function(){
  if(window.LB&&typeof LB.saveSale==='function'){await LB.saveSale(true);return;}
  alert('Billing system is still loading. Please try again.');
};
window.sendWhatsAppBill=async function(){
  if(window.LB&&typeof LB.saveSale==='function'){
    await LB.saveSale(false);
    const s=(LB.sales||[])[(LB.sales||[]).length-1];
    if(!s)return;
    let p=String(s.phone||'').replace(/\\D/g,'');
    if(p.length===10)p='91'+p;
    if(p.length<10){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return;}
    const lines=(s.items||[]).map(x=>'• '+(x.en||x.bn||'Item')+' x '+x.qty+' = ₹'+Number(x.qty*x.price).toFixed(0)).join('\\n');
    const msg='LA BISTRO\\nলা বিস্ট্রো\\n\\nBill: '+s.id+'\\nCustomer: '+(s.customer||'Customer')+'\\n\\n'+lines+'\\n\\nSubtotal: ₹'+Number(s.subtotal||0).toFixed(0)+'\\nDiscount: -₹'+Number(s.discount||0).toFixed(0)+'\\nGST: ₹'+Number(s.tax||0).toFixed(0)+'\\nTOTAL: ₹'+Number(s.total||0).toFixed(0)+'\\n\\nThank you / ধন্যবাদ';
    window.open('https://wa.me/'+p+'?text='+encodeURIComponent(msg),'_blank');
    return;
  }
  alert('Billing system is still loading. Please try again.');
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
