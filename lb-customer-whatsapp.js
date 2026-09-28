/* La Bistro — customer details + WhatsApp copy. Existing billing logic is preserved. */
(()=>{'use strict';
function setup(){
  const controls=document.querySelector('.controls');
  if(!controls || !window.LB){setTimeout(setup,300);return}
  // Add customer fields only if they are not already present.
  if(!document.getElementById('customer')){
    const wrap=document.createElement('div');
    wrap.style.cssText='display:flex;gap:7px;flex-wrap:wrap;width:100%;margin-top:4px';
    wrap.innerHTML='<input id="customer" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name" style="flex:1;min-width:180px;padding:9px;border:1px solid #bbb;border-radius:8px;background:#fff;color:#111"><input id="customerPhone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel" style="flex:1;min-width:210px;padding:9px;border:1px solid #bbb;border-radius:8px;background:#fff;color:#111">';
    controls.appendChild(wrap);
  }
  // Restore fields for the current customer while making a new bill.
  const saved=(()=>{try{return JSON.parse(localStorage.getItem('lb_last_customer_v1')||'{}')}catch(e){return {}}})();
  const name=document.getElementById('customer'), phone=document.getElementById('customerPhone');
  if(name && !name.value && saved.name)name.value=saved.name;
  if(phone && !phone.value && saved.phone)phone.value=saved.phone;
  if(name)name.addEventListener('input',saveDraft);if(phone)phone.addEventListener('input',saveDraft);
  if(window.LB && !window.__lbCustomerWhatsWrapped){
    window.__lbCustomerWhatsWrapped=true;
    const oldSave=window.LB.saveSale;
    window.LB.saveSale=async function(print){
      const ok=await oldSave.call(window.LB,print);
      if(ok && print){
        try{
          const sales=window.LB.sales||[];
          const s=sales[sales.length-1];
          if(s && s.phone) openWhatsApp(s);
          else window.LB.toast?.('Add customer WhatsApp number to send bill / কাস্টমারের WhatsApp নম্বর দিন');
        }catch(e){}
      }
      return ok;
    };
  }
}
function saveDraft(){try{localStorage.setItem('lb_last_customer_v1',JSON.stringify({name:document.getElementById('customer')?.value||'',phone:document.getElementById('customerPhone')?.value||''}))}catch(e){}}
function phoneNumber(v){let p=String(v||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;return p}
function openWhatsApp(s){
  const p=phoneNumber(s.phone);if(p.length<12){window.LB.toast?.('Enter a valid WhatsApp number / সঠিক WhatsApp নম্বর দিন');return}
  const lines=['LA BISTRO','Multi Cuisine Family Restaurant','Bill: '+s.id,'Date: '+new Date(s.at).toLocaleString('en-IN'),'Customer: '+(s.customer||'Customer')];
  lines.push('');
  (s.items||[]).forEach(x=>lines.push(`${x.qty} x ${x.en} = ₹${Number(x.qty*x.price).toFixed(0)}`));
  lines.push('');
  lines.push('Subtotal: ₹'+Number(s.subtotal||0).toFixed(0));
  if(Number(s.discount||0))lines.push('Discount: -₹'+Number(s.discount).toFixed(0));
  if(Number(s.tax||0))lines.push('GST: ₹'+Number(s.tax).toFixed(0));
  lines.push('TOTAL: ₹'+Number(s.total||0).toFixed(0));
  lines.push('Payment: '+(s.payment||'Cash'));
  lines.push('Thank you / ধন্যবাদ');
  const url='https://wa.me/'+p+'?text='+encodeURIComponent(lines.join('\n'));
  const w=window.open(url,'_blank');
  if(!w) window.LB.toast?.('WhatsApp window blocked. Please allow pop-ups / WhatsApp খুলতে pop-up অনুমতি দিন');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
