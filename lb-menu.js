/* La Bistro POS — restore the approved menu UI, then add quantity badges. */
(()=>{
  'use strict';

  function loadApprovedMenu(){
    if(window.__lbApprovedMenuLoaded) return Promise.resolve();
    window.__lbApprovedMenuLoaded=true;
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='./lb-repair-v3.js?v=14';
      s.onload=()=>resolve();
      s.onerror=()=>{window.__lbApprovedMenuLoaded=false;reject(new Error('Menu script failed to load'))};
      document.head.appendChild(s);
    });
  }

  function syncQuantityBadges(){
    const panel=document.getElementById('menuPanel');
    if(!panel) return;
    const cart=window.cart||{};
    panel.querySelectorAll('.item').forEach(btn=>{
      let badge=btn.querySelector('.qty');
      if(!badge){
        badge=document.createElement('span');
        badge.className='qty';
        btn.prepend(badge);
      }
      const en=(btn.querySelector('.en')?.textContent||'').trim();
      const bn=(btn.querySelector('.bn')?.textContent||'').trim();
      let qty=0;
      Object.values(cart).forEach(v=>{
        if(!v || !Array.isArray(v.item)) return;
        const ven=String(v.item[0]??'').trim();
        const vbn=String(v.item[1]??'').trim();
        if((en && ven===en) || (bn && vbn===bn)) qty=Math.max(qty,Number(v.qty||0));
      });
      badge.textContent=qty>0?String(qty):'';
      badge.style.display=qty>0?'flex':'none';
    });
  }

  function style(){
    if(document.getElementById('lb-approved-menu-style')) return;
    const s=document.createElement('style');
    s.id='lb-approved-menu-style';
    s.textContent=`
      .tabs{display:flex!important;overflow-x:auto!important;gap:6px!important}
      .tab{display:block!important;visibility:visible!important;opacity:1!important;color:#111!important;background:#fff!important;font-weight:900!important;cursor:pointer!important;touch-action:manipulation!important}
      .tab.active{color:#111!important;background:#f3d36a!important}
      .menu-panel{display:block!important;visibility:visible!important;opacity:1!important}
      .grid{display:grid!important;gap:9px!important;overflow-x:auto!important}
      .item{display:block!important;visibility:visible!important;opacity:1!important;background:#fff!important;color:#111!important;cursor:pointer!important;touch-action:manipulation!important;position:relative!important}
      .item .en{color:#111!important;font-weight:900!important}
      .item .bn{color:#333!important;font-weight:800!important}
      .item .price{color:#111!important;font-weight:900!important}
      .item .qty{position:absolute!important;top:7px!important;left:7px!important;min-width:30px!important;height:30px!important;padding:0 7px!important;border-radius:50%!important;background:#d69f27!important;color:#111!important;font-weight:900!important;font-size:18px!important;line-height:30px!important;text-align:center!important;align-items:center!important;justify-content:center!important;z-index:20!important;box-shadow:0 1px 3px rgba(0,0,0,.25)!important}
      .cart{color:#111!important;background:#fff!important}
      #gst,#discount,#lbDiscountPct{background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important}
      .top-actions .btn,.top-actions button{color:#111!important;-webkit-text-fill-color:#111!important;font-weight:900!important;background:#fff8e6!important;border:1px solid #d4a72c!important}
      @media(max-width:700px){.grid{grid-template-columns:repeat(2,minmax(145px,1fr))!important}.item{min-height:128px!important}}
    `;
    document.head.appendChild(s);
  }

  async function start(){
    style();
    try{ await loadApprovedMenu(); }catch(e){ console.error(e); return; }
    const render=()=>{
      try{ window.injectLBMenu?.(); }catch(e){ console.error(e); }
      try{ window.renderMenu?.(); }catch(e){ console.error(e); }
      setTimeout(syncQuantityBadges,50);
    };
    render();
    setTimeout(render,250);
    setTimeout(render,800);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#menuPanel .item')) setTimeout(syncQuantityBadges,80);
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.addEventListener('load',()=>setTimeout(start,200));
})();
