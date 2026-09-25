const CACHE='la-bistro-billing-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET') return;
  if(u.pathname.endsWith('/index.html') || u.pathname.endsWith('/')){
    e.respondWith((async()=>{
      const r=await fetch(e.request,{cache:'no-store'});
      const text=await r.text();
      if(text.includes('lb-core.js')) return new Response(text,{headers:{'Content-Type':'text/html; charset=utf-8'}});
      const inject='\n<script src="./lb-core.js"></script>\n<script src="./lb-manager.js"></script>\n<script src="./lb-cloud.js"></script>\n<script src="./lb-menu.js"></script>\n';
      const out=text.replace('</body>',inject+'</body>');
      return new Response(out,{headers:{'Content-Type':'text/html; charset=utf-8'}});
    })());
  } else {
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});
