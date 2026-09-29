/* La Bistro — CLEAN custom-category fix, based only on V51-SPECIAL-LOCK.
   Purpose: keep custom categories after the locked base menu. */
(function(){
'use strict';

function customItems(){
  try{
    if(Array.isArray(window.LB?.customItems)) return window.LB.customItems;
    const a=JSON.parse(localStorage.getItem('lb_custom_menu_v2')||'[]');
    return Array.isArray(a)?a:[];
  }catch(e){return[]}
}

function customCategories(){
  const out=[],add=v=>{
    v=String(v||'').trim();
    if(v&&!out.includes(v))out.push(v);
  };
  customItems().forEach(x=>add(x.category||'MY ITEMS / আমার আইটেম'));
  try{JSON.parse(localStorage.getItem('lb_categories_v1')||'[]').forEach(add)}catch(e){}
  return out;
}

let selectedCustomCategory=null;

function renderCategories(){
  const menu=document.getElementById('menuPanel');
  const tabs=document.querySelector('.tabs');
  if(!menu||!tabs)return;

  let host=document.getElementById('lbCleanCustomHost');

  if(!host){
    host=document.createElement('div');
    host.id='lbCleanCustomHost';
    menu.appendChild(host);
  }else if(host.parentNode!==menu){
    menu.appendChild(host);
  }

  const items=customItems();
  const cats=customCategories();
  const visibleCats=selectedCustomCategory&&cats.includes(selectedCustomCategory)?[selectedCustomCategory]:[];

  Array.from(menu.children).forEach(child=>{
    if(child!==host) child.style.display=selectedCustomCategory?'none':'';
  });

  if(selectedCustomCategory && host.parentNode===menu) menu.insertBefore(host,menu.firstChild);

  const signature=JSON.stringify([selectedCustomCategory,cats.map(cat=>[
    cat,
    items.filter(x=>String(x.category||'MY ITEMS / আমার আইটেম').trim()===cat)
      .map(x=>[x.id,x.en,x.bn,x.price,x.image||''])
  ])]);

  if(host.dataset.signature===signature && host.children.length===cats.length)return;

  const oldMenuTop=menu.scrollTop;
  host.dataset.signature=signature;
  host.replaceChildren();
  tabs.querySelectorAll('.lbCustomTab').forEach(x=>x.remove());

  const frag=document.createDocumentFragment();

  /* Show the selected custom category content only.
     When no custom category is selected, the locked base menu remains visible. */
  visibleCats.forEach(cat=>{
    const section=document.createElement('section');
    section.className='lbCustomSection';

    const title=document.createElement('div');
    title.className='category-title';
    title.textContent=cat;

    const grid=document.createElement('div');
    grid.className='grid';

    const group=items.filter(x=>String(x.category||'MY ITEMS / আমার আইটেম').trim()===cat);

    group.forEach(x=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='item lbCustomItem';

      if(x.image){
        const img=document.createElement('img');
        img.className='lbCustomImg';
        img.src=x.image;
        img.alt='';
        card.appendChild(img);
      }

      const en=document.createElement('div');
      en.className='en';
      en.textContent=x.en||'';

      const bn=document.createElement('div');
      bn.className='bn';
      bn.textContent=x.bn||'';

      const price=document.createElement('div');
      price.className='price';
      price.textContent='₹'+Number(x.price||0).toFixed(0);

      /* Match the locked V51 quantity UX:
         minus on the left, quantity in the center, plus on the right. */
      const controls=document.createElement('span');
      controls.className='lbCustomQtyControls';
      const minus=document.createElement('span');
      minus.className='lbCustomMinus';
      minus.textContent='−';
      const count=document.createElement('b');
      count.className='lbCustomCount';
      const plus=document.createElement('span');
      plus.className='lbCustomPlus';
      plus.textContent='+';
      controls.append(minus,count,plus);

      const customKey=()=>String((x.en||'')+'||'+(x.bn||'')+'||'+Number(x.price||0));
      const getQty=()=>{
        try{
          const fresh=window.__freshCart;
          if(fresh){
            const row=fresh[customKey()];
            return Number(row?.qty||0);
          }
          return Number(window.lbFreshCustomGetQty?.(x.en||'',x.bn||'',Number(x.price||0))||0);
        }catch(e){return 0}
      };
      const setQty=q=>{
        q=Math.max(0,Math.floor(Number(q)||0));
        try{
          if(window.__freshCart){
            const k=customKey();
            if(q===0) delete window.__freshCart[k];
            else window.__freshCart[k]={
              en:String(x.en||''),
              bn:String(x.bn||''),
              price:Number(x.price||0),
              key:k,
              qty:q
            };
            window.renderFreshBill?.();
            window.dispatchEvent(new CustomEvent('lb-custom-qty-changed'));
          }else{
            window.lbFreshCustomSetQty?.(x.en||'',x.bn||'',Number(x.price||0),q);
          }
        }catch(e){}
        count.textContent=getQty();
      };
      count.textContent=getQty();

      minus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()-1);};
      plus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()+1);};
      controls.onclick=e=>{e.preventDefault();e.stopPropagation();};

      card.append(controls,en,bn,price);

      /* Custom item cards are display-only.
         Quantity changes ONLY when the user presses the − or + boxes. */
      card.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
      };

      grid.appendChild(card);
    });

    if(!group.length){
      const empty=document.createElement('div');
      empty.className='empty';
      empty.textContent='No items yet / এখনও কোনো আইটেম নেই';
      grid.appendChild(empty);
    }

    section.append(title,grid);
    frag.appendChild(section);
  });

  host.appendChild(frag);

  /* IMPORTANT:
     Always append custom category tabs AFTER all locked base tabs.
     This keeps ICE CREAM / আইসক্রিম as the last locked base category,
     followed by custom categories such as Extra, Cigarette, Cold Drink and My Items. */
  cats.forEach(cat=>{
    const tab=document.createElement('button');
    tab.type='button';
    tab.className='tab lbCustomTab';
    tab.textContent=cat.split('/')[0].trim();
    tab.onclick=()=>{
      selectedCustomCategory=cat;
      renderCategories();
      menu.scrollTo({top:0,behavior:'smooth'});
    };
    tabs.appendChild(tab);
  });

  menu.scrollTop=oldMenuTop;
}

