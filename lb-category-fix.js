/* La Bistro — custom category navigation fix. Does not change billing logic. */
(()=>{
'use strict';
const bind=()=>{
  const panel=document.getElementById('menuPanel');
  if(!panel)return;
  document.querySelectorAll('.tabs .lbCustomTab').forEach(tab=>{
    if(tab.dataset.lbCategoryFix==='1')return;
    tab.dataset.lbCategoryFix='1';
    tab.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      const name=(tab.textContent||'').trim().toLowerCase();
      const sections=[...panel.querySelectorAll('.lbCustomSection')];
      const sec=sections.find(s=>(s.querySelector('.category-title')?.textContent||'').trim().toLowerCase().split('/')[0].trim()===name);
      if(!sec)return;
      const top=Math.max(0,sec.offsetTop-8);
      panel.scrollTo({top,behavior:'smooth'});
      document.querySelectorAll('.tabs .tab').forEach(x=>x.classList.remove('active'));
      tab.classList.add('active');
    },true);
  });
};
const patch=()=>{
  if(typeof window.renderCustomMenuItems==='function'&&!window.renderCustomMenuItems.__lbCategoryPatched){
    const original=window.renderCustomMenuItems;
    const wrapped=function(...args){const r=original.apply(this,args);setTimeout(bind,0);setTimeout(bind,100);setTimeout(bind,400);return r};
    wrapped.__lbCategoryPatched=true;
    window.renderCustomMenuItems=wrapped;
  }
  bind();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
setTimeout(patch,100);setTimeout(patch,500);setTimeout(patch,1500);setInterval(patch,3000);
new MutationObserver(()=>bind()).observe(document.body,{childList:true,subtree:true});
})();
