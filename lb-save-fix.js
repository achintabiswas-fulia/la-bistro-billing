/* La Bistro customer + WhatsApp bill fix */
(()=>{'use strict';
let finalBusy=false;

function getCart(){
  try{if(typeof cart!=='undefined'&&cart&&Object.keys(cart).length)return cart}catch(e){}
  return window.cart||{};
}
function num(id,f=0){return Math.max(0,Number(document.getElementById(id)?.value||f)||0)}

function ensureCustomerUI(){
  if(document.getElementById('lbCustomerBox')) return;
  const cartEl=document.querySelector('.cart');
  if(!cartEl) return;
  const h2=cartEl.querySelector('h2');
  const box=document.createElement('div');
  box.id='lbCustomerBox';
  box.innerHTML=`
    <div class="lbCustomerTitle">Customer Details / কাস্টমারের তথ্য</div>
    <div class="lbCustomerGrid">
      <label>Customer Name / কাস্টমারের নাম
        <input id="lbCustomerNameV5" type="text" autocomplete="off" placeholder="Enter customer name / নাম লিখুন">
      </label>
      <label>WhatsApp Number / হোয়াটসঅ্যাপ নম্বর
        <input id="lbCustomerPhoneV5" type="tel" inputmode="numeric" autocomplete="off" placeholder="10 digit WhatsApp number">
      </label>
    </div>`;
  if(h2) h2.insertAdjacentElement('afterend',box);
  else cartEl.prepend(box);

  const st=document.createElement('style');
  st.id='lbCustomerStyle';
  st.textContent=`
    #lbCustomerBox{background:#fffaf0;border:1px solid #c8a94e;border-radius:10px;padding:9px;margin:0 0 9px}
    .lbCustomerTitle{font-weight:800;font-size:15px;margin-bottom:7px;color:#111}
    .lbCustomerGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
    .lbCustomerGrid label{font-size:12px;font-weight:700;color:#111}
    .lbCustomerGrid input{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:9px;border:1px solid #c8a94e;border-radius:7px;background:#fff;color:#111;font-size:14px}
    @media(max-width:560px){.lbCustomerGrid{grid-template-columns:1fr}.lbCustomerGrid input{font-size:16px}}
  `;
  document.head.appendChild(st);
}

function snapshotSale(){
  ensureCustomerUI();
  const c=getCart(),keys=Object.keys(c||{});
  if(!keys.length)return null;
  const items=keys.map(k=>{
    const x=c[k]||{},i=x.item||[];
    return {en:String(i[0]||x.en||''),bn:String(i[1]||x.bn||''),price:Number(i[2]??x.price??0),qty:Number(x.qty||0)};
  }).filter(x=>x.en&&x.qty>0);
  if(!items.length)return null;

  const subtotal=items.reduce((s,x)=>s+x.price*x.qty,0);
  const discountPct=num('lbDiscountPct',0)||num('freshDiscount',0)||num('discount',0);
  const discount=Math.min(subtotal,subtotal*discountPct/100);
  const gst=num('gst',0)||num('freshGst',0);
  const tax=Math.max(0,subtotal-discount)*gst/100;
  const total=Math.max(0,subtotal-discount)+tax;
  let payment='Cash';
  try{payment=String(window.payment||document.querySelector('.payment.active')?.textContent||'Cash').split('/')[0].trim()||'Cash'}catch(e){}

  const customer=(document.getElementById('lbCustomerNameV5')?.value||'').trim();
  const phone=(document.getElementById('lbCustomerPhoneV5')?.value||'').trim();
  const table=(document.getElementById('table')?.value||'-').trim()||'-';
  const orderType=(document.getElementById('orderType')?.value||'Dine In').trim()||'Dine In';

  return {
    id:'LB-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase(),
    at:new Date().toISOString(),customer:customer||'Customer',phone,table,orderType,payment,
    items,subtotal,discountPct,discount,gst,taxRate:gst,tax,total,_sig:Date.now().toString()
  };
}

async function saveLocal(s){
  if(!s)return null;
  try{
    if(window.LB&&typeof window.LB.saveSale==='function'){
      await window.LB.saveSale(false);
    }else{
      const arr=JSON.parse(localStorage.getItem('lb_sales_v2')||'[]');
      arr.push(s);localStorage.setItem('lb_sales_v2',JSON.stringify(arr));
    }
  }catch(e){console.error('Local bill save failed',e)}
  return s;
}

function whatsappUrl(s){
  let p=String(s.phone||'').replace(/\D/g,'');
  if(p.startsWith('0'))p=p.slice(1);
  if(p.length===10)p='91'+p;
  if(p.length<12)return null;
  const lines=s.items.map(x=>`• ${x.en} / ${x.bn} × ${x.qty} = ₹${(x.qty*x.price).toFixed(0)}`).join('\n');
  const msg=`LA BISTRO
লা বিস্ট্রো
Multi Cuisine Family Restaurant
Prafullanagar, Belemath, Nadia
Contact: 7811838548

Customer: ${s.customer}
Phone: ${s.phone}
Order: ${s.orderType}

BILL
${lines}

Subtotal: ₹${s.subtotal.toFixed(0)}
Discount: ₹${s.discount.toFixed(0)}
GST: ₹${s.tax.toFixed(0)}
TOTAL: ₹${s.total.toFixed(0)}
Payment: ${s.payment}

Thank you / ধন্যবাদ
Make a smile in every bite`;
  return 'https://wa.me/'+p+'?text='+encodeURIComponent(msg);
}

function sendWhatsApp(s){
  const url=whatsappUrl(s);
  if(!url){
    alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');
    document.getElementById('lbCustomerPhoneV5')?.focus();
    return false;
  }
  const w=window.open(url,'_blank');
  if(!w){alert('Please allow pop-ups to open WhatsApp.');return false;}
  return true;
}

async function finalize(mode,b){
  if(finalBusy)return;
  finalBusy=true;if(b)b.disabled=true;
  try{
    ensureCustomerUI();
    const s=snapshotSale();
    if(!s){alert('Add items first / আগে আইটেম যোগ করুন');return}
    if((mode==='whatsapp'||mode==='print-whatsapp')&&!s.phone){
      alert('Enter customer WhatsApp number / কাস্টমারের WhatsApp নম্বর দিন');
      document.getElementById('lbCustomerPhoneV5')?.focus();return;
    }
    await saveLocal(s);
    if(mode==='whatsapp') sendWhatsApp(s);
    else if(mode==='print-whatsapp'){
      sendWhatsApp(s);
      setTimeout(()=>{if(window.LB&&typeof window.LB.print==='function')window.LB.print(s);},350);
    }else if(window.LB&&typeof window.LB.print==='function')window.LB.print(s);
  }catch(e){console.error(e);alert('Action failed. Please try again')}
  finally{finalBusy=false;if(b)b.disabled=false}
}

function clearCustomer(){
  const n=document.getElementById('lbCustomerNameV5'),p=document.getElementById('lbCustomerPhoneV5');
  if(n)n.value='';if(p)p.value='';
}

function wire(){
  ensureCustomerUI();
  const oldNew=window.newBill;
  if(!window.__lbCustomerNewBill){
    window.__lbCustomerNewBill=true;
    window.newBill=function(){if(typeof oldNew==='function')oldNew();clearCustomer()};
  }
  document.addEventListener('click',e=>{
    const el=e.target.closest('button,[role="button"],[onclick]');
    if(!el)return;
    const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    const oc=(el.getAttribute('onclick')||'').toLowerCase();
    if(t.includes('print bill')||t.includes('বিল প্রিন্ট')||oc.includes('printreceipt')){
      e.preventDefault();e.stopImmediatePropagation();finalize('print-whatsapp',el);
    }else if(t.includes('whatsapp bill')||t.includes('হোয়াটসঅ্যাপ বিল')||oc.includes('sendwhatsappbill')){
      e.preventDefault();e.stopImmediatePropagation();finalize('whatsapp',el);
    }
  },true);
}

function start(){
  ensureCustomerUI();
  wire();
  setTimeout(ensureCustomerUI,500);
  setTimeout(ensureCustomerUI,1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.addEventListener('load',start);
})();