function patchCanonicalRenderMenu(){
  if(window.__lbCleanRenderMenuPatched)return;
  if(typeof window.renderMenu!=='function')return;

  const original=window.renderMenu;
  window.__lbCleanRenderMenuPatched=true;

  window.renderMenu=function(){
    const result=original.apply(this,arguments);
    setTimeout(renderCategories,0);
    return result;
  };
}

function patchCanonicalRenderTabs(){
  if(window.__lbCleanRenderTabsPatched)return;
  if(typeof window.renderTabs!=='function')return;
  const original=window.renderTabs;
  window.__lbCleanRenderTabsPatched=true;
  window.renderTabs=function(){
    selectedCustomCategory=null;
    const result=original.apply(this,arguments);
    setTimeout(renderCategories,0);
    return result;
  };
}

function saveCategories(list){
  localStorage.setItem('lb_categories_v1',JSON.stringify(list));
}

function addCategoryControls(){
  const box=document.getElementById('lbContent');
  if(!box||box.querySelector('#lbCategoryControls'))return;

  const wrap=document.createElement('div');
  wrap.id='lbCategoryControls';
  wrap.style.cssText='border:1px solid #d4b25b;background:#fffaf0;border-radius:10px;padding:10px;margin:8px 0 14px';
  wrap.innerHTML='<b>📁 Add Category / ক্যাটাগরি যোগ করুন</b><div style="display:flex;gap:6px;margin-top:7px"><input id="lbNewCategory" class="lbInput" style="margin:0" placeholder="e.g. Desserts / ডেজার্ট"><button id="lbAddCategoryBtn" class="lbPrimary">Add / যোগ</button></div>';

  const h3=box.querySelector('h3');
  if(h3)h3.after(wrap);else box.prepend(wrap);

  document.getElementById('lbAddCategoryBtn').onclick=()=>{
    const input=document.getElementById('lbNewCategory');
    const name=(input.value||'').trim();
    if(!name)return;

    let cats=[];
    try{cats=JSON.parse(localStorage.getItem('lb_categories_v1')||'[]')}catch(e){}
    if(!cats.includes(name))cats.push(name);

    saveCategories(cats);
    input.value='';
    window.LB?.toast?.('Category added / ক্যাটাগরি যোগ হয়েছে');
    renderCategories();
  };
}

