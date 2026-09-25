/* La Bistro Billing enhancements: custom menu items */
(()=>{'use strict';const B=window.LB,E=B.esc;function inject(){let p=document.getElementById('menuPanel');if(!p||!B.customItems.length)return;document.getElementById('lbCustomSection')?.remove();let q=(document.getElementById('search')?.value||'').toLowerCase().trim(),a=B.customItems.filter(x=>!q||(x.en+' '+x.bn).toLowerCase().includes(q));if(!a.length)return;let d=document.createElement('div');d.id='lbCustomSection';d.innerHTML=`<div class=category-title>EXTRA ITEMS / অতিরিক্ত আইটেম</div><div class=grid>${a.map(x=>{let k='custom::'+x.id;return `<button class="item lbCustom" onclick="addLBItemToCart('${x.id}')"><span class=qty>${cart?.[k]?.qty||0}</span><div class=en>${E(x.en)}</div><div class=bn>${E(x.bn)}</div><div class=price>₹${Number(x.price).toFixed(0)}</div></button>`}).join('')}</div>`;p.appendChild(d)}window.injectLBMenu=inject;window.addLBItemToCart=id=>{let x=B.customItems.find(v=>v.id===id);if(!x)return;let k='custom::'+id;cart[k]=cart[k]||{item:[x.en,x.bn,+x.price],qty:0};cart[k].qty++;window.renderMenu?.();window.renderCart?.()};let r=window.renderMenu;if(!window.__lbMenuWrapped){window.__lbMenuWrapped=true;window.renderMenu=function(){r?.();inject()}}window.addEventListener('load',()=>setTimeout(()=>{window.renderMenu?.();window.renderCart?.();inject()},300));})();
(()=>{function fix(){let s=document.createElement('style');s.textContent=`
/* Android readability fix */
.top-actions .btn,.top-actions button,.btn{background:#fff8e6!important;color:#111!important;border:1px solid #d4a72c!important;text-shadow:none!important;box-shadow:none!important}
.top-actions .btn.primary,.top-actions button.primary,.btn.primary{background:linear-gradient(#f2c75c,#d9a62e)!important;color:#111!important}
.top-actions .btn:hover,.top-actions button:hover{background:#f7e2a0!important;color:#111!important}
#gst,#discount{background:#fff!important;color:#111!important;border:1px solid #b8953b!important;opacity:1!important}
.print-actions button,.print-actions .btn{background:linear-gradient(#f2c75c,#d9a62e)!important;color:#111!important;border:1px solid #b8953b!important;text-shadow:none!important}
#lbTools{display:flex!important;gap:7px!important}#lbTools button{font-size:14px!important}#lbTools #lbBack,#lbTools #lbRest{display:none!important}`;document.head.appendChild(s);let t=document.getElementById('lbTools');if(t){let save=document.getElementById('lbSave'),print=document.getElementById('lbPrint'),mgr=document.getElementById('lbMgr');t.innerHTML='';if(save)t.appendChild(save);if(print)t.appendChild(print);if(mgr){mgr.textContent='⚙️ Manager / ম্যানেজার';t.appendChild(mgr)}}}window.addEventListener('load',()=>setTimeout(fix,900))})();
(()=>{const B=window.LB,E=B.esc;B.print=(s)=>{let p=JSON.parse(localStorage.getItem('lb_printer_v1')||'{}'),width=+p.width||72,copies=Math.max(1,Math.min(3,+p.copies||1)),rows=s.items.map(x=>`<tr><td>${x.qty}</td><td>${E(x.en)}<br>${E(x.bn)}</td><td>${B.money(x.qty*x.price)}</td></tr>`).join(''),receipt=`<section class=receipt><h2>LA BISTRO</h2><div class=c>লা বিস্ট্রো<br>Multi Cuisine Family Restaurant<br>Prafullanagar, Belemath, Nadia<br>7811838548</div><hr><div class=c>${E(s.orderType)} • Table: ${E(s.table||'-')}<br>${new Date(s.at).toLocaleString('en-IN')}<br>${E(s.id)}</div><table><tr><th>Qty</th><th>Item</th><th>Total</th></tr>${rows}</table><hr><div class=r>Subtotal: ${B.money(s.subtotal)}<br>Discount (${s.discountPct||0}%): -${B.money(s.discount||0)}<br>GST (${s.taxRate||0}%): ${B.money(s.tax||0)}<br><b>TOTAL: ${B.money(s.total)}</b></div><p>Customer: ${E(s.customer)}<br>Payment: ${E(s.payment)}</p><div class=c>Thank You / ধন্যবাদ<br>Make a smile in every bite</div></section>`,h=`<html><head><meta charset=utf-8><style>@page{size:${width}mm auto;margin:2mm}body{font:11px Arial;margin:0;width:${width}mm}.receipt{width:${Math.max(48,width-4)}mm;page-break-after:always}h2{text-align:center;margin:2px}.c{text-align:center}.r{text-align:right}table{width:100%;border-collapse:collapse}td,th{padding:4px 0;border-bottom:1px dotted #999;text-align:left}td:last-child,th:last-child{text-align:right}b{font-size:15px}</style></head><body>${receipt.repeat(copies)}<script>onload=()=>{${p.auto===false?'':'print()'}}<\/script></body></html>`;let w=open('','_blank');if(w){w.document.write(h);w.document.close()}else alert('Please allow pop-ups for printing.')}}})();

