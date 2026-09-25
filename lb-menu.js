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

  function installPrintFix(){
    const btn=document.querySelector('.print-actions .btn.primary');
    if(!btn || btn.dataset.lbPrintFixed==='1') return;
    btn.dataset.lbPrintFixed='1';
    btn.onclick=function(e){
      if(e) e.preventDefault();
      const rows=[...document.querySelectorAll('#cartItems .cart-row')];
      if(!rows.length){alert('Add items first / আগে আইটেম যোগ করুন');return false;}
      const items=rows.map(row=>{
        const name=(row.querySelector('.cart-name')?.textContent||'').trim();
        const bn=(row.querySelector('.cart-bn')?.textContent||'').trim();
        const qty=Number((row.querySelector('.bill-qty')?.textContent||'0').trim())||0;
        const priceText=(row.querySelector('.bill-price')?.textContent||'').replace(/[^0-9.]/g,'');
        const totalText=(row.querySelector('.bill-total')?.textContent||'').replace(/[^0-9.]/g,'');
        return {name,bn,qty,price:Number(priceText)||0,total:Number(totalText)||0};
      }).filter(x=>x.qty>0);
      if(!items.length){alert('Add items first / আগে আইটেম যোগ করুন');return false;}
      const subtotal=(document.getElementById('subtotal')?.textContent||'₹0');
      const discount=(document.getElementById('discount')?.value||'0');
      const gst=(document.getElementById('gst')?.value||'0');
      const total=(document.getElementById('total')?.textContent||'₹0');
      const payment=document.querySelector('.payment.active')?.textContent?.trim()||'Cash';
      const order=document.getElementById('orderType')?.value||'';
      const table=document.getElementById('table')?.value||'';
      const now=new Date();
      const billNo='LB-'+now.getTime();
      const html=`<!doctype html><html><head><meta charset="utf-8"><title>La Bistro Bill</title><style>body{font-family:Arial,sans-serif;width:72mm;margin:0 auto;color:#000}h2{text-align:center;margin:4px 0}.c{text-align:center;font-size:11px}table{width:100%;font-size:11px;border-collapse:collapse}td{padding:4px 0;border-bottom:1px dotted #999;vertical-align:top}.r{text-align:right}.t{font-size:16px;font-weight:bold;border-top:1px solid #000}</style></head><body><h2>LA BISTRO</h2><div class="c">Multi Cuisine Family Restaurant • লা বিস্ট্রো</div><div class="c">Bill: ${billNo}</div><div class="c">${order}${table?' • Table: '+table:''}</div><hr><table><tr><th>Qty</th><th>Item</th><th>Price</th><th>Total</th></tr>${items.map(x=>`<tr><td>${x.qty}</td><td>${x.name}<br>${x.bn}</td><td>₹${x.price.toFixed(0)}</td><td>₹${x.total.toFixed(0)}</td></tr>`).join('')}</table><hr><div>Subtotal: <span class="r">${subtotal}</span></div><div>Discount: ₹${Number(discount).toFixed(0)}</div><div>GST: ${gst}%</div><div class="t">TOTAL: <span class="r">${total}</span></div><div>Payment: ${payment}</div><p class="c">Thank you / ধন্যবাদ</p><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
      const w=window.open('','_blank');
      if(!w){alert('Please allow pop-ups for printing / প্রিন্টের জন্য pop-up অনুমতি দিন');return false;}
      w.document.open();w.document.write(html);w.document.close();
      return false;
    };
  }

  async function start(){
    style();
    try{ await loadApprovedMenu(); }catch(e){ console.error(e); return; }
    const render=()=>{
      try{ window.injectLBMenu?.(); }catch(e){ console.error(e); }
      try{ window.renderMenu?.(); }catch(e){ console.error(e); }
      setTimeout(syncQuantityBadges,50);
      setTimeout(installPrintFix,80);
    };
    render();
    setTimeout(render,250);
    setTimeout(render,800);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#menuPanel .item')) setTimeout(()=>{syncQuantityBadges();installPrintFix()},80);
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.addEventListener('load',()=>setTimeout(start,200));
})();
