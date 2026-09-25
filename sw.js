const CACHE='la-bistro-billing-v23';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lb-core.js','./lb-manager.js','./lb-cloud.js','./lb-menu.js','./lb-repair-v3.js','./lb-sales-fix.js'];

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));

function injection(){
return `<script>
(()=>{ 'use strict';
function num(v){ const n=Number(v); return Number.isFinite(n)?n:0; }
function val(id, fallback){ const e=document.getElementById(id); return e && e.value!=null && e.value!=='' ? e.value : fallback; }
function cleanMoney(v){ return num(String(v||'').replace(/[^0-9.]/g,'')); }
function getItems(){
  const rows=[...document.querySelectorAll('.cart-row')]; const out=[];
  rows.forEach(row=>{
    const en=(row.querySelector('.cart-name')?.textContent||'').trim();
    const bn=(row.querySelector('.cart-bn')?.textContent||'').trim();
    const qty=Math.max(0,num(row.querySelector('.bill-qty')?.textContent)||num(row.querySelector('.row-controls span')?.textContent)||0);
    const totalText=(row.querySelector('.bill-total')?.textContent||row.querySelector('.amount')?.textContent||'');
    const priceText=(row.querySelector('.bill-price')?.textContent||'');
    let unit=cleanMoney(priceText);
    const lineTotal=cleanMoney(totalText);
    if(!unit && qty>0 && lineTotal) unit=lineTotal/qty;
    if(en && qty>0 && unit>0) out.push({en,bn,price:unit,qty});
  });
  return out;
}
function buildSale(){
  const items=getItems();
  if(!items.length){ alert('Add items first / আগে আইটেম যোগ করুন'); return null; }
  const subtotal=items.reduce((s,x)=>s+x.qty*x.price,0);
  const pct=Math.max(0,Math.min(100,num(val('lbDiscountPct',0))));
  const oldDiscount=num(val('discount',0));
  const discount=pct?subtotal*pct/100:oldDiscount;
  const rate=num(val('gst',0));
  const taxable=Math.max(0,subtotal-discount);
  const tax=taxable*rate/100;
  const total=taxable+tax;
  const payment=(document.querySelector('.payment.active')?.textContent||'Cash').replace(/\s+/g,' ').trim().split('/')[0].trim();
  const sale={id:'LB-'+Date.now().toString(36).toUpperCase(),at:new Date().toISOString(),customer:val('customer','Customer'),phone:val('customerPhone',''),table:val('table','-'),orderType:val('orderType','Dine In'),payment,items,subtotal,discountPct:pct,discount,taxRate:rate,tax,total};
  let sales=[]; try{sales=JSON.parse(localStorage.getItem('lb_sales_v2')||'[]')}catch(e){}
  const sig=JSON.stringify({customer:sale.customer,phone:sale.phone,table:sale.table,orderType:sale.orderType,payment:sale.payment,items,subtotal,discountPct:pct,discount,taxRate:rate,tax,total});
  const lastSig=localStorage.getItem('lb_last_print_signature_v2'); const lastId=localStorage.getItem('lb_last_print_id_v2');
  if(sig===lastSig && lastId){ const old=sales.find(x=>x.id===lastId); if(old)return old; }
  sale._sig=sig; sales.push(sale); localStorage.setItem('lb_sales_v2',JSON.stringify(sales)); localStorage.setItem('lb_last_print_signature_v2',sig); localStorage.setItem('lb_last_print_id_v2',sale.id); if(window.LB)window.LB.sales=sales; return sale;
}
function esc(s){return String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));}
function money(n){return '₹'+num(n).toFixed(0);}
function printSale(s){
  const rows=s.items.map(x=>'<tr><td>'+x.qty+'</td><td>'+esc(x.en)+'<br><small>'+esc(x.bn)+'</small></td><td style="text-align:right">'+money(x.qty*x.price)+'</td></tr>').join('');
  const html='<!doctype html><html><head><meta charset="utf-8"><title>'+esc(s.id)+'</title><style>body{font:12px Arial,sans-serif;color:#000;width:72mm;margin:0 auto;padding:4mm}h2{text-align:center;margin:0 0 5px}table{width:100%;border-collapse:collapse}td{padding:4px 0;border-bottom:1px dotted #999;vertical-align:top}.right{text-align:right}.big{font-size:16px;font-weight:700}.center{text-align:center}</style></head><body><h2>LA BISTRO</h2><div class="center">লা বিস্ট্রো<br>'+esc(s.orderType)+' • '+esc(s.table)+'<br>'+new Date(s.at).toLocaleString('en-IN')+'<br>'+esc(s.id)+'</div><hr><table>'+rows+'</table><hr><div class="right">Subtotal: '+money(s.subtotal)+'<br>Discount ('+num(s.discountPct)+'%): -'+money(s.discount)+'<br>GST ('+num(s.taxRate)+'%): '+money(s.tax)+'<br><span class="big">TOTAL: '+money(s.total)+'</span></div><p>Customer: '+esc(s.customer)+'<br>Payment: '+esc(s.payment)+'</p><div class="center">Thank you / ধন্যবাদ</div><script>window.onload=function(){setTimeout(function(){window.print()},150)}<\/script></body></html>';
  const w=window.open('','_blank'); if(!w){alert('Allow pop-ups for this site to print the bill.');return;} w.document.open(); w.document.write(html); w.document.close();
}
window.printReceipt=function(){const s=buildSale();if(s)printSale(s);};
window.sendWhatsAppBill=function(){const s=buildSale();if(!s)return;let p=String(s.phone||'').replace(/\D/g,'');if(p.length===10)p='91'+p;if(p.length<10){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return;}const lines=s.items.map(x=>'• '+(x.en||x.bn||'Item')+' x '+x.qty+' = '+money(x.qty*x.price)).join('\n');const msg='LA BISTRO\nলা বিস্ট্রো\n\nBill: '+s.id+'\nCustomer: '+(s.customer||'Customer')+'\n\n'+lines+'\n\nSubtotal: '+money(s.subtotal)+'\nDiscount: -'+money(s.discount)+'\nGST: '+money(s.tax)+'\nTOTAL: '+money(s.total)+'\n\nThank you / ধন্যবাদ';window.open('https://wa.me/'+p+'?text='+encodeURIComponent(msg),'_blank');};
window.bluetoothPrinter=function(){if(!navigator.bluetooth){alert('Bluetooth printing is not supported in this browser.');return;}navigator.bluetooth.requestDevice({acceptAllDevices:true}).catch(e=>{if(e&&e.name!=='NotFoundError')alert('Bluetooth could not be opened.');});};
function wire(){document.addEventListener('click',function(e){const b=e.target.closest('button,a,.btn');if(!b)return;const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t.includes('print bill')||t.includes('print & save')||t==='print'||t.startsWith('print /')){e.preventDefault();e.stopImmediatePropagation();window.printReceipt();return;}if(t.includes('whatsapp')){e.preventDefault();e.stopImmediatePropagation();window.sendWhatsAppBill();return;}if(t.includes('bluetooth')){e.preventDefault();e.stopImmediatePropagation();window.bluetoothPrinter();return;}},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
<\/script>`;
}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>r.text().then(t=>new Response(t.replace(/<\/body>/i,injection()+'</body>'),{status:r.status,statusText:r.statusText,headers:r.headers}))).catch(()=>caches.match(e.request)));}else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));}});
