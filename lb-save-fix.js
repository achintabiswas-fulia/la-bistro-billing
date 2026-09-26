/* La Bistro — reliable Save Sale / Print Bill fix. Menu/layout untouched. */
(()=>{
'use strict';
function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
function v(id,f=''){const e=document.getElementById(id);return e&&e.value!==''?e.value:f}
function items(){const c=window.cart||{};return Object.keys(c).map(k=>c[k]).filter(x=>x&&x.item).map(x=>({en:x.item[0]||'Item',bn:x.item[1]||'',price:n(x.item[2]),qty:Math.max(1,n(x.qty)||1)}))}
function makeSale(){
 const its=items(); if(!its.length){alert('Add items first / আগে আইটেম যোগ করুন');return null}
 const subtotal=its.reduce((s,x)=>s+x.price*x.qty,0);
 const pct=Math.max(0,Math.min(100,n(v('lbDiscountPct',0))));
 const discount=pct?subtotal*pct/100:n(v('discount',0));
 const rate=n(v('gst',0)); const taxable=Math.max(0,subtotal-discount); const tax=taxable*rate/100; const total=taxable+tax;
 const payment=window.payment||'Cash';
 const base={customer:v('customer','Customer'),phone:v('customerPhone',''),table:v('table','-'),orderType:v('orderType','Dine In'),payment,items:its,subtotal,discountPct:pct,discount,taxRate:rate,tax,total};
 const sig=JSON.stringify(base);
 let sales=[];try{sales=JSON.parse(localStorage.getItem('lb_sales_v2')||'[]')}catch(e){sales=[]}
 const existing=sales.find(x=>x._saveFixSig===sig);
 if(existing){if(window.LB)window.LB.sales=sales;return existing}
 const sale={id:'LB-'+Date.now().toString(36).toUpperCase(),at:new Date().toISOString(),...base,_saveFixSig:sig};
 sales.push(sale); localStorage.setItem('lb_sales_v2',JSON.stringify(sales));
 localStorage.setItem('lb_last_saved_bill',sale.id);
 if(window.LB)window.LB.sales=sales;
 if(window.lbCloudPush)window.lbCloudPush();
 return sale;
}
function doPrint(s){if(window.LB&&typeof window.LB.print==='function'){window.LB.print(s);return}alert('Bill saved: '+s.id+' / বিল সেভ হয়েছে')}
function handle(text){const t=text.replace(/\s+/g,' ').trim().toLowerCase();if(t.includes('print bill')||t.includes('print & save')||t==='print'||t.startsWith('print /')){const s=makeSale();if(s)doPrint(s);return true}if(t==='save sale'||t.includes('save sale')){const s=makeSale();if(s&&window.LB&&LB.toast)LB.toast('Saved: '+s.id);return true}return false}
function install(){document.addEventListener('click',e=>{const b=e.target.closest('button,a,.btn');if(!b)return;if(handle(b.textContent||'')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
