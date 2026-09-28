/* La Bistro customer fields — current bill only. Never reuse the previous customer's details. */
(()=>{'use strict';
function setup(){
  const cart=document.querySelector('.cart');
  if(!cart){setTimeout(setup,300);return}
  let wrap=document.getElementById('lbCustomerFieldsV3');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='lbCustomerFieldsV3';
    wrap.style.cssText='background:#fff8df;border:1px solid #c8a94e;border-radius:10px;padding:10px;margin:0 0 8px 0;display:flex;gap:7px;flex-wrap:wrap;box-sizing:border-box;width:100%';
    wrap.innerHTML='<div style="width:100%;font-weight:800;font-size:15px;color:#111;margin-bottom:2px">Customer Details / কাস্টমারের তথ্য</div><input id="customer" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name" style="flex:1;min-width:150px;padding:10px;border:1px solid #b8953b;border-radius:8px;background:#fff;color:#111;font-size:15px"><input id="customerPhone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel" style="flex:1;min-width:180px;padding:10px;border:1px solid #b8953b;border-radius:8px;background:#fff;color:#111;font-size:15px">';
    cart.parentNode.insertBefore(wrap,cart);
  }
  const name=document.getElementById('customer'),phone=document.getElementById('customerPhone');
  if(!name||!phone)return;
  // Do NOT restore any previous customer's details.
  if(!name.dataset.lbV3Bound){name.dataset.lbV3Bound='1';phone.dataset.lbV3Bound='1';}
  // Keep fields tied only to the current bill. When a new bill is started, clear them.
  if(!window.__lbCustomerNewBillWrapped){
    window.__lbCustomerNewBillWrapped=true;
    const wait=()=>{if(typeof window.newBill!=='function'){setTimeout(wait,300);return}
      const original=window.newBill;
      window.newBill=function(){const r=original.apply(this,arguments);setTimeout(()=>{name.value='';phone.value='';},0);return r};
    };wait();
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
