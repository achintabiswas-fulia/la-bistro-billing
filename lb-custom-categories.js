/* La Bistro — custom category/item refresh fix. Billing logic is untouched. */
(()=>{'use strict';
const refresh=()=>{try{window.renderCustomMenuItems?.()}catch(e){console.error('Custom menu refresh:',e)}};
const refreshAfterTab=()=>{refresh();setTimeout(refresh,0);setTimeout(refresh,80);setTimeout(refresh,250)};
const bind=()=>{
  document.querySelectorAll('.tabs .tab').forEach(t=>{
    if(t.dataset.lbCustomRefreshBound)return;
    t.dataset.lbCustomRefreshBound='1';
    t.addEventListener('click',refreshAfterTab,true);
  });
};
const start=()=>{refresh();bind();setTimeout(()=>{refresh();bind()},100);setTimeout(()=>{refresh();bind()},500);setTimeout(()=>{refresh();bind()},1500)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('lb-cloud-updated',()=>{refresh();bind()});
new MutationObserver(()=>bind()).observe(document.body,{childList:true,subtree:true});
setInterval(()=>{refresh();bind()},10000);
})();
