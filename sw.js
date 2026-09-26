const CACHE='la-bistro-billing-v30';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js','./lb-repair-v3.js','./lb-sales-fix.js','./quantity-formula.js'];

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const isIndex=e.request.mode==='navigate'||new URL(e.request.url).pathname.endsWith('/index.html');
  e.respondWith(
    fetch(e.request,{cache:'no-store'}).then(async r=>{
      if(isIndex && r.ok){
        const text=await r.clone().text();
        if(!text.includes('quantity-formula.js')){
          const patched=text.replace('</body>','<script src="./quantity-formula.js?v=1"></script></body>');
          r=new Response(patched,{status:r.status,statusText:r.statusText,headers:r.headers});
        }
      }
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
