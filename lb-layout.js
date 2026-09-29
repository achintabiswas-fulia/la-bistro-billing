/* La Bistro — ALL CATEGORY DROPDOWN formula. Separate test version. */
(function(){
'use strict';

const customItems=()=>{try{if(Array.isArray(window.LB?.customItems))return window.LB.customItems;const a=JSON.parse(localStorage.getItem('lb_custom_menu_v2')||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}};
const categories=()=>{const out=[],add=v=>{v=String(v||'').trim();if(v&&!out.includes(v))out.push(v)};(window.MENU||[]).forEach(c=>add(c[0]));customItems().forEach(x=>add(x.category||'MY ITEMS / আমার আইটেম'));try{JSON.parse(localStorage.getItem('lb_categories_v1')||'[]').forEach(add)}catch(e){}return out};
const itemsFor=cat=>{const base=(window.MENU||[]).find(c=>String(c[0]).trim()===String(cat).trim());const out=base?(base[1]||[]).map(it=>({type:'base',it})):[];customItems().filter(x=>(String(x.category||'MY ITEMS / আমার আইটেম').trim()===String(cat).trim())).forEach(x=>out.push({type:'custom',x}));return out};

function host(){
  const tabs=document.querySelector('.tabs');if(!tabs)return null;
  let h=document.getElementById('lbAllCategoryDropdown');
  if(!h){h=document.createElement('div');h.id='lbAllCategoryDropdown';h.innerHTML='<div class="category-title" id="lbDropdownTitle"></div><div class="grid" id="lbDropdownGrid"></div>';tabs.insertAdjacentElement('afterend',h)}
  return h
}
function addBase(it){try{window.addItem?.(encodeURIComponent(it[0]+'|'+it[1]+'|'+it[2]))}catch(e){}}
function addCustom(x){window.cart=window.cart||{};const k='custom::'+(x.id||x.en+'|'+x.bn);window.cart[k]=window.cart[k]||{item:[x.en||'',x.bn||'',Number(x.price||0)],qty:0};window.cart[k].qty++;window.renderCart?.()}

function renderDropdown(cat){
  const h=host();if(!h)return;
  const title=h.querySelector('#lbDropdownTitle'),grid=h.querySelector('#lbDropdownGrid');
  title.textContent=cat;grid.innerHTML='';
  itemsFor(cat).forEach(o=>{
    const card=document.createElement('button');card.type='button';card.className='item lbDropdownItem';
    const en=o.type==='base'?o.it[0]:o.x.en,bn=o.type==='base'?o.it[1]:o.x.bn,price=o.type==='base'?o.it[2]:o.x.price;
    if(o.type==='custom'&&o.x.image){const img=document.createElement('img');img.className='lbCustomImg';img.src=o.x.image;img.alt='';card.appendChild(img)}
    const a=document.createElement('div');a.className='en';a.textContent=en||'';
    const b=document.createElement('div');b.className='bn';b.textContent=bn||'';
    const p=document.createElement('div');p.className='price';p.textContent='₹'+Number(price||0).toFixed(0);
    card.append(a,b,p);
    card.onclick=()=>{o.type==='base'?addBase(o.it):addCustom(o.x);};
    grid.appendChild(card)
  });
  h.style.display='block';
}

function buildTabs(preferredCat){
  const tabs=document.querySelector('.tabs');if(!tabs)return;
  const keepY=window.scrollY;
  const old=tabs.querySelector('.tab.active')?.dataset.category||preferredCat||'';
  tabs.innerHTML='';
  let active=null;
  categories().forEach(cat=>{
    const b=document.createElement('button');b.type='button';b.className='tab';b.textContent=cat.split('/')[0].trim();b.dataset.category=cat;
    b.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      tabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      renderDropdown(cat);
    };
    if(String(cat).trim()===String(old).trim()){b.classList.add('active');active=cat}
    tabs.appendChild(b)
  });
  window.scrollTo(0,keepY);
  if(active)renderDropdown(active);else {const h=host();if(h)h.style.display='none'}
}

function patchRenderTabs(){if(window.__lbAllDropdownPatched)return;window.__lbAllDropdownPatched=true;window.renderTabs=()=>buildTabs();buildTabs()}

function renderCustomRefresh(){
  const active=document.querySelector('.tabs .tab.active')?.dataset.category||'';
  buildTabs(active);
}

function addCategoryControls(){
  const box=document.getElementById('lbContent');if(!box||box.querySelector('#lbCategoryControls'))return;
  const wrap=document.createElement('div');wrap.id='lbCategoryControls';wrap.style.cssText='border:1px solid #d4b25b;background:#fffaf0;border-radius:10px;padding:10px;margin:8px 0 14px';
  wrap.innerHTML='<b>📁 Add Category / ক্যাটাগরি যোগ করুন</b><div style="display:flex;gap:6px;margin-top:7px"><input id="lbNewCategory" class="lbInput" style="margin:0" placeholder="e.g. Desserts / ডেজার্ট"><button id="lbAddCategoryBtn" class="lbPrimary">Add / যোগ</button></div>';
  const h3=box.querySelector('h3');if(h3)h3.after(wrap);else box.prepend(wrap);
  document.getElementById('lbAddCategoryBtn').onclick=()=>{const input=document.getElementById('lbNewCategory'),name=(input.value||'').trim();if(!name)return;let cats=[];try{cats=JSON.parse(localStorage.getItem('lb_categories_v1')||'[]')}catch(e){}if(!cats.includes(name))cats.push(name);localStorage.setItem('lb_categories_v1',JSON.stringify(cats));input.value='';window.LB?.toast?.('Category added / ক্যাটাগরি যোগ হয়েছে');renderCustomRefresh()}
}
function injectManager(){if(typeof window.openLBManager!=='function'||window.__lbCategoryManagerWrapped)return;window.__lbCategoryManagerWrapped=true;const old=window.openLBManager;window.openLBManager=function(tab){old(tab);if(tab==='item')setTimeout(addCategoryControls,60)}}

function style(){
  if(document.getElementById('lb-all-dropdown-style'))return;
  const s=document.createElement('style');s.id='lb-all-dropdown-style';
  s.textContent='#lbAllCategoryDropdown{display:none;background:#fff;padding:8px 0 14px;border-bottom:1px solid #ddd;position:relative;z-index:2}#lbAllCategoryDropdown .category-title{margin:4px 7px 9px;font-weight:700}#lbAllCategoryDropdown .grid{padding:0 7px}#lbAllCategoryDropdown .lbDropdownItem{min-height:128px}#lbAllCategoryDropdown .lbCustomImg{position:relative!important;left:auto;right:auto;top:auto;width:100%!important;height:70px!important;object-fit:cover;border-radius:7px;display:block;margin-bottom:5px}.tabs .tab.active{background:#f3d36a!important;color:#111!important}@media(max-width:560px){.tabs{position:relative!important;top:auto!important;z-index:10!important;background:#fff!important;overflow-x:auto!important}#lbAllCategoryDropdown{padding-bottom:12px}#lbAllCategoryDropdown .grid{grid-template-columns:repeat(2,minmax(145px,1fr));overflow-x:hidden}}';
  document.head.appendChild(s)
}

function apply(){
  style();injectManager();
  const cart=document.querySelector('.cart'),customer=document.getElementById('customer'),phone=document.getElementById('customerPhone');
  if(cart&&(customer||phone)){let box=cart.querySelector('.billing-customer-fields');if(!box){box=document.createElement('div');box.className='billing-customer-fields';const h=cart.querySelector('h2');if(h)h.parentNode.insertBefore(box,h);else cart.insertBefore(box,cart.firstChild)}if(customer&&customer.parentElement!==box)box.appendChild(customer);if(phone&&phone.parentElement!==box)box.appendChild(phone)}
  patchRenderTabs();
  const active=document.querySelector('.tabs .tab.active')?.dataset.category||'';buildTabs(active);host()
}
function loadScripts(){if(!document.querySelector('script[data-lb-sync-fix]')){const s=document.createElement('script');s.src='./lb-sync-fix.js?v=2';s.dataset.lbSyncFix='1';document.head.appendChild(s)}if(!document.querySelector('script[data-lb-sales-history]')){const s=document.createElement('script');s.src='./lb-sales-history.js?v=1';s.dataset.lbSalesHistory='1';document.head.appendChild(s)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.addEventListener('load',()=>setTimeout(()=>{apply();loadScripts()},400));
window.addEventListener('lb-cloud-updated',()=>setTimeout(()=>{const active=document.querySelector('.tabs .tab.active')?.dataset.category||'';buildTabs(active)},100));
window.lbRenderCategories=renderCustomRefresh;
})();