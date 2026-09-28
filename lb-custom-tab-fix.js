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
