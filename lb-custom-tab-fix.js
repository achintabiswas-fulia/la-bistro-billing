/* La Bistro — reliable custom category renderer/navigation. Billing logic untouched. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const idFor=cat=>'lbcat_'+btoa(unescape(encodeURIComponent(cat))).replace(/[^a-zA-Z0-9]/g,'');
function render(){
  const B=window.LB, panel=document.getElementById('menuPanel'), tabs=document.querySelector('.tabs');
  if(!B||!panel||!tabs||!Array.isArray(B.customItems))return;
  panel.querySelectorAll('.lbCustomSection').forEach(x=>x.remove());
  tabs.querySelectorAll('.lbCustomTab').forEach(x=>x.remove());
  const groups={};
  B.customItems.forEach(x=>{const cat=(x.category||'MY ITEMS / আমার আইটেম').trim();(groups[cat]||(groups[cat]=[])).push(x)});
  Object.entries(groups).forEach(([cat,items])=>{
    const sec=document.createElement('section');sec.className='lbCustomSection';sec.id=idFor(cat);
    sec.innerHTML=`<div class="category-title">${esc(cat)}</div><div class="grid"></div>`;
    const grid=sec.querySelector('.grid');
    items.forEach(x=>{const card=document.createElement('div');card.className='item lbCustomItem';card.innerHTML=`${x.image?`<img class="lbCustomImg" src="${x.image}" alt="">`:''}<div class="en">${esc(x.en)}</div><div class="bn">${esc(x.bn)}</div><div class="price">₹${Number(x.price||0).toFixed(0)}</div>`;grid.appendChild(card)});
    panel.appendChild(sec);
    const tab=document.createElement('button');tab.type='button';tab.className='tab lbCustomTab';tab.textContent=cat.split('/')[0].trim();tab.dataset.category=cat;
    tab.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const top=Math.max(0,sec.offsetTop-panel.offsetTop-6);panel.scrollTo({top,behavior:'smooth'});tabs.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active')},true);
    tabs.appendChild(tab);
  });
}
function start(){render();setTimeout(render,150);setTimeout(render,600);setTimeout(render,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('lb-cloud-updated',()=>setTimeout(render,50));
window.addEventListener('online',()=>setTimeout(render,50));
setInterval(render,5000);
new MutationObserver(()=>{if(document.getElementById('menuPanel')&&!document.querySelector('.lbCustomTab'))render()}).observe(document.body,{childList:true,subtree:true});
})();
