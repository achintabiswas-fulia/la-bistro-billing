/* La Bistro final bill actions fix
   Keeps the locked billing formula and only finalizes a bill when PRINT or WHATSAPP is used. */
(()=>{'use strict';
const LB=window.LB;

function currentValues(){
  const items=Object.keys(window.cart||{}).map(k=>window.cart[k]);
  const subtotal=items.reduce((s,x)=>s+Number(x.qty||0)*Number(x.item?.[2]||0),0);
  const pct=Math.max(0,Math.min(100,Number(document.getElementById('lbDiscountPct')?.value||0)));
  const discount=subtotal*pct/100;
  const gstRate=Math.max(0,Number(document.getElementById('gst')?.value||0));
  const taxable=Math.max(0,subtotal-discount);
  const gst=taxable*gstRate/100;
  const total=taxable+gst;
  const customer=(document.getElementById('customer')?.value||'Customer').trim();
  const phone=(document.getElementById('customerPhone')?.value||'').trim();
  return {items,subtotal,pct,discount,gstRate,gst,total,customer,phone,
    table:(document.getElementById('table')?.value||'-').trim(),
    orderType:(document.getElementById('orderType')?.value||'Dine In').trim(),
    payment:window.payment||'Cash'};
}
function itemValues(x){
  if(x?.item) return {en:String(x.item?.[0]||''),bn:String(x.item?.[1]||''),price:Number(x.item?.[2]||0),qty:Number(x.qty||0)};
  return {en:String(x?.en||x?.name||''),bn:String(x?.bn||''),price:Number(x?.price||0),qty:Number(x?.qty||0)};
}
function sameItems(a,b){
  if(!a||!b||a.length!==b.length)return false;
  const aa=a.map(itemValues), bb=b.map(itemValues);
  return aa.every(x=>bb.some(y=>y.en===x.en&&y.bn===x.bn&&Number(y.price)===Number(x.price)&&Number(y.qty)===Number(x.qty)));
}
function findSavedSale(v){
  const now=Date.now();
  const sales=[...(LB.sales||[])].reverse();
  return sales.find(s=>now-Date.parse(s.at||0)<30000 &&
    Number(s.total)===Number(v.total) &&
    String(s.customer||'')===v.customer &&
    String(s.phone||'')===v.phone &&
    sameItems(v.items,s.items)
  ) || sales.find(s=>Number(s.total)===Number(v.total)&&sameItems(v.items,s.items));
}
function clearCurrentBill(){
  window.cart={};
  try{document.getElementById('discount').value=0}catch(e){}
  try{document.getElementById('gst').value=0}catch(e){}
  try{document.getElementById('lbDiscountPct').value=0}catch(e){}
  window.renderMenu?.();window.renderCart?.();
}
function esc(s){return LB?.esc?LB.esc(s):String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function money(n){return LB?.money?LB.money(n):'₹'+Number(n||0).toFixed(0)}
function thermalHtml(s){
  const rows=(s.items||[]).map(x=>`<tr><td>${x.qty}</td><td>${esc(x.en)}<br><span>${esc(x.bn)}</span></td><td style="text-align:right">${money(Number(x.qty)*Number(x.price))}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>La Bistro ${esc(s.id)}</title><style>@page{size:50.8mm auto;margin:0}*{box-sizing:border-box}body{width:50.8mm;margin:0;padding:2mm;font-family:Arial,sans-serif;font-size:10px;color:#000}h2{text-align:center;font-size:15px;margin:0 0 2px}.c{text-align:center;font-size:9px;line-height:1.25}table{width:100%;border-collapse:collapse;margin-top:5px}td{padding:3px 0;border-bottom:1px dotted #777;vertical-align:top}td:first-child{width:12%}td:nth-child(2){width:58%}td:last-child{width:30%;text-align:right}.r{text-align:right;line-height:1.5}.big{font-size:14px;font-weight:700;border-top:1px solid #000;padding-top:3px}.thanks{text-align:center;margin-top:5px}</style></head><body><h2>LA BISTRO</h2><div class="c">লা বিস্ট্রো<br>Multi Cuisine Family Restaurant<br>Prafullanagar, Belemath, Nadia<br>7811838548</div><div class="c">${esc(s.orderType)} • Table: ${esc(s.table)}<br>${new Date(s.at).toLocaleString('en-IN')}<br>Bill: ${esc(s.id)}</div><table><tbody>${rows}</tbody></table><div class="r">Subtotal: ${money(s.subtotal)}<br>Discount (${Number(s.discountPct||0)}%): -${money(s.discount)}<br>GST (${Number(s.taxRate||0)}%): ${money(s.tax)}<br><span class="big">TOTAL: ${money(s.total)}</span></div><div>Customer: ${esc(s.customer||'Customer')}<br>Payment: ${esc(s.payment||'Cash')}</div><div class="thanks">Thank you / ধন্যবাদ</div><script>window.onload=function(){setTimeout(function(){window.print()},250)};<\/script></body></html>`;
}
async function finalize(printMode){
  if(!Object.keys(window.cart||{}).length){alert('Add items first / আগে আইটেম যোগ করুন');return}
  if(!LB||typeof LB.saveSale!=='function'){alert('Billing system is still loading. Please refresh once.');return}
  const v=currentValues();
  const ok=await LB.saveSale(false);
  if(ok===false){LB.toast?.('Bill was not saved. Please try again.');return}
  const s=findSavedSale(v);
  if(!s){alert('Bill was saved, but could not be found locally. Please refresh and check Today\'s Sales.');return}
  if(printMode){
    const w=window.open('','_blank');
    if(!w){alert('Please allow pop-ups for printing. The bill is already saved.');return}
    w.document.open();w.document.write(thermalHtml(s));w.document.close();
  }else{
    let phone=String(v.phone||'').replace(/\D/g,'');
    if(phone.startsWith('0'))phone=phone.slice(1);
    if(phone.length===10)phone='91'+phone;
    if(phone.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return}
    const lines=(s.items||[]).map(x=>`• ${x.en} / ${x.bn} × ${x.qty} = ${money(Number(x.qty)*Number(x.price))}`).join('\n');
    const msg=`LA BISTRO\nলা বিস্ট্রো\nMulti Cuisine Family Restaurant\nPrafullanagar, Belemath, Nadia\nContact: 7811838548\n\nCustomer: ${s.customer||'Customer'}\nBill: ${s.id}\nOrder: ${s.orderType}\nTable: ${s.table}\n\n${lines}\n\nSubtotal: ${money(s.subtotal)}\nDiscount (${Number(s.discountPct||0)}%): -${money(s.discount)}\nGST (${Number(s.taxRate||0)}%): ${money(s.tax)}\nTOTAL: ${money(s.total)}\nPayment: ${s.payment}\n\nThank you / ধন্যবাদ`;
    const w=window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank');
    if(!w){alert('Please allow pop-ups to open WhatsApp. The bill is already saved.');return}
  }
  clearCurrentBill();
  LB.toast?.('Bill saved to Today\'s Sales / বিল আজকের বিক্রয়ে সেভ হয়েছে');
}
window.printReceipt=()=>finalize(true);
window.sendWhatsAppBill=()=>finalize(false);
function removeStraySource(){
  try{[...document.body.childNodes].forEach(n=>{if(n.nodeType===3&&/function\s+printReceipt|function\s+sendWhatsAppBill|window\.open\('https:\/\/wa\.me/.test(n.nodeValue||''))n.remove()})}catch(e){}
}
window.addEventListener('load',()=>setTimeout(removeStraySource,50));
})();