function injectManager(){
  if(typeof window.openLBManager!=='function'||window.__lbCleanCategoryManager)return;
  window.__lbCleanCategoryManager=true;

  const original=window.openLBManager;
  window.openLBManager=function(tab){
    original(tab);
    if(tab==='item')setTimeout(addCategoryControls,60);
  };
}

function style(){
  if(document.getElementById('lb-clean-category-style'))return;

  const s=document.createElement('style');
  s.id='lb-clean-category-style';
  s.textContent='#lbCleanCustomHost{display:block;margin:0 0 10px;overflow-anchor:none}.lbCustomSection{margin:0 0 10px;overflow-anchor:none}.lbCustomTab{background:#fff!important;color:#111!important}.lbCustomTab:focus{outline:none}.lbCustomItem{color:#111!important;padding-top:43px!important}.lbCustomImg{position:relative!important;left:auto!important;right:auto!important;top:auto!important;width:100%!important;height:70px!important;object-fit:cover;border-radius:7px;display:block;margin-bottom:5px}.lbCustomQtyControls{position:absolute;left:7px;right:7px;top:7px;height:32px;display:flex;align-items:center;justify-content:space-between;z-index:5;pointer-events:none}.lbCustomQtyControls span,.lbCustomQtyControls b{pointer-events:auto;display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;border:1px solid #c9a74f;border-radius:7px;background:#fff;color:#111;font-size:20px;line-height:1;cursor:pointer}.lbCustomQtyControls b{min-width:26px;font-size:17px;font-weight:800}';
  document.head.appendChild(s);
}

function loadExtras(){
  if(!document.querySelector('script[data-lb-sync-fix]')){
    const s=document.createElement('script');
    s.src='./lb-sync-fix.js?v=2';
    s.dataset.lbSyncFix='1';
    document.head.appendChild(s);
  }
  if(!document.querySelector('script[data-lb-sales-history]')){
    const s=document.createElement('script');
    s.src='./lb-sales-history.js?v=1';
    s.dataset.lbSalesHistory='1';
    document.head.appendChild(s);
  }
}

function installCustomQtyTouchHandler(){
  if(window.__lbCustomQtyTouchHandler)return;
  window.__lbCustomQtyTouchHandler=true;

  document.addEventListener('click',function(e){
    const control=e.target.closest?.('.lbCustomQtyControls');
    if(!control)return;

    const card=control.closest('.lbCustomItem');
    if(!card)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const en=(card.querySelector('.en')?.textContent||'').trim();
    const bn=(card.querySelector('.bn')?.textContent||'').trim();
    const price=Number((card.querySelector('.price')?.textContent||'').replace(/[^0-9.]/g,''))||0;
    const k=en+'||'+bn+'||'+price;

    let q=Number(window.__freshCart?.[k]?.qty||0);

    if(e.target.closest('.lbCustomMinus')) q=Math.max(0,q-1);
    else if(e.target.closest('.lbCustomPlus')) q=q+1;
    else return;

    window.__freshCart=window.__freshCart||Object.create(null);

    if(q===0) delete window.__freshCart[k];
    else window.__freshCart[k]={en,bn,price,key:k,qty:q};

    window.renderFreshBill?.();
    setTimeout(renderCategories,0);
  },true);
}

function apply(){
  style();
  installCustomQtyTouchHandler();
  injectManager();
  patchCanonicalRenderMenu();
  patchCanonicalRenderTabs();

  window.renderCustomMenuItems=renderCategories;
  window.renderCustomCategories=renderCategories;

  renderCategories();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',apply,{once:true});
}else{
  apply();
}

window.addEventListener('load',()=>{
  setTimeout(()=>{
    injectManager();
    patchCanonicalRenderMenu();
    patchCanonicalRenderTabs();
    renderCategories();
    loadExtras();
  },300);
});

window.addEventListener('lb-cloud-updated',()=>{
  setTimeout(renderCategories,100);
});

window.lbRenderCategories=renderCategories;
})();