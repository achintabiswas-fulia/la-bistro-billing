(()=>{
'use strict';
function exactText(needle){
  let best=null;
  for(const el of document.querySelectorAll('body *')){
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(t===needle)return el;
    if(!best&&t.includes(needle)&&t.length<180)best=el;
  }
  return best;
}
function hookPlaceholder(word,id){
  if(document.getElementById(id))return document.getElementById(id);
  const el=[...document.querySelectorAll('input,textarea')].find(x=>((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')).toLowerCase().includes(word));
  if(el)el.id=id;
  return el;
}
function setup(){
  const heading=exactText('Current Bill / বর্তমান বিল');
  const billCard=heading?.closest('.card,.bill-card,section')||heading?.parentElement||document.body;
  if(!document.getElementById('tabs')){
    const tabs=document.createElement('div');tabs.id='tabs';tabs.className='tabs lb-v2-tabs';
    billCard.parentElement?.insertBefore(tabs,billCard);
  }
  if(!document.getElementById('menuPanel')){
    const panel=document.createElement('div');panel.id='menuPanel';panel.className='menu-panel lb-v2-menu';
    document.getElementById('tabs')?.insertAdjacentElement('afterend',panel);
  }
  if(!document.getElementById('cartItems')){
    const box=document.createElement('div');box.id='cartItems';box.className='cart-items lb-v2-cart';
    heading?.insertAdjacentElement('afterend',box);
  }
  hookPlaceholder('search','search');
  hookPlaceholder('table','table');
  hookPlaceholder('customer','customer');
  hookPlaceholder('whatsapp','customerPhone');
  const order=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>(o.textContent||'').toLowerCase().includes('dine-in')));
  if(order&&!document.getElementById('orderType'))order.id='orderType';
  for(const input of document.querySelectorAll('input')){
    const txt=input.parentElement?.textContent||'';
    if(!document.getElementById('discount')&&/discount/i.test(txt))input.id='discount';
    if(!document.getElementById('gst')&&/gst/i.test(txt))input.id='gst';
  }
  const sr=exactText('Subtotal / মোট')?.parentElement;
  if(!document.getElementById('subtotal')&&sr){const x=document.createElement('span');x.id='subtotal';x.textContent='₹0';x.style.cssText='float:right;font-weight:900';sr.appendChild(x)}
  const tr=exactText('TOTAL / সর্বমোট')?.parentElement;
  if(!document.getElementById('total')&&tr){const x=document.createElement('span');x.id='total';x.textContent='₹0';x.style.cssText='float:right;font-weight:900';tr.appendChild(x)}
  if(!document.getElementById('billMeta')&&heading){const x=document.createElement('div');x.id='billMeta';x.textContent='Dine-in / ডাইন-ইন • No table';x.style.cssText='font-weight:700;margin:4px 0 10px';heading.insertAdjacentElement('afterend',x)}
  if(!document.getElementById('lb-v2-style')){
    const st=document.createElement('style');st.id='lb-v2-style';st.textContent=`
#tabs.lb-v2-tabs{display:flex!important;gap:8px!important;overflow-x:auto!important;padding:10px 4px!important;margin-top:10px!important}
#tabs.lb-v2-tabs .tab{flex:0 0 auto!important;min-height:52px!important;padding:10px 16px!important;font-weight:900!important;font-size:16px!important;color:#111!important;background:#fff!important;border:2px solid #c9a24b!important;border-radius:24px!important;white-space:nowrap!important}
#tabs.lb-v2-tabs .tab.active{background:#e4bb52!important;color:#111!important}
#menuPanel.lb-v2-menu{display:block!important;padding:4px 2px 14px!important}
#menuPanel.lb-v2-menu .category-title{font-weight:900!important;font-size:22px!important;text-align:center!important;padding:12px!important;margin:4px 0 10px!important;background:#fffdf5!important;border:2px solid #d4b36a!important;border-radius:14px!important;color:#111!important}
#menuPanel.lb-v2-menu .grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
#menuPanel.lb-v2-menu .item{display:flex!important;flex-direction:column!important;align-items:flex-start!important;min-height:150px!important;padding:14px!important;background:#fff!important;color:#111!important;border:2px solid #ddd!important;border-radius:14px!important;font-weight:800!important;text-align:left!important;box-shadow:0 2px 5px rgba(0,0,0,.08)!important;touch-action:manipulation!important}
#menuPanel.lb-v2-menu .item .en{font-size:16px!important;font-weight:900!important;margin-top:8px!important}
#menuPanel.lb-v2-menu .item .bn{font-size:15px!important;font-weight:800!important;margin-top:5px!important}
#menuPanel.lb-v2-menu .item .price{font-size:17px!important;font-weight:900!important;margin-top:auto!important;align-self:flex-end!important}
#menuPanel.lb-v2-menu .item .qty{font-weight:900!important;background:#111!important;color:#fff!important;border-radius:10px!important;padding:3px 8px!important}
#menuPanel.lb-v2-menu .item.selected{border-color:#c49321!important;background:#fff7df!important}
#cartItems.lb-v2-cart{display:block!important;margin:8px 0 12px!important}
@media(max-width:700px){#menuPanel.lb-v2-menu .grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
`;
    document.head.appendChild(st);
  }
  window.renderTabs?.();window.renderMenu?.();window.renderCart?.();
  document.getElementById('search')?.addEventListener('input',()=>window.renderMenu?.());
  document.querySelectorAll('#discount,#gst').forEach(x=>x.addEventListener('input',()=>window.renderCart?.()));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
