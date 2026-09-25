const CACHE='la-bistro-billing-v17';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js','./lb-repair-v3.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function cleanAccidentalCode(html){
 const injection=`<style id="lb-dark-button-fix">.print-actions .btn:not(.primary){background:#f2c75c!important;color:#111!important;border-color:#d9a62e!important;}</style><script>(function(){function clean(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const a=[];let n;while(n=w.nextNode())a.push(n);a.forEach(n=>{const p=n.parentElement;if(!p||p.tagName==='SCRIPT'||p.tagName==='STYLE')return;const s=n.nodeValue||'';if(s.includes('function printReceipt()')||s.includes('function sendWhatsAppBill()')||s.includes('function bluetoothPrinter()'))n.remove();});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>clean(document.body));else clean(document.body);})();<\/script>`;
 return html.replace(/<\/body>/i,injection+'</body>');
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
