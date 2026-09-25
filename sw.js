const CACHE='la-bistro-billing-v7';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js'];
const READABLE_CSS=`<style id="lb-readable-fix-v7">
/* FORCE readable controls: dark text on light buttons/fields */
.top-actions .btn,
.top-actions button,
header button,
header .btn,
#newBillBtn,#logoBtn,#printBtn,
#salesBtn,#backupBtn,#restoreBtn,
.print-actions .btn,
.print-actions button,
#whatsappBtn,#whatsappBillBtn,
button[onclick*="WhatsApp"],button[onclick*="whatsapp"]{
 background:#fff!important;
 background-image:none!important;
 color:#111!important;
 -webkit-text-fill-color:#111!important;
 text-shadow:none!important;
 border:1px solid #b8953b!important;
}
.btn.primary,.top-actions .btn.primary{
 background:#e6b83f!important;
 background-image:none!important;
 color:#111!important;
 -webkit-text-fill-color:#111!important;
}
#gst,#gstInput,input[name="gst"],input.gst,
.summary input,.summary select{
 background:#fff!important;
 color:#111!important;
 -webkit-text-fill-color:#111!important;
 caret-color:#111!important;
 border:1px solid #999!important;
}
</style>`;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET') return;
 if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){
  e.respondWith((async()=>{
   const r=await fetch(e.request,{cache:'no-store'});let text=await r.text();
   text=text.replace('</head>',READABLE_CSS+'</head>');
   return new Response(text,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  })());
 }else e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
