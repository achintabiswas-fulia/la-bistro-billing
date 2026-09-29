/* La Bistro — ALL CATEGORIES ONE PAGE. Separate test version. */
(function(){
'use strict';
const customItems=()=>{try{if(Array.isArray(window.LB?.customItems))return window.LB.customItems;const a=JSON.parse(localStorage.getItem('lb_custom_menu_v2')||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}};
const categories=()=>{const out=[],add=v=>{v=String(v||'').trim();if(v&&!out.includes(v))out.push(v)};(window.MENU||[]).forEach(c=>add(c[0]));customItems().forEach(x=>add(x.category||'MY ITEMS / আমার আইটেম'));try{JSON.parse(localStorage.getItem('lb_categories_v1')||'[]').forEach(add)}catch(e){}return out};
const itemsFor=cat=>{const base=(window.MENU||[]).find(c=>String(c[0]).trim()===String(cat).trim());const out=base?(base[1]||[]).map(it=>({type:'base',it})):[];customItems().filter(x=>String(x.category||'MY ITEMS / আমার আইটেম').trim()===String(cat).trim()).forEach(x=>out.push({type:'custom',x}));return out};
function addBase(it){try{window.addItem?.(encodeURIComponent(it[0]+'|'+it[1]+'|'+it[2]))}catch(e){}}
function addCustom(x){window.cart=window.cart||{};const k='custom::'+(x.id||x.en+'|'+x.bn);window.cart[k]=window.cart[k]||{item:[x.en||'',x.bn||'',Number(x.price||0)],qty:0};window.cart[k].qty++;window.renderCart?.()}
function makeCard(o){
 const card=document.createElement('button');card.type='button';card.className='item lbAllPageItem';
 const en=o.type==='base'?o.it[0]:o.x.en,bn=o.type==='base'?o.it[1]:o.x.bn,price=o.type==='base'?o.it[2]:o.x.price;
 if(o.type==='custom'&&o.x.image){const img=document.createElement('img');img.className='lbCustomImg';img.src=o.x.image;img.alt='';card.appendChild(img)}
 const a=document.createElement('div');a.className='en';a.textContent=en||'';const b=document.createElement('div');b.className='bn';b.textContent=bn||'';const p=document.createElement('div');p.className='price';p.textContent='₹'+Number(price||0).toFixed(0);
 card.append(a,b,p);card.onclick=()=>o.type==='base'?addBase(o.it):addCustom(o.x);return card;
}
function renderAll(){
 const tabs=document.querySelector('.tabs');if(!tabs)return;
 tabs.innerHTML='';
 const all=document.createElement('button');all.type='button';all.className='tab active';all.textContent='ALL CATEGORIES / সব ক্যাটাগরি';
 tabs.appendChild(all);
 let host=document.getElementById('lbAllCategoriesPage');
 if(!host){host=document.createElement('div');host.id='lbAllCategoriesPage';tabs.insertAdjacentElement('afterend',host)}
 host.innerHTML='';
 categories().forEach(cat=>{
   const sec=document.createElement('section');sec.className='lbAllCategorySection';
   const title=document.createElement('div');title.className='lbAllCategoryTitle';title.textContent=cat;
   const grid=document.createElement('div');grid.className='grid';
   const list=itemsFor(cat);list.forEach(o=>grid.appendChild(makeCard(o)));
   if(!list.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='No items / কোনো আইটেম নেই';grid.appendChild(empty)}
   sec.append(title,grid);host.appendChild(sec);
 });
}
function patch(){window.renderTabs=renderAll;renderAll()}
function style(){
 if(document.getElementById('lb-all-page-style'))return;
 const s=document.createElement('style');s.id='lb-all-page-style';
 s.textContent='#lbAllCategoriesPage{display:block;background:#fff;padding:8px 7px 24px}.lbAllCategorySection{margin:0 0 18px}.lbAllCategoryTitle{font-size:18px;font-weight:800;padding:10px 6px;border-bottom:2px solid #ddd;margin-bottom:8px}.lbAllCategorySection .grid{padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.lbAllPageItem{min-height:105px}.lbAllPageItem .lbCustomImg{width:100%!important;height:70px!important;object-fit:cover;border-radius:7px;display:block;margin-bottom:5px}.tabs{position:relative!important;top:auto!important;z-index:10!important;background:#fff!important}.tabs .tab{width:100%;font-weight:800}.tabs .tab.active{background:#f3d36a!important;color:#111!important}@media(min-width:700px){.lbAllCategorySection .grid{grid-template-columns:repeat(4,minmax(0,1fr))}}';
 document.head.appendChild(s)
}
function addCategoryControls(){
 const box=document.getElementById('lbContent');if(!box||box.querySelector('#lbCategoryControls'))return;
 const wrap=document.createElement('div');wrap.id='lbCategoryControls';wrap.style.cssText='border:1px solid #d4b25b;background:#fffaf0;border-radius:10px;padding:10px;margin:8px 0 14px';
 wrap.innerHTML='<b>📁 Add Category / ক্যাটাগরি যোগ করুন</b><div style="display:flex;gap:6px;margin-top:7px"><input id="lbNewCategory" class="lbInput" style="margin:0" placeholder="e.g. Desserts / ডেজার্ট"><button id="lbAddCategoryBtn" class="lbPrimary">Add / যোগ</button></div>';
 const h3=box.querySelector('h3');if(h3)h3.after(wrap);else box.prepend(wrap);
 document.getElementById('lbAddCategoryBtn').onclick=()=>{const input=document.getElementById('lbNewCategory'),name=(input.value||'').trim();if(!name)return;let cats=[];try{cats=JSON.parse(localStorage.getItem('lb_categories_v1')||'[]')}catch(e){}if(!cats.includes(name))cats.push(name);localStorage.setItem('lb_categories_v1',JSON.stringify(cats));input.value='';window.LB?.toast?.('Category added / ক্যাটাগরি যোগ হয়েছে');renderAll()}
}
function injectManager(){if(typeof window.openLBManager!=='function'||window.__lbAllPageManager)return;window.__lbAllPageManager=true;const old=window.openLBManager;window.openLBManager=function(tab){old(tab);if(tab==='item')setTimeout(addCategoryControls,60)}}
function apply(){
 style();injectManager();
 const cart=document.querySelector('.cart'),customer=document.getElementById('customer'),phone=document.getElementById('customerPhone');
 if(cart&&(customer||phone)){let box=cart.querySelector('.billing-customer-fields');if(!box){box=document.createElement('div');box.className='billing-customer-fields';const h=cart.querySelector('h2');if(h)h.parentNode.insertBefore(box,h);else cart.insertBefore(box,cart.firstChild)}if(customer&&customer.parentElement!==box)box.appendChild(customer);if(phone&&phone.parentElement!==box)box.appendChild(phone)}
 patch();
}
function loadScripts(){if(!document.querySelector('script[data-lb-sync-fix]')){const s=document.createElement('script');s.src='./lb-sync-fix.js?v=2';s.dataset.lbSyncFix='1';document.head.appendChild(s)}if(!document.querySelector('script[data-lb-sales-history]')){const s=document.createElement('script');s.src='./lb-sales-history.js?v=1';s.dataset.lbSalesHistory='1';document.head.appendChild(s)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.addEventListener('load',()=>setTimeout(()=>{apply();loadScripts()},400));
window.addEventListener('lb-cloud-updated',()=>setTimeout(renderAll,100));
window.lbRenderCategories=renderAll;
})();