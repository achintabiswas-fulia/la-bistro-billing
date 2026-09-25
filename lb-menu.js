/* La Bistro POS — approved menu UI + reliable bill save/print bridge. */
(()=>{
'use strict';
function loadApprovedMenu(){
  if(window.__lbApprovedMenuLoaded)return Promise.resolve();
  window.__lbApprovedMenuLoaded=true;
  return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='./lb-repair-v3.js?v=15';s.onload=()=>resolve();s.onerror=()=>{window.__lbApprovedMenuLoaded=false;reject(new Error('Menu script failed'))};document.head.appendChild(s)});
}
function syncQuantityBadges(){
  const panel=document.getElementById('menuPanel');if(!panel)return;
  const cart=window.cart||{};
  panel.querySelectorAll('.item').forEach(btn=>{
    let badge=btn.querySelector('.qty');if(!badge){badge=document.createElement('span');badge.className='qty';btn.prepend(badge)}
    const en=(btn.querySelector('.en')?.textContent||'').trim(),bn=(btn.querySelector('.bn')?.textContent||'').trim();let qty=0;
    Object.values(cart).forEach(v=>{if(!v||!Array.isArray(v.item))return;const a=String(v.item[0]??'').trim(),b=String(v.item[1]??'').trim();if((en&&a===en)||(bn&&b===bn))qty=Math.max(qty,Number(v.qty||0))});
    badge.textContent=qty>0?String(qty):'';badge.style.display=qty>0?'flex':'none';
  });
}
function escapeHtml(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(n){return '₹'+Number(n||0).toFixed(2).replace(/\.00$/,'')}
function findButton(words){return [...document.querySelectorAll('button,.btn')].find(b=>{const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();return words.some(w=>t.includes(w))})}
function readBill(){
  const box=document.getElementById('cartItems');let rows=[...(box?.querySelectorAll('.cart-row')||[])];if(!rows.length)rows=[...document.querySelectorAll('.cart-row')];
  return rows.map(row=>{const en=(row.querySelector('.cart-name')?.textContent||'').trim(),bn=(row.querySelector('.cart-bn')?.textContent||'').trim();const qty=Number((row.querySelector('.bill-qty')?.textContent||row.querySelector('.row-controls b')?.textContent||'0').trim())||0;const total=Number((row.querySelector('.bill-total,.amount')?.textContent||'').replace(/[^0-9.]/g,''))||0;return {en,bn,qty,total,price:qty?total/qty:0}}).filter(x=>x.qty>0&&x.en);
}
function saveBill(print){
  const items=readBill();if(!items.length){alert('Add items first / আগে আইটেম যোগ করুন');return false}
  const subtotal=Number((document.getElementById('subtotal')?.textContent||'0').replace(/[^0-9.]/g,''))||items.reduce((s,x)=>s+x.total,0);
  const pct=Number(document.getElementById('lbDiscountPct')?.value||0)||0;
  const dis=Number((document.getElementById('lbDiscountAmt')?.textContent||'0').replace(/[^0-9.]/g,''))||0;
  const gstRate=Number(document.getElementById('gst')?.value||0)||0;
  const total=Number((document.getElementById('total')?.textContent||'0').replace(/[^0-9.]/g,''))||Math.max(0,subtotal-dis)*(1+gstRate/100);
  const now=Date.now(),sale={id:'LB-'+now.toString(36).toUpperCase(),at:new Date(now).toISOString(),customer:(document.getElementById('customer')?.value||'Customer').trim(),phone:(document.getElementById('customerPhone')?.value||'').trim(),table:(document.getElementById('table')?.value||'-').trim(),orderType:(document.getElementById('orderType')?.value||'Dine In').trim(),payment:(document.querySelector('.payment.active')?.textContent||'Cash').replace(/\s+/g,' ').trim(),items:items.map(x=>({en:x.en,bn:x.bn,price:x.price,qty:x.qty})),subtotal,discountPct:pct,discount:dis,taxRate:gstRate,tax:Math.max(0,subtotal-dis)*gstRate/100,total};
  try{const sales=JSON.parse(localStorage.getItem('lb_sales_v2')||'[]');sales.push(sale);localStorage.setItem('lb_sales_v2',JSON.stringify(sales));if(window.LB)window.LB.sales=sales}catch(e){alert('Could not save the bill / বিল সংরক্ষণ করা যায়নি');return false}
  if(window.LB?.toast)window.LB.toast('Saved: '+sale.id);if(print)printSale(sale);return false;
}
function printSale(s){
  const rows=s.items.map(x=>`<tr><td>${x.qty}</td><td>${escapeHtml(x.en)}<br>${escapeHtml(x.bn)}</td><td>${money(x.qty*x.price)}</td></tr>`).join('');
  const h=`<!doctype html><html><head><meta charset="utf-8"><title>La Bistro Bill</title><style>body{font:11px Arial;width:72mm;margin:auto;color:#000}h2{text-align:center}table{width:100%;border-collapse:collapse}td{padding:4px 0;border-bottom:1px dotted #999}.r{text-align:right}.big{font-size:16px;font-weight:bold}</style></head><body><h2>LA BISTRO</h2><div style="text-align:center">Multi Cuisine Family Restaurant • লা বিস্ট্রো<br>${s.orderType}${s.table?' • '+escapeHtml(s.table):''}<br>${new Date(s.at).toLocaleString('en-IN')}<br>${s.id}</div><hr><table>${rows}</table><hr><div class="r">Subtotal: ${money(s.subtotal)}<br>Discount (${s.discountPct}%): -${money(s.discount)}<br>GST (${s.taxRate}%): ${money(s.tax)}<br><span class="big">TOTAL: ${money(s.total)}</span></div><p>Customer: ${escapeHtml(s.customer)}<br>Payment: ${escapeHtml(s.payment)}</p><center>Thank you / ধন্যবাদ</center><script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`;
  const w=window.open('','_blank');if(!w){alert('Please allow pop-ups for printing / প্রিন্টের জন্য pop-up অনুমতি দিন');return false}w.document.open();w.document.write(h);w.document.close();return false;
}
function installPrintSave(){
  const p=findButton(['print bill','print & save']);if(p&&!p.dataset.lbPrintFixed){p.dataset.lbPrintFixed='1';p.onclick=e=>{e.preventDefault();return saveBill(true)}}
  const s=findButton(['save sale']);if(s&&!s.dataset.lbSaveFixed){s.dataset.lbSaveFixed='1';s.onclick=e=>{e.preventDefault();return saveBill(false)}}
}
async function start(){try{await loadApprovedMenu()}catch(e){console.error(e);return}const render=()=>{try{window.injectLBMenu?.()}catch(e){}try{window.renderMenu?.()}catch(e){}setTimeout(syncQuantityBadges,50);setTimeout(installPrintSave,100)};render();setTimeout(render,250);setTimeout(render,800);setTimeout(installPrintSave,1200)}
document.addEventListener('click',e=>{if(e.target.closest?.('#menuPanel .item'))setTimeout(()=>{syncQuantityBadges();installPrintSave()},80)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();window.addEventListener('load',()=>setTimeout(start,200));
})();
