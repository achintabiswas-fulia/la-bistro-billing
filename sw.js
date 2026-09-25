const CACHE='la-bistro-billing-v6';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js'];
const READABLE_CSS=`<style id="lb-readable-fix">
.btn,.top-actions .btn,button.btn{background:#17130b!important;color:#fff!important;border:1px solid #d9a62e!important;text-shadow:none!important;-webkit-text-fill-color:#fff!important}
.btn.primary,.top-actions .btn.primary{background:linear-gradient(#e8b63e,#a87513)!important;color:#111!important;-webkit-text-fill-color:#111!important}
.summary input,.summary select{background:#fff!important;color:#111!important;border:1px solid #bbb!important;-webkit-text-fill-color:#111!important}
#gst,#gstInput,input[name="gst"],input.gst{background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important}
.print-actions .btn,.print-actions button{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#17130b!important}
</style>`;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET') return;
 if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){
  e.respondWith((async()=>{
   const r=await fetch(e.request,{cache:'no-store'});let text=await r.text();
   if(!text.includes('id="lb-readable-fix"')) text=text.replace('</head>',READABLE_CSS+'</head>');
   return new Response(text,{headers:{'Content-Type':'text/html; charset=utf-8'}});
  })());
 }else e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
