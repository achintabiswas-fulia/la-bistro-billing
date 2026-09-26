/* La Bistro Billing — shared cloud sync + locked completed-bill actions. */
(()=>{'use strict';
const B=window.LB;if(!B)return;
const CLOUD={url:'https://hzlnqiojekckaywjyhcy.supabase.co',key:'sb_publishable_vf-fqMTFr9vOnWH3kFllIA_57h1jEnl',store:'la-bistro'};B.cloud=CLOUD;
const ep=()=>CLOUD.url+'/rest/v1/la_bistro_sales';
const hd=()=>({apikey:CLOUD.key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'});
function merge(a,b){const m=new Map();[...(a||[]),...(b||[])].forEach(x=>{if(x?.id)m.set(String(x.id),x)});return [...m.values()].sort((x,y)=>String(x.at||'').localeCompare(String(y.at||'')))}
async function remote(){const r=await fetch(ep()+'?store_id=eq.'+encodeURIComponent(CLOUD.store)+'&order=created_at.asc',{headers:hd(),cache:'no-store'});if(!r.ok)throw Error(await r.text());return(await r.json()).map(x=>x.sale).filter(Boolean)}
async function push(){
 const local=Array.isArray(B.sales)?B.sales:[];
 if(!local.length)return true;
 const rows=local.map(s=>({id:String(s.id),store_id:CLOUD.store,sale:s,created_at:s.at||new Date().toISOString()}));
 const r=await fetch(ep()+'?on_conflict=id',{method:'POST',headers:hd(),body:JSON.stringify(rows)});
 if(!r.ok)throw Error(await r.text());
 return true;
}
async function pull(){try{B.sales=merge(B.sales||[],await remote());B.save?.('lb_sales_v2',B.sales);window.renderSales?.();window.renderReports?.();return true}catch(e){console.error('Cloud sales sync:',e);return false}}
window.lbCloudPush=async()=>{try{await push();return true}catch(e){console.error('Cloud push:',e);return false}};
window.lbCloudPull=pull;
function clearBill(){window.cart={};try{document.getElementById('discount').value=0}catch(e){}try{document.getElementById('gst').value=0}catch(e){}try{document.getElementById('lbDiscountPct').value=0}catch(e){}window.renderMenu?.();window.renderCart?.()}
function latest(before){const a=B.sales||[];return a.slice().reverse().find(x=>!before.has(String(x.id)))||a[a.length-1]}
function sendWhatsApp(s){let phone=String(s.phone||'').replace(/\D/g,'');if(phone.startsWith('0'))phone=phone.slice(1);if(phone.length===10)phone='91'+phone;if(phone.length<12){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');return false}const lines=(s.items||[]).map(x=>`• ${x.en} / ${x.bn} × ${x.qty} = ${B.money(x.qty*x.price)}`).join('\n');const msg=`LA BISTRO\nলা বিস্ট্রো\nMulti Cuisine Family Restaurant\nPrafullanagar, Belemath, Nadia\nContact: 7811838548\n\nCustomer: ${s.customer||'Customer'}\nBill: ${s.id}\nOrder: ${s.orderType}\nTable: ${s.table}\n\n${lines}\n\nSubtotal: ${B.money(s.subtotal)}\nDiscount (${Number(s.discountPct||0)}%): -${B.money(s.discount)}\nGST (${Number(s.taxRate||0)}%): ${B.money(s.tax)}\nTOTAL: ${B.money(s.total)}\nPayment: ${s.payment}\n\nThank you / ধন্যবাদ`;const w=window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank');if(!w){alert('Please allow pop-ups to open WhatsApp. The bill is already saved.');return false}return true}
async function complete(mode){
 if(!Object.keys(window.cart||{}).length){alert('Add items first / আগে আইটেম যোগ করুন');return}
 const before=new Set((B.sales||[]).map(x=>String(x.id)));
 const ok=await B.saveSale(false);
 const s=latest(before);
 if(!s){B.toast?.('Bill was not saved. Please try again.');return}
 if(!ok)console.warn('Cloud sync unavailable; local bill remains saved:',s.id);
 if(mode==='print'){if(B.print)B.print(s);else alert('Printer module is loading. The bill is already saved.')}else if(!sendWhatsApp(s))return;
 clearBill();window.renderSales?.();window.renderReports?.();B.toast?.('Bill saved to Today\'s Sales / বিল আজকের বিক্রয়ে সেভ হয়েছে');
}
window.addEventListener('load',()=>setTimeout(async()=>{
 await pull();
 setInterval(pull,15000);
 // Final action handlers are installed after all other billing scripts load.
 // Therefore PRINT BILL and WHATSAPP BILL use the existing tested save routine,
 // and the current bill is saved before it is cleared.
 window.printReceipt=()=>complete('print');
 window.sendWhatsAppBill=()=>complete('whatsapp');
},1200));
})();