/* Repair layer: the previous UI markup lost the elements required by the original menu renderer.
   Recreate only those missing hooks, then let the original MENU/render functions do the work. */
(()=>{
'use strict';
function textEl(root,needle){
  const all=root.querySelectorAll('*');
  for(const el of all){
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(t===needle || t.includes(needle)) return el;
  }
  return null;
}
function setIdByPlaceholder(needle,id){
  if(document.getElementById(id)) return document.getElementById(id);
  const els=[...document.querySelectorAll('input,select')];
  const el=els.find(x=>((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')).toLowerCase().includes(needle.toLowerCase()));
  if(el){el.id=id;return el} return null;
}
function ensure(){
  const heading=textEl(document,'Current Bill / বর্তমান বিল');
  const card=heading?.closest('.card,.bill-card,section,div')||document.body;
  let anchor=heading?.closest('.card,.bill-card,section')||heading?.parentElement||card;
  if(!document.getElementById('tabs')){
    const tabs=document.createElement('div');tabs.id='tabs';tabs.className='tabs lb-restored-tabs';
    (anchor.parentElement||document.body).insertBefore(tabs,anchor);
  }
  if(!document.getElementById('menuPanel')){
    const panel=document.createElement('div');panel.id='menuPanel';panel.className='menu-panel lb-restored-menu';
    const tabs=document.getElementById('tabs');tabs.insertAdjacentElement('afterend',panel);
  }
  if(!document.getElementById('cartItems')){
    const box=document.createElement('div');box.id='cartItems';box.className='cart-items lb-restored-cart';
    if(heading) heading.insertAdjacentElement('afterend',box); else card.insertBefore(box,card.firstChild);
  }
  setIdByPlaceholder('search','search');
  setIdByPlaceholder('table','table');
  setIdByPlaceholder('customer','customer');
  setIdByPlaceholder('whatsapp','customerPhone');
  const sel=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>(o.textContent||'').toLowerCase().includes('dine-in')));
  if(sel&&!document.getElementById('orderType'))sel.id='orderType';
  // Connect the existing Discount/GST inputs instead of replacing the user's layout.
  for(const inp of document.querySelectorAll('input')){
    const p=inp.parentElement?.textContent||'';
    if(!document.getElementById('discount') && /discount/i.test(p)) inp.id='discount';
    if(!document.getElementById('gst') && /gst/i.test(p)) inp.id='gst';
  }
  const subRow=textEl(document,'Subtotal / মোট')?.parentElement;
  if(!document.getElementById('subtotal')){const s=document.createElement('span');s.id='subtotal';s.textContent='₹0';s.style.cssText='float:right;font-weight:800';if(subRow)subRow.appendChild(s)}
  const totalRow=textEl(document,'TOTAL / সর্বমোট')?.parentElement;
  if(!document.getElementById('total')){const t=document.createElement('span');t.id='total';t.textContent='₹0';t.style.cssText='float:right;font-weight:900';if(totalRow)totalRow.appendChild(t)}
  if(!document.getElementById('billMeta')&&heading){const m=document.createElement('div');m.id='billMeta';m.style.cssText='font-weight:700;margin:4px 0 10px';m.textContent='Dine-in / ডাইন-ইন • No table';heading.insertAdjacentElement('afterend',m)}
  const st=document.createElement('style');st.textContent=`
#tabs.lb-restored-tabs{display:flex!important;gap:8px!important;overflow-x:auto!important;padding:10px 4px!important;margin-top:10px!important;scrollbar-width:thin!important}
#tabs.lb-restored-tabs .tab{flex:0 0 auto!important;min-height:52px!important;padding:10px 16px!important;font-weight:900!important;font-size:16px!important;color:#111!important;background:#fff!important;border:2px solid #c9a24b!important;border-radius:24px!important;white-space:nowrap!important}
#tabs.lb-restored-tabs .tab.active{background:#e4bb52!important;color:#111!important}
#menuPanel.lb-restored-menu{display:block!important;min-height:120px!important;padding:4px 2px 14px!important}
#menuPanel.lb-restored-menu .category-title{font-weight:900!important;font-size:22px!important;text-align:center!important;padding:12px!important;margin:4px 0 10px!important;background:#fffdf5!important;border:2px solid #d4b36a!important;border-radius:14px!important;color:#111!important}
#menuPanel.lb-restored-menu .grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
#menuPanel.lb-restored-menu .item{display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;min-height:150px!important;padding:14px!important;background:#fff!important;color:#111!important;border:2px solid #ddd!important;border-radius:14px!important;font-weight:800!important;text-align:left!important;box-shadow:0 2px 5px rgba(0,0,0,.08)!important}
#menuPanel.lb-restored-menu .item .en{font-size:16px!important;font-weight:900!important;margin-top:8px!important}
#menuPanel.lb-restored-menu .item .bn{font-size:15px!important;font-weight:800!important;margin-top:5px!important}
#menuPanel.lb-restored-menu .item .price{font-size:17px!important;font-weight:900!important;margin-top:auto!important;align-self:flex-end!important}
#menuPanel.lb-restored-menu .item .qty{font-weight:900!important;font-size:14px!important;background:#111!important;color:#fff!important;border-radius:10px!important;padding:3px 8px!important;min-height:18px!important}
#menuPanel.lb-restored-menu .item.selected{border-color:#c49321!important;background:#fff7df!important}
#cartItems.lb-restored-cart{display:block!important;margin:8px 0 12px!important}
#cartItems.lb-restored-cart .cart-row{border:1px solid #ddd!important;border-radius:10px!important;padding:8px!important;margin:6px 0!important;background:#fff!important;color:#111!important}
@media(max-width:700px){#menuPanel.lb-restored-menu .grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}#menuPanel.lb-restored-menu .item{min-height:145px!important}}
`;
  document.head.appendChild(st);
  document.getElementById('search')?.addEventListener('input',()=>window.renderMenu?.());
  document.querySelectorAll('input#discount,input#gst').forEach(x=>x.addEventListener('input',()=>window.renderCart?.()));
  window.renderTabs?.();window.renderMenu?.();window.renderCart?.();
}
function start(){setTimeout(ensure,150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.addEventListener('load',()=>setTimeout(ensure,250));
})();
