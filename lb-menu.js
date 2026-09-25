/* La Bistro Billing — clean menu enhancement. The original menu renderer in index.html remains the source of truth. */
(()=>{
'use strict';
const B=window.LB;
const esc=B?.esc || (s=>String(s).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m])));

/* Show a clear quantity badge on every tappable menu item.
   The number is taken from the real cart, so 1 tap = 1, 2 taps = 2, etc. */
function syncNativeQty(){
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
    const price=(btn.querySelector('.price')?.textContent||'').replace(/[^0-9.]/g,'');
    let qty=0;
    Object.values(cart).forEach(v=>{
      if(!v || !Array.isArray(v.item)) return;
      const ven=String(v.item[0]??'').trim();
      const vbn=String(v.item[1]??'').trim();
      const vp=String(v.item[2]??'');
      if((en && ven===en) || (bn && vbn===bn) || (price && vp===price)) qty=Math.max(qty,Number(v.qty||0));
    });
    badge.textContent=qty>0?String(qty):'';
    badge.style.display=qty>0?'flex':'none';
  });
}

function injectCustom(){
  const p=document.getElementById('menuPanel');
  if(!p || !B || !Array.isArray(B.customItems)) return;
  document.getElementById('lbCustomSection')?.remove();
  if(!B.customItems.length) return;
  const q=(document.getElementById('search')?.value||'').toLowerCase().trim();
  const a=B.customItems.filter(x=>!q||(`${x.en||''} ${x.bn||''}`).toLowerCase().includes(q));
  if(!a.length) return;
  const d=document.createElement('div');
  d.id='lbCustomSection';
  d.innerHTML=`<div class="category-title">EXTRA ITEMS / অতিরিক্ত আইটেম</div><div class="grid">${a.map(x=>{const k='custom::'+x.id,qty=window.cart?.[k]?.qty||0;return `<button type="button" class="item lbCustom" data-custom-id="${esc(x.id)}"><span class="qty">${qty}</span><div class="en">${esc(x.en)}</div><div class="bn">${esc(x.bn)}</div><div class="price">₹${Number(x.price||0).toFixed(0)}</div></button>`}).join('')}</div>`;
  p.appendChild(d);
  d.querySelectorAll('[data-custom-id]').forEach(btn=>btn.addEventListener('click',()=>{const x=B.customItems.find(v=>v.id===btn.dataset.customId);if(!x||!window.cart)return;const k='custom::'+x.id;window.cart[k]=window.cart[k]||{item:[x.en,x.bn,Number(x.price||0)],qty:0};window.cart[k].qty++;window.renderMenu?.();window.renderCart?.();setTimeout(syncNativeQty,20)}));
}

function wrap(){
  if(window.__lbCleanMenuWrapped)return;
  window.__lbCleanMenuWrapped=true;
  const original=window.renderMenu;
  window.renderMenu=function(){original?.();injectCustom();setTimeout(syncNativeQty,0)};
  window.renderMenu?.();window.renderCart?.();setTimeout(syncNativeQty,30);
}

function style(){
  if(document.getElementById('lb-clean-style'))return;
  const s=document.createElement('style');s.id='lb-clean-style';s.textContent=`
    .tabs{display:flex!important;overflow-x:auto!important;gap:6px!important}
    .tab{color:#111!important;background:#fff!important;font-weight:900!important;cursor:pointer!important;touch-action:manipulation!important}
    .tab.active{color:#111!important;background:#f3d36a!important}
    .menu-panel{display:block!important;visibility:visible!important;opacity:1!important}
    .category-title{color:#111!important;background:#fff8df!important;font-weight:900!important}
    .grid{display:grid!important;grid-template-columns:repeat(4,minmax(145px,1fr))!important;gap:9px!important;overflow-x:auto!important}
    .item{display:block!important;visibility:visible!important;opacity:1!important;background:#fff!important;color:#111!important;min-height:128px!important;cursor:pointer!important;touch-action:manipulation!important;position:relative!important;padding-top:28px!important}
    .item .en{color:#111!important;font-weight:900!important}.item .bn{color:#333!important;font-weight:800!important}.item .price{color:#111!important;font-weight:900!important}
    .item .qty{position:absolute!important;top:7px!important;left:7px!important;min-width:30px!important;height:30px!important;padding:0 7px!important;border-radius:50%!important;background:#d69f27!important;color:#111!important;font-weight:900!important;font-size:18px!important;line-height:30px!important;text-align:center!important;align-items:center!important;justify-content:center!important;z-index:5!important;box-shadow:0 1px 3px rgba(0,0,0,.25)!important}
    .cart{color:#111!important;background:#fff!important}
    #gst,#discount{background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;border:1px solid #b8953b!important;font-weight:800!important}
    .top-actions .btn,.top-actions button{color:#111!important;-webkit-text-fill-color:#111!important;font-weight:900!important;background:#fff8e6!important;border:1px solid #d4a72c!important}
    .btn.primary{color:#111!important;-webkit-text-fill-color:#111!important;background:linear-gradient(#f2c75c,#d9a62e)!important}
    @media(max-width:700px){.grid{grid-template-columns:repeat(2,minmax(145px,1fr))!important}.item{min-height:128px!important}}
  `;document.head.appendChild(s);
}

/* Re-sync shortly after any menu tap. This does not replace the original tap logic. */
document.addEventListener('click',e=>{
  if(e.target.closest?.('#menuPanel .item')) setTimeout(syncNativeQty,40);
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{style();setTimeout(wrap,100)});else{style();setTimeout(wrap,100)}
window.addEventListener('load',()=>{style();setTimeout(wrap,200)});
})();
