/* La Bistro customer fields hard-fix v62 */
(()=>{'use strict';
function install(){
  const cart=document.querySelector('.cart');
  if(!cart){setTimeout(install,250);return;}
  let wrap=document.getElementById('lbCustomerFieldsV5');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='lbCustomerFieldsV5';
    wrap.style.cssText='display:block!important;visibility:visible!important;position:relative!important;z-index:9999!important;background:#fff8df;border:1px solid #c8a94e;border-radius:10px;padding:10px;margin:0 0 10px;width:100%;box-sizing:border-box;color:#111!important;';
    wrap.innerHTML='<div style="font-weight:800;font-size:16px;color:#111!important;margin-bottom:8px">Customer Details / কাস্টমারের তথ্য</div><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="lbCustomerNameV5" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name" style="display:block!important;visibility:visible!important;flex:1 1 150px;min-width:150px;padding:11px;border:1px solid #b8953b;border-radius:8px;background:#fff!important;color:#111!important;font-size:15px"><input id="lbCustomerPhoneV5" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel" style="display:block!important;visibility:visible!important;flex:1 1 180px;min-width:180px;padding:11px;border:1px solid #b8953b;border-radius:8px;background:#fff!important;color:#111!important;font-size:15px"></div>';
    const title=cart.querySelector('h2');
    if(title && title.parentNode===cart) title.insertAdjacentElement('afterend',wrap); else cart.prepend(wrap);
  }
  wrap.style.display='block';
  wrap.style.visibility='visible';
  const n=document.getElementById('lbCustomerNameV5'),p=document.getElementById('lbCustomerPhoneV5');
  if(n)n.style.display='block'; if(p)p.style.display='block';
  if(!window.__lbCustomerFixNewBill){
    window.__lbCustomerFixNewBill=true;
    const wait=()=>{if(typeof window.newBill!=='function'){setTimeout(wait,300);return}const old=window.newBill;window.newBill=function(){const r=old.apply(this,arguments);setTimeout(()=>{const a=document.getElementById('lbCustomerNameV5'),b=document.getElementById('lbCustomerPhoneV5');if(a)a.value='';if(b)b.value='';},0);return r};};wait();
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,1000);setTimeout(install,2500);
})();
