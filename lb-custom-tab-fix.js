/* La Bistro — custom category navigation fix. Does not touch billing. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const idFor=cat=>'lbcat_'+btoa(unescape(encodeURIComponent(cat))).replace(/[^a-zA-Z0-9]/g,'');
let lastSignature='';
function signature(B){return (B.customItems||[]).map(x=>[x.id,x.category,x.en,x.bn,x.price,x.image||''].join('|')).join('||')}
function render(){
 const B=window.LB,panel=document.getElementById('menuPanel'),tabs=document.querySelector('.tabs');
 if(!B||!panel||!tabs||!Array.isArray(B.customItems))return;
 const sig=signature(B);
 if(sig===lastSignature && panel.querySelector('.lbCustomSection')){bind();return;}
 lastSignature=sig;
 panel.querySelectorAll('.lbCustomSection').forEach(x=>x.remove());
 tabs.querySelectorAll('.lbCustomTab').forEach(x=>x.remove());
 const groups={};
 B.customItems.forEach(x=>{const cat=(x.category||'MY ITEMS / আমার আইটেম').trim();(groups[cat]||(groups[cat]=[])).push(x)});
 Object.entries(groups).forEach(([cat,items])=>{
   const sec=document.createElement('section');sec.className='lbCustomSection';sec.id=idFor(cat);sec.dataset.category=cat;
   sec.innerHTML=`<div class="category-title">${esc(cat)}</div><div class="grid"></div>`;
   const grid=sec.querySelector('.grid');
   items.forEach(x=>{const card=document.createElement('div');card.className='item lbCustomItem';card.innerHTML=`${x.image?`<img class="lbCustomImg" src="${x.image}" alt="">`:''}<div class="en">${esc(x.en)}</div><div class="bn">${esc(x.bn)}</div><div class="price">₹${Number(x.price||0).toFixed(0)}</div>`;grid.appendChild(card)});
   panel.appendChild(sec);
   const tab=document.createElement('button');tab.type='button';tab.className='tab lbCustomTab';tab.textContent=cat.split('/')[0].trim();tab.dataset.category=cat;
   tabs.appendChild(tab);
 });
 bind();
}
function go(tab){
 const panel=document.getElementById('menuPanel');if(!panel)return;
 const cat=tab.dataset.category||tab.textContent.trim();
 let sec=[...panel.querySelectorAll('.lbCustomSection')].find(s=>(s.dataset.category||'').trim()===cat);
 if(!sec)sec=[...panel.querySelectorAll('.lbCustomSection')].find(s=>(s.querySelector('.category-title')?.textContent||'').trim().toLowerCase().startsWith(cat.toLowerCase()));
 if(!sec){render();sec=[...panel.querySelectorAll('.lbCustomSection')].find(s=>(s.dataset.category||'').trim()===cat);}
 if(!sec)return;
 const top=Math.max(0,sec.offsetTop-panel.offsetTop-4);
 panel.scrollTo({top,behavior:'smooth'});
 tabsAll().forEach(t=>t.classList.remove('active'));tab.classList.add('active');
 setTimeout(()=>panel.scrollTo({top:Math.max(0,sec.offsetTop-panel.offsetTop-4),behavior:'smooth'}),250);
}
function tabsAll(){return [...document.querySelectorAll('.tabs .tab')]}
function bind(){
 tabsAll().filter(t=>t.classList.contains('lbCustomTab')).forEach(tab=>{
   if(tab.dataset.lbBound==='1')return;
   tab.dataset.lbBound='1';
   tab.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go(tab)},true);
 });
}
function start(){render();setTimeout(()=>{render();bind()},200);setTimeout(()=>{render();bind()},1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('lb-cloud-updated',()=>{lastSignature='';setTimeout(()=>{render();bind()},100)});
window.addEventListener('online',()=>{lastSignature='';setTimeout(()=>{render();bind()},100)});
setInterval(()=>bind(),2000);
})();

/* La Bistro — customer name/WhatsApp + WhatsApp bill copy. Billing totals and storage remain unchanged. */
(()=>{'use strict';
function saveDraft(){try{localStorage.setItem('lb_last_customer_v1',JSON.stringify({name:document.getElementById('customer')?.value||'',phone:document.getElementById('customerPhone')?.value||''}))}catch(e){}}
function phoneNumber(v){let p=String(v||'').replace(/\D/g,'');if(p.startsWith('0'))p=p.slice(1);if(p.length===10)p='91'+p;return p}
function openWhatsApp(s){
 const p=phoneNumber(s.phone);if(p.length<12){window.LB.toast?.('Enter a valid WhatsApp number / সঠিক WhatsApp নম্বর দিন');return}
 const lines=['LA BISTRO','Multi Cuisine Family Restaurant','Bill: '+s.id,'Date: '+new Date(s.at).toLocaleString('en-IN'),'Customer: '+(s.customer||'Customer'),''];
 (s.items||[]).forEach(x=>lines.push(`${x.qty} x ${x.en} = ₹${Number(x.qty*x.price).toFixed(0)}`));
 lines.push('','Subtotal: ₹'+Number(s.subtotal||0).toFixed(0));
 if(Number(s.discount||0))lines.push('Discount: -₹'+Number(s.discount).toFixed(0));
 if(Number(s.tax||0))lines.push('GST: ₹'+Number(s.tax).toFixed(0));
 lines.push('TOTAL: ₹'+Number(s.total||0).toFixed(0),'Payment: '+(s.payment||'Cash'),'Thank you / ধন্যবাদ');
 const w=window.open('https://wa.me/'+p+'?text='+encodeURIComponent(lines.join('\n')),'_blank');
 if(!w)window.LB.toast?.('WhatsApp window blocked. Please allow pop-ups / WhatsApp খুলতে pop-up অনুমতি দিন');
}
function setup(){
 const controls=document.querySelector('.controls');if(!controls||!window.LB){setTimeout(setup,300);return}
 if(!document.getElementById('customer')){
   const wrap=document.createElement('div');wrap.id='lbCustomerFields';wrap.style.cssText='display:flex;gap:7px;flex-wrap:wrap;width:100%;margin-top:4px';
   wrap.innerHTML='<input id="customer" type="text" placeholder="Customer Name / কাস্টমারের নাম" autocomplete="name"><input id="customerPhone" type="tel" inputmode="numeric" placeholder="WhatsApp Number / WhatsApp নম্বর" autocomplete="tel">';
   controls.appendChild(wrap);
   const style=document.createElement('style');style.textContent='#lbCustomerFields input{flex:1;min-width:180px;padding:9px;border:1px solid #bbb;border-radius:8px;background:#fff;color:#111;font-family:inherit}#lbCustomerFields input::placeholder{color:#666}';document.head.appendChild(style);
 }
 const saved=(()=>{try{return JSON.parse(localStorage.getItem('lb_last_customer_v1')||'{}')}catch(e){return {}}})();
 const name=document.getElementById('customer'),phone=document.getElementById('customerPhone');
 if(name&&!name.value&&saved.name)name.value=saved.name;if(phone&&!phone.value&&saved.phone)phone.value=saved.phone;
 name?.addEventListener('input',saveDraft);phone?.addEventListener('input',saveDraft);
 if(!window.__lbCustomerWhatsWrapped){
   window.__lbCustomerWhatsWrapped=true;
   const oldSave=window.LB.saveSale;
   window.LB.saveSale=async function(print){
     const ok=await oldSave.call(window.LB,print);
     if(ok&&print){try{const sales=window.LB.sales||[];const m=window.LB.meta?.()||{};const candidates=sales.filter(s=>s.customer===m.customer&&s.phone===m.phone);const s=candidates[candidates.length-1];if(s&&s.phone)openWhatsApp(s);else window.LB.toast?.('Add customer WhatsApp number to send bill / কাস্টমারের WhatsApp নম্বর দিন')}catch(e){}}
     return ok;
   };
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
