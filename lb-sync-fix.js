/* La Bistro shared-device sync bridge. Keeps existing UI/billing behavior unchanged. */
(()=>{'use strict';
const B=window.LB;if(!B)return;
function money(n){return Number(n||0)}
function makeSale(){
 const rows=[...document.querySelectorAll('#fresh-billing .fresh-row')];
 if(!rows.length)return null;
 const items=rows.map(r=>{const q=Number(r.querySelector('.fresh-qty b')?.textContent||0);const en=(r.querySelector('.fresh-item b')?.textContent||'').trim();const bn=(r.querySelector('.fresh-item small')?.textContent||'').trim();const priceText=(r.querySelector('.fresh-price')?.textContent||'').replace(/[^0-9.]/g,'');return {en,bn,price:money(priceText),qty:q}}).filter(x=>x.en&&x.qty>0);
 if(!items.length)return null;
 const subtotal=items.reduce((s,x)=>s+x.price*x.qty,0);const discountPct=Math.max(0,Math.min(100,Number(document.getElementById('freshDiscount')?.value)||0));const discount=subtotal*discountPct/100;const gstRate=Math.max(0,Number(document.getElementById('freshGst')?.value)||0);const tax=(subtotal-discount)*gstRate/100;const total=subtotal-discount+tax;const now=Date.now();
 return {id:'LB-'+now.toString(36).toUpperCase(),at:new Date(now).toISOString(),customer:(document.getElementById('customer')?.value||'Customer').trim(),phone:(document.getElementById('customerPhone')?.value||'').trim(),table:(document.getElementById('table')?.value||'-').trim(),orderType:(document.getElementById('orderType')?.value||'Dine In').trim(),payment:document.querySelector('.fresh-pay.active')?.dataset.pay||'Cash',items,subtotal,discountPct,discount,taxRate:gstRate,tax,total,_freshSync:true};
}
async function syncCurrentBill(){
 try{const s=makeSale();if(!s)return false;const sig=JSON.stringify({items:s.items,subtotal:s.subtotal,discountPct:s.discountPct,tax:s.tax,total:s.total,customer:s.customer,phone:s.phone});const recent=(B.sales||[]).find(x=>x._freshSig===sig&&Date.now()-Date.parse(x.at)<10000);if(recent)return true;s._freshSig=sig;B.sales=Array.isArray(B.sales)?B.sales:[];B.sales.push(s);B.save?.('lb_sales_v2',B.sales);if(s.phone){const k=s.phone.replace(/\D/g,'')||s.phone;const q=B.customers[k]||{name:s.customer,phone:s.phone,total:0,visits:0};q.name=s.customer;q.total=(q.total||0)+s.total;q.visits=(q.visits||0)+1;q.lastAt=s.at;B.customers[k]=q;B.save?.('lb_customers_v2',B.customers)}await window.lbCloudPush?.();window.renderSales?.();window.renderReports?.();return true}catch(e){console.error('Fresh bill sync:',e);return false}}
async function syncMenu(){try{await window.lbCloudPush?.()}catch(e){console.error('Menu cloud sync:',e)}}
document.addEventListener('click',e=>{const id=e.target?.id;if(id==='freshPrint'||id==='freshWhatsApp'){setTimeout(syncCurrentBill,20)}},true);
const oldSave=window.lbSaveItem;if(typeof oldSave==='function'){window.lbSaveItem=async function(){const r=oldSave.apply(this,arguments);await syncMenu();return r}}
const oldDelete=window.lbDeleteItem;if(typeof oldDelete==='function'){window.lbDeleteItem=async function(){const r=oldDelete.apply(this,arguments);await syncMenu();return r}}
window.addEventListener('load',()=>setTimeout(()=>{syncMenu()},1800));
})();
