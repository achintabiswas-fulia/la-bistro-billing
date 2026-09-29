/* La Bistro: customer details only. Do not change menu/header layout. */
(()=>{
'use strict';
const BOX_ID='lbCustomerV73';
const byId=id=>document.getElementById(id);
function getCartBox(){return document.querySelector('.cart');}
function addStyle(){
 if(byId('lbCustomerV73Style')) return;
 const s=document.createElement('style'); s.id='lbCustomerV73Style';
 s.textContent=`
.top-actions{display:none!important}
#${BOX_ID}{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;box-sizing:border-box!important;background:#fff!important;border:1px solid #c8a94e!important;border-radius:11px!important;padding:11px!important;margin:0 0 10px!important;position:relative!important;z-index:9999!important;flex:none!important;color:#111!important}
#${BOX_ID} .v73-title{font-family:'Playfair Display',serif!important;font-size:20px!important;font-weight:700!important;margin:0 0 8px!important;color:#111!important}
#${BOX_ID} .v73-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important}
#${BOX_ID} input{display:block!important;width:100%!important;height:44px!important;box-sizing:border-box!important;padding:8px 10px!important;border:1px solid #c8a94e!important;border-radius:8px!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;font-size:15px!important}
@media(max-width:560px){#${BOX_ID} .v73-grid{grid-template-columns:1fr!important}}
`;
 document.head.appendChild(s);
}
function ensureOriginalFields(){
 let name=byId('customer'), phone=byId('customerPhone');
 if(!name){name=document.createElement('input');name.id='customer';name.type='text';name.style.display='none';document.body.appendChild(name)}
 if(!phone){phone=document.createElement('input');phone.id='customerPhone';phone.type='tel';phone.style.display='none';document.body.appendChild(phone)}
 return {name,phone};
}
function build(){
 const cartBox=getCartBox(); if(!cartBox) return;
 addStyle();
 const original=ensureOriginalFields();
 let box=byId(BOX_ID);
 if(!box){
  box=document.createElement('section'); box.id=BOX_ID;
  box.innerHTML='<div class="v73-title">Customer Details / কাস্টমারের তথ্য</div><div class="v73-grid"><input id="v73Name" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="v73Phone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel"></div>';
  const h2=cartBox.querySelector('h2');
  cartBox.insertBefore(box,h2||cartBox.firstChild);
  byId('v73Name').addEventListener('input',()=>{original.name.value=byId('v73Name').value});
  byId('v73Phone').addEventListener('input',()=>{original.phone.value=byId('v73Phone').value});
 }
 const n=byId('v73Name'), p=byId('v73Phone');
 if(n && document.activeElement!==n && original.name.value) n.value=original.name.value;
 if(p && document.activeElement!==p && original.phone.value) p.value=original.phone.value;
}
function start(){
 addStyle(); build();
 [100,300,700,1500,3000,6000].forEach(t=>setTimeout(build,t));
 setInterval(build,1000);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
