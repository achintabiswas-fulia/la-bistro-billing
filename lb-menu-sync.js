/* La Bistro — force menu sync after Manage Menu changes. Does not change billing logic. */
(()=>{'use strict';
const wait=()=>new Promise(resolve=>{let n=0;const t=setInterval(()=>{if(window.LB&&typeof window.LB.save==='function'){clearInterval(t);resolve(window.LB)}else if(++n>200){clearInterval(t);resolve(null)}},250)});
async function start(){const B=await wait();if(!B)return;const sync=()=>{try{if(typeof window.lbCloudPush==='function')window.lbCloudPush()}catch(e){console.error('Menu sync',e)}};
const wrap=fn=>{if(typeof fn!=='function'||fn.__lbSyncWrapped)return fn;const w=function(...args){const r=fn.apply(this,args);setTimeout(sync,100);setTimeout(sync,1000);return r};w.__lbSyncWrapped=true;return w};
let tries=0;const timer=setInterval(()=>{tries++;if(typeof window.lbSaveItem==='function')window.lbSaveItem=wrap(window.lbSaveItem);if(typeof window.lbDeleteItem==='function')window.lbDeleteItem=wrap(window.lbDeleteItem);if(typeof window.renderCustomMenuItems==='function')window.renderCustomMenuItems();if(tries>120)clearInterval(timer)},500);
setInterval(sync,3000);window.addEventListener('lb-cloud-updated',sync);window.addEventListener('online',sync);sync();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
