const CACHE='la-bistro-billing-v19';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js','./lb-repair-v3.js','./lb-sales-fix.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function cleanAccidentalCode(html){
 const injection=`<style id="lb-dark-button-fix">.print-actions .btn:not(.primary){background:#f2c75c!important;color:#111!important;border-color:#d9a62e!important;}</style><script>(function(){
function clean(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const a=[];let n;while(n=w.nextNode())a.push(n);a.forEach(n=>{const p=n.parentElement;if(!p||p.tagName==='SCRIPT'||p.tagName==='STYLE')return;const s=n.nodeValue||'';if(s.includes('function printReceipt()')||s.includes('function sendWhatsAppBill()')||s.includes('function bluetoothPrinter()'))n.remove();});}
function money(n){return Number(n||0).toFixed(0);}
function getCart(){try{return window.cart&&typeof window.cart==='object'?window.cart:{};}catch(e){return {};}}
function getBill(){const cart=getCart();const keys=Object.keys(cart);let sub=0;let lines=[];keys.forEach(k=>{const x=cart[k];if(!x||!x.item)return;const it=x.item;const q=Number(x.qty||1);const price=Number(it[2]||0);sub+=q*price;lines.push((it[0]||it[1]||'Item')+' x '+q+' = Rs '+money(q*price));});const dis=Number((document.getElementById('discount')||{}).value||0);const rate=Number((document.getElementById('gst')||{}).value||0);const taxable=Math.max(0,sub-dis);const tax=taxable*rate/100;return {cart,lines,sub,dis,tax,rate,total:taxable+tax};}
function field(id,fallback){const e=document.getElementById(id);return e&&e.value?e.value:fallback;}
window.sendWhatsAppBill=function(){const b=getBill();if(!b.lines.length){alert('Add items first / আগে আইটেম যোগ করুন');return;}let phone=field('customerPhone','').replace(/\\D/g,'');if(phone.length===10)phone='91'+phone;if(phone.length<10){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');const e=document.getElementById('customerPhone');if(e)e.focus();return;}const customer=field('customer','Customer');const table=field('table','-');const order=field('orderType','Dine-in / ডাইন-ইন');let msg='LA BISTRO\\nলা বিস্ট্রো\\nMulti Cuisine Family Restaurant\\nPrafullanagar, Belemath, Nadia\\nContact: 7811838548\\n\\nCustomer: '+customer+'\\nOrder: '+order+'\\nTable: '+table+'\\n\\nBILL\\n';b.lines.forEach(x=>msg+='• '+x+'\\n');msg+='\\nSubtotal: Rs '+money(b.sub)+'\\nDiscount: Rs '+money(b.dis)+'\\nGST: Rs '+money(b.tax)+'\\nTOTAL: Rs '+money(b.total)+'\\n\\nThank you / ধন্যবাদ\\nMake a smile in every bite';window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank');};
window.printReceipt=function(){const b=getBill();if(!b.lines.length){alert('Add items first / আগে আইটেম যোগ করুন');return;}window.print();};
window.bluetoothPrinter=async function(){if(!navigator.bluetooth){alert('Bluetooth printing is not supported by this browser. Please use Print / প্রিন্ট.');return;}try{const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true});if(device){alert('Bluetooth device selected: '+(device.name||'Unnamed device')+'\\nFor a thermal printer, pair it in Android Bluetooth settings and use Print / প্রিন্ট for the bill.');}}catch(e){if(e&&e.name!=='NotFoundError')alert('Bluetooth could not be opened. Please check Bluetooth permission.');}};
function wire(){clean(document.body);document.addEventListener('click',function(e){const b=e.target.closest('button,a,.btn');if(!b)return;const t=(b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase();if(t.includes('whatsapp')){e.preventDefault();e.stopPropagation();window.sendWhatsAppBill();}else if(t.includes('bluetooth')){e.preventDefault();e.stopPropagation();window.bluetoothPrinter();}else if(t==='print' || t.startsWith('print /') || t.includes('print bill')){if(t.includes('print bill')){e.preventDefault();e.stopPropagation();window.printReceipt();}}},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();<\\/script><script src="./lb-sales-fix.js?v=19" defer></script>`;
 return html.replace(/<\\/body>/i,injection+'</body>');
}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){
   e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>r.text().then(t=>new Response(cleanAccidentalCode(t),{status:r.status,statusText:r.statusText,headers:r.headers}))).catch(()=>caches.match(e.request)));
 }else{
   e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
 }
});
