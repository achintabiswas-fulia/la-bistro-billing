const CACHE='la-bistro-billing-v10';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js'];
const READABLE_CSS=`<style id="lb-readable-fix-v10">
/* Keep the top controls readable. */
.top-actions .btn,.top-actions button,#newBillBtn,#logoBtn,#printBtn{
  background:#17130b!important;background-image:none!important;color:#fff!important;
  -webkit-text-fill-color:#fff!important;text-shadow:none!important;
  border:1px solid #d9a62e!important;font-weight:800!important;
}
.btn.primary{color:#111!important;-webkit-text-fill-color:#111!important}
#gst,#gstInput,input[name="gst"],input.gst,.summary input,.summary select{
  background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;
  caret-color:#111!important;border:1px solid #999!important;font-weight:700!important;
}
.item{cursor:pointer!important;touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(217,166,46,.25)!important}
</style>`;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){e.respondWith((async()=>{const r=await fetch(e.request,{cache:'no-store'});let text=await r.text();text=text.replace('</head>',READABLE_CSS+'</head>');return new Response(text,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})})());}else e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))) });
