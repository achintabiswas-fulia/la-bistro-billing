/* La Bistro customer fields v3 — visible directly above Current Bill. */
(()=>{'use strict';
function setup(){
  const cart=document.querySelector('.cart');
  if(!cart){setTimeout(setup,300);return}
  if(document.getElementById('lbCustomerFieldsV3')) return;
  const wrap=document.createElement('div');
  wrap.id='lbCustomerFieldsV3';
  wrap.style.cssText='background:#fff8df;border:1px solid #c8a94e;border-radius:10px;padding:10px;margin:0 0 8px 0;display:flex;gap:7px;flex-wrap:wrap;box-sizing:border-box;width:100%';
  wrap.innerHTML='<div style="width:100%;font-weight:800;font-size:15px;color:#111;margin-bottom:2px">Customer Details / কাস্টমারের তথ্য</div><input id="customer" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name" style="flex:1;min-width:150px;padding:10px;border:1px solid #b8953b;border-radius:8px;background:#fff;color:#111;font-size:15px"><input id="customerPhone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel" style="flex:1;min-width:180px;padding:10px;border:1px solid #b8953b;border-radius:8px;background:#fff;color:#111;font-size:15px">';
  cart.parentNode.insertBefore(wrap,cart);
  try{const d=JSON.parse(localStorage.getItem('lb_last_customer_v3')||'{}');if(d.name)document.getElementById('customer').value=d.name;if(d.phone)document.getElementById('customerPhone').value=d.phone}catch(e){}
  const save=()=>{try{localStorage.setItem('lb_last_customer_v3',JSON.stringify({name:document.getElementById('customer')?.value||'',phone:document.getElementById('customerPhone')?.value||''}))}catch(e){}};
  document.getElementById('customer').addEventListener('input',save);
  document.getElementById('customerPhone').addEventListener('input',save);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
