/* La Bistro customer fields v2 — independent of the old customer module. */
(()=>{'use strict';
function ready(){
  const controls=document.querySelector('.controls');
  if(!controls){setTimeout(ready,300);return;}
  if(!document.getElementById('lbCustomerFields')){
    const wrap=document.createElement('div');
    wrap.id='lbCustomerFields';
    wrap.style.cssText='display:flex;gap:7px;flex-wrap:wrap;width:100%;padding:4px 0;background:#fff';
    wrap.innerHTML='<input id="customer" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name" style="flex:1;min-width:180px;padding:10px;border:1px solid #b8953b;border-radius:8px;background:#fff;color:#111;font-size:15px"><input id="customerPhone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel" style="flex:1;min-width:210px;padding:10px;border:1px solid #b8953b;border-radius:8px;background:#fff;color:#111;font-size:15px">';
    controls.appendChild(wrap);
  }
  const n=document.getElementById('customer'),p=document.getElementById('customerPhone');
  try{const d=JSON.parse(localStorage.getItem('lb_last_customer_v2')||'{}');if(n&&!n.value)n.value=d.name||'';if(p&&!p.value)p.value=d.phone||''}catch(e){}
  if(n&&!n.dataset.bound){n.dataset.bound='1';n.addEventListener('input',save)}
  if(p&&!p.dataset.bound){p.dataset.bound='1';p.addEventListener('input',save)}
  if(window.LB&&!window.__lbWhatsV2){
    window.__lbWhatsV2=true;
    const old=window.LB.saveSale;
    window.LB.saveSale=async function(print){
      const ok=await old.call(window.LB,print);
      if(ok&&print){setTimeout(()=>{try{const s=(window.LB.sales||[])[(window.LB.sales||[]).length-1];if(s&&s.phone)send(s);else window.LB.toast?.('Add WhatsApp number / WhatsApp নম্বর দিন')}catch(e){}},250)}
      return ok;
    };
  }
}
function save(){try{localStorage.setItem('lb_last_customer_v2',JSON.stringify({name:document.getElementById('customer')?.value||'',phone:document.getElementById('customerPhone')?.value||''}))}catch(e){}}
function send(s){let p=String(s.phone||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;if(p.length<12){window.LB?.toast?.('Enter valid WhatsApp number / সঠিক নম্বর দিন');return}const lines=['LA BISTRO','Bill: '+s.id,'Customer: '+(s.customer||'Customer'),''];(s.items||[]).forEach(x=>lines.push(x.qty+' x '+x.en+' = ₹'+Number(x.qty*x.price).toFixed(0)));lines.push('','TOTAL: ₹'+Number(s.total||0).toFixed(0),'Payment: '+(s.payment||'Cash'),'Thank you / ধন্যবাদ');window.open('https://wa.me/'+p+'?text='+encodeURIComponent(lines.join('\n')),'_blank')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
