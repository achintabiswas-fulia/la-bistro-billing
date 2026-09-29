/* La Bistro: customer details + customer WhatsApp bill only. Do not change menu/header layout. */
(()=>{
'use strict';
const BOX='lbCustomerV75';
const $=id=>document.getElementById(id);

function billBox(){
  const old=document.querySelector('.cart');
  if(old)return old;
  const items=$('cartItems');
  if(items){
    let el=items;
    for(let i=0;i<8&&el;i++,el=el.parentElement){
      const h=[...el.querySelectorAll('h2')].find(x=>/current bill/i.test(x.textContent||''));
      if(h)return el;
    }
    return items.parentElement?.parentElement||items.parentElement||null;
  }
  const h=[...document.querySelectorAll('h2')].find(x=>/current bill/i.test(x.textContent||''));
  return h?.parentElement||null;
}
function css(){
 if($('lbCustomerV75Style'))return;
 const s=document.createElement('style');s.id='lbCustomerV75Style';s.textContent=`
#${BOX}{margin:0 0 14px;padding:12px 14px;border:1px solid #d8b45a;border-radius:12px;background:#fff;box-sizing:border-box}
#${BOX} .v75-title{font-weight:700;font-size:18px;margin-bottom:9px}
#${BOX} .v75-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#${BOX} input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d8d8d8;border-radius:9px;font-size:16px;background:#fff}
@media(max-width:560px){#${BOX} .v75-grid{grid-template-columns:1fr}}
`;
 document.head.appendChild(s);
}
function hiddenFields(){
 let n=$('customer'),p=$('customerPhone');
 if(!n){n=document.createElement('input');n.id='customer';n.type='text';n.hidden=true;document.body.appendChild(n)}
 if(!p){p=document.createElement('input');p.id='customerPhone';p.type='tel';p.hidden=true;document.body.appendChild(p)}
 return{n,p};
}
function build(){
 css();
 const c=billBox();if(!c)return;
 const h=hiddenFields();
 let b=$(BOX);
 if(!b){
  b=document.createElement('section');b.id=BOX;
  b.innerHTML='<div class="v75-title">Customer Details / কাস্টমারের তথ্য</div><div class="v75-grid"><input id="v75Name" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="v75Phone" type="tel" inputmode="numeric" placeholder="Phone / WhatsApp Number / ফোন / WhatsApp নম্বর" autocomplete="tel"></div>';
  const title=[...c.querySelectorAll('h2')].find(x=>/current bill/i.test(x.textContent||''))||c.querySelector('h2');
  c.insertBefore(b,title||c.firstChild||null);
  $('v75Name').addEventListener('input',()=>h.n.value=$('v75Name').value);
  $('v75Phone').addEventListener('input',()=>h.p.value=$('v75Phone').value);
 }
 if($('v75Name')&&h.n.value&&!$('v75Name').value)$('v75Name').value=h.n.value;
 if($('v75Phone')&&h.p.value&&!$('v75Phone').value)$('v75Phone').value=h.p.value;
}
function billData(){
 const rows=[...document.querySelectorAll('#cartItems .cart-row')];
 if(!rows.length)return null;
 const items=rows.map(r=>{
  const qty=Number(r.querySelector('.bill-qty')?.textContent||1)||1;
  const en=(r.querySelector('.cart-name')?.textContent||'').trim();
  const bn=(r.querySelector('.cart-bn')?.textContent||'').trim();
  const priceText=(r.querySelector('.bill-price')?.textContent||'').replace(/[^0-9.]/g,'');
  const price=Number(priceText)||0;
  return{qty,en,bn,price};
 });
 const text=id=>($(id)?.textContent||'').trim();
 return{items,sub:text('subtotal'),total:text('total'),name:($('v75Name')?.value||$('customer')?.value||'').trim(),phone:($('v75Phone')?.value||$('customerPhone')?.value||'').trim()};
}
function openWA(){
 const s=billData();if(!s)return alert('Add items first / আগে আইটেম যোগ করুন');
 const raw=s.phone.replace(/\D/g,'');
 if(raw.length<10){alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');$('v75Phone')?.focus();return;}
 let number=raw;
 if(number.length===10)number='91'+number;
 let m='LA BISTRO / লা বিস্ট্রো\n';
 if(s.name)m+='Customer: '+s.name+'\n';
 m+='Phone / WhatsApp: '+s.phone+'\n\n';
 s.items.forEach(x=>m+=x.qty+' x '+x.en+(x.bn?' / '+x.bn:'')+' = ₹'+(x.qty*x.price).toFixed(0)+'\n');
 m+='\nTotal: '+s.total;
 window.open('https://wa.me/'+number+'?text='+encodeURIComponent(m),'_blank');
}
function wire(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const t=(b.textContent||'').replace(/\s+/g,' ').toLowerCase();
  if(t.includes('whatsapp bill')||t.includes('whatsapp')){e.preventDefault();e.stopImmediatePropagation();openWA();}
 },true);
}
function start(){
 css();build();wire();
 [100,300,700,1500,3000,6000].forEach(t=>setTimeout(build,t));
 setInterval(build,1500);
 const observer=new MutationObserver(()=>{if(!$(BOX))build()});
 observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
