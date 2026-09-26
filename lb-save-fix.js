/* La Bistro final bill actions fix
   LOCKED: only PRINT or WHATSAPP finalizes/saves a bill.
   No menu, formula, layout, quantity, or other billing behavior changes. */
(()=>{'use strict';
const LB=window.LB;
const CLOUD_URL='https://hzlnqiojekckaywjyhcy.supabase.co';
const CLOUD_KEY='sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl';
const STORE_ID='la-bistro';
function currentValues(){
 const items=Object.keys(window.cart||{}).map(k=>window.cart[k]);
 const subtotal=items.reduce((s,x)=>s+Number(x.qty||0)*Number(x.item?.[2]||0),0);
 const pct=Math.max(0,Math.min(100,Number(document.getElementById('lbDiscountPct')?.value||document.getElementById('discount')?.value||0)));
 const discount=subtotal*pct/100;
 const gstRate=Math.max(0,Number(document.getElementById('gst')?.value||0));
 const taxable=Math.max(0,subtotal-discount),gst=taxable*gstRate/100,total=taxable+gst;
 return {items,subtotal,pct,discount,gstRate,gst,total,customer:(document.getElementById('customer')?.value||'Customer').trim(),phone:(document.getElementById('customerPhone')?.value||'').trim(),table:(document.getElementById('table')?.value||'-').trim(),orderType:(document.getElementById('orderType')?.value||'Dine In').trim(),payment:window.payment||'Cash'};
}
function itemValues(x){return x?.item?{en:String(x.item[0]||''),bn:String(x.item[1]||''),price:Number(x.item[2]||0),qty:Number(x.qty||0)}:{en:String(x?.en||x?.name||''),bn:String(x?.bn||''),price:Number(x?.price||0),qty:Number(x?.qty||0)}}
function makeSale(v){return {id:'LB-'+Date.now(),at:new Date().toISOString(),items:v.items.map(itemValues),subtotal:v.subtotal,discountPct:v.pct,discount:v.discount,taxRate:v.gstRate,tax:v.gst,total:v.total,grand:v.total,customer:v.customer,phone:v.phone,table:v.table,orderType:v.orderType,payment:v.payment};}
function clearCurrentBill(){window.cart={};try{document.getElementById('discount').value=0}catch(e){}try{document.getElementById('gst').value=0}catch(e){}try{document.getElementById('lbDiscountPct').value=0}catch(e){}window.renderMenu?.();window.renderCart?.();}
function esc(s){return LB?.esc?LB.esc(s):String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function money(n){return LB?.money?LB.money(n):'₹'+Number(n||0).toFixed(0)}
function thermalHtml(s){const rows=(s.items||[]).map(x=>`<tr><td>${x.qty}</td><td>${esc(x.en)}<br><span>${esc(x.bn)}</span></td><td style="text-align:right">${money(Number(x.qty)*Number(x.price))}</td></tr>`).join('');return `<!doctype html><html><head><meta charset="utf-8"><title>La Bistro ${esc(s.id)}</title><style>@page{size:50.8mm auto;margin:0}*{box-sizing:border-box}body{width:50.8mm;margin:0;padding:2mm;font-family:Arial,sans-serif;font-size:10px;color:#000}h2{text-align:center;font-size:15px;margin:0 0 2px}.c{text-align:center;font-size:9px;line-height:1.25}table{width:100%;border-collapse:collapse;margin-top:5px}td{padding:3px 0;border-bottom:1px dotted #777;vertical-align:top}td:first-child{width:12%}td:nth-child(2){width:58%}td:last-child{width:30%;text-align:right}.r{text-align:right;line-height:1.5}.big{font-size:14px;font-weight:700;border-top:1px solid #000;padding-top:3px}.thanks{text-align:center;margin-top:5px}</style></head><body><h2>LA BISTRO</h2><div class="c">লা বিস্ট্রো<br>Multi Cuisine Family Restaurant<br>Prafullanagar, Belemath, Nadia<br>7811838548</div><div class="c">${esc(s.orderType)} • Table: ${esc(s.table)}<br>${new Date(s.at).toLocaleString('en-IN')}<br>Bill: ${esc(s.id)}</div><table><tbody>${rows}</tbody></table><div class="r">Subtotal: ${money(s.subtotal)}<br>Discount (${Number(s.discountPct||0)}%): -${money(s.discount)}<br>GST (${Number(s.taxRate||0)}%): ${money(s.tax)}<br><span class="big">TOTAL: ${money(s.total)}</span></div><div>Customer: ${esc(s.customer||'Customer')}<br>Payment: ${esc(s.payment||'Cash')}</div><div class="thanks">Thank you / ধন্যবাদ</div><script>window.onload=function(){setTimeout(function(){window.print()},250)};<\/script></body></html>`}
async function cloudSaveOne(sale){
 const r=await fetch(CLOUD_URL+'/rest/v1/la_bistro_sales?on_conflict=id',{method:'POST',headers:{apikey:CLOUD_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([{id:sale.id,store_id:STORE_ID,sale: sale,created_at:sale.at}])});
 if(!r.ok)throw Error(await r.text());
 return true;
}
async function finalize(mode){
 if(!Object.keys(window.cart||{}).length){alert('Add items first / আগে আইটেম যোগ করুন');return}
 if(!LB){alert('Billing system is still loading. Please refresh once.');return}
 const v=currentValues();
 const sale=makeSale(v);
 // ONLY PRINT or WHATSAPP creates a completed sale.
 LB.sales=Array.isArray(LB.sales)?LB.sales:[];
 LB.sales.push(sale);
 try{LB.save('lb_sales_v2',LB.sales)}catch(e){}
 // Directly save this bill to the shared sales table. This is independent of the cloud-sync wrapper.
 try{await cloudSaveOne(sale)}catch(e){
   LB.sales=LB.sales.filter(x=>x.id!==sale.id);try{LB.save('lb_sales_v2',LB.sales)}catch(_e){}
   LB.toast?.('Bill was not saved. Please try again.');console.error('La Bistro bill save failed',e);return;
 }
 if(mode==='print'){
   const w=window.open('','_blank');
   if(!w){alert('Please allow pop-ups for printing. The bill is already saved.');return}
   w.document.open();w.document.write(thermalHtml(sale));w.document.close();
 }else{
   let phone=String(v.phone||'').replace(/\D/g,'');if(phone.startsWith('0'))phone=phone.slice(1);if(phone.length===10)phone='91'+phone;
   if(phone.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return}
   const lines=sale.items.map(x=>`• ${x.en} / ${x.bn} × ${x.qty} = ${money(Number(x.qty)*Number(x.price))}`).join('\n');
   const msg=`LA BISTRO\nলা বিস্ট্রো\nMulti Cuisine Family Restaurant\nPrafullanagar, Belemath, Nadia\nContact: 7811838548\n\nCustomer: ${sale.customer||'Customer'}\nBill: ${sale.id}\nOrder: ${sale.orderType}\nTable: ${sale.table}\n\n${lines}\n\nSubtotal: ${money(sale.subtotal)}\nDiscount (${Number(sale.discountPct||0)}%): -${money(sale.discount)}\nGST (${Number(sale.taxRate||0)}%): ${money(sale.tax)}\nTOTAL: ${money(sale.total)}\nPayment: ${sale.payment}\n\nThank you / ধন্যবাদ`;
   const w=window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank');
   if(!w){alert('Please allow pop-ups to open WhatsApp. The bill is already saved.');return}
 }
 clearCurrentBill();LB.toast?.('Bill saved to Today\'s Sales / বিল আজকের বিক্রয়ে সেভ হয়েছে');
}
window.printReceipt=()=>finalize('print');
window.sendWhatsAppBill=()=>finalize('whatsapp');
})();