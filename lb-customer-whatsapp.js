/* La Bistro — customer details + reliable WhatsApp bill opening. Existing billing logic is preserved. */
(()=>{'use strict';
let wrapped=false;
function setup(){
  if(!window.LB){setTimeout(setup,300);return}
  const cart=document.querySelector('.cart');
  if(!cart){setTimeout(setup,300);return}
  if(!document.getElementById('lbCustomerWrap')){
    const wrap=document.createElement('div');wrap.id='lbCustomerWrap';
    wrap.style.cssText='display:flex;gap:8px;flex-wrap:wrap;width:100%;margin:0 0 10px;padding:10px;background:#fffaf0;border:1px solid #c8a94e;border-radius:10px;position:relative;z-index:2;box-sizing:border-box';
    wrap.innerHTML='<div style="width:100%;font-weight:800">Customer Details / কাস্টমারের তথ্য</div><input id="customer" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name" style="flex:1;min-width:180px;padding:11px;border:1px solid #bbb;border-radius:8px;background:#fff;color:#111;font-size:15px"><input id="customerPhone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel" style="flex:1;min-width:210px;padding:11px;border:1px solid #bbb;border-radius:8px;background:#fff;color:#111;font-size:15px">';
    cart.insertBefore(wrap,cart.firstElementChild);
  }
  const saved=(()=>{try{return JSON.parse(localStorage.getItem('lb_last_customer_v1')||'{}')}catch(e){return {}}})();
  const name=document.getElementById('customer'),phone=document.getElementById('customerPhone');
  if(name&&!name.value&&saved.name)name.value=saved.name;if(phone&&!phone.value&&saved.phone)phone.value=saved.phone;
  if(name&&!name.dataset.lbDraftBound){name.dataset.lbDraftBound='1';name.addEventListener('input',saveDraft)}
  if(phone&&!phone.dataset.lbDraftBound){phone.dataset.lbDraftBound='1';phone.addEventListener('input',saveDraft)}
  tryWrapSaveSale();setTimeout(tryWrapSaveSale,500);setTimeout(tryWrapSaveSale,1500);setTimeout(tryWrapSaveSale,3000);
}
function tryWrapSaveSale(){
  if(wrapped||!window.LB||typeof window.LB.saveSale!=='function')return;
  const oldSave=window.LB.saveSale;
  window.LB.saveSale=async function(print){
    const beforeIds=new Set((window.LB.sales||[]).map(s=>s.id));
    const ok=await oldSave.call(window.LB,print);
    if(ok&&print){
      try{
        const sales=window.LB.sales||[];let s=[...sales].reverse().find(x=>x&&!beforeIds.has(x.id));if(!s&&sales.length)s=sales[sales.length-1];
        if(s&&s.phone)openWhatsApp(s);else window.LB.toast?.('Add customer WhatsApp number first / কাস্টমারের WhatsApp নম্বর দিন');
      }catch(e){window.LB.toast?.('WhatsApp bill could not be opened / WhatsApp বিল খোলা যায়নি')}
    }
    return ok;
  };wrapped=true;
}
function saveDraft(){try{localStorage.setItem('lb_last_customer_v1',JSON.stringify({name:document.getElementById('customer')?.value||'',phone:document.getElementById('customerPhone')?.value||''}))}catch(e){}}
function phoneNumber(v){let p=String(v||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;return p}
function openWhatsApp(s){
  const p=phoneNumber(s.phone);if(p.length<12){window.LB.toast?.('Enter a valid WhatsApp number / সঠিক WhatsApp নম্বর দিন');return}
  const lines=['LA BISTRO','Multi Cuisine Family Restaurant','Bill: '+s.id,'Date: '+new Date(s.at).toLocaleString('en-IN'),'Customer: '+(s.customer||'Customer'),''];
  (s.items||[]).forEach(x=>lines.push(`${x.qty} x ${x.en} = ₹${Number(x.qty*x.price).toFixed(0)}`));
  lines.push('','Subtotal: ₹'+Number(s.subtotal||0).toFixed(0));if(Number(s.discount||0))lines.push('Discount: -₹'+Number(s.discount).toFixed(0));if(Number(s.tax||0))lines.push('GST: ₹'+Number(s.tax).toFixed(0));lines.push('TOTAL: ₹'+Number(s.total||0).toFixed(0),'Payment: '+(s.payment||'Cash'),'Thank you / ধন্যবাদ');
  const url='https://wa.me/'+p+'?text='+encodeURIComponent(lines.join('\n'));const w=window.open(url,'_blank');if(!w)window.LB.toast?.('WhatsApp window blocked. Allow pop-ups / WhatsApp খুলতে pop-up অনুমতি দিন');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
