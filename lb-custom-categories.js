/* La Bistro — refresh shared custom categories/items. Existing billing/menu renderer remains in control. */
(()=>{'use strict';
const start=()=>{try{window.renderCustomMenuItems?.()}catch(e){console.error('Custom menu refresh:',e)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('lb-cloud-updated',start);
setTimeout(start,500);setTimeout(start,1500);setTimeout(start,3000);setInterval(start,10000);
})();