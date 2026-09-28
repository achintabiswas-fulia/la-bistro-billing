/* La Bistro — custom category tab navigation fix. Billing logic untouched. */
(()=>{'use strict';
const go=()=>{
  const panel=document.getElementById('menuPanel');
  if(!panel)return;
  document.querySelectorAll('.tabs .lbCustomTab').forEach(btn=>{
    if(btn.dataset.lbTabFix)return;
    btn.dataset.lbTabFix='1';
    btn.addEventListener('click',ev=>{
      ev.preventDefault();
      ev.stopImmediatePropagation();
      const name=(btn.textContent||'').trim().toLowerCase();
      const sections=[...panel.querySelectorAll('.lbCustomSection')];
      const sec=sections.find(s=>(s.querySelector('.category-title')?.textContent||'').trim().toLowerCase().startsWith(name));
      if(!sec)return;
      const top=Math.max(0,sec.offsetTop-panel.offsetTop-4);
      panel.scrollTo({top,behavior:'smooth'});
      setTimeout(()=>window.injectMenuControls?.(),150);
    },true);
  });
};
const start=()=>{go();setTimeout(go,100);setTimeout(go,500);setTimeout(go,1500)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
new MutationObserver(go).observe(document.body,{childList:true,subtree:true});
})();
