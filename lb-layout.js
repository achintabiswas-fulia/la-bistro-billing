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
  const out=[],base=[];
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
  const addBase=v=>{v=String(v||'').trim();if(v&&!base.includes(norm(v)))base.push(norm(v))};
  const add=v=>{
    v=String(v||'').trim();
    /* Never add a saved custom category if it is already one of the locked
       base MENU categories. This prevents old saved category names from
       appearing again after Extra/Cigarette/Cold Drink/My Items. */
    if(v&&!out.includes(v)&&!base.includes(norm(v)))out.push(v);
  };
  try{
    if(typeof MENU!=='undefined'&&Array.isArray(MENU))MENU.forEach(c=>addBase(c&&c[0]));
  }catch(e){}
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

  /* Custom items assigned to an existing locked category (for example
     ICE CREAM / আইসক্রিম) must appear inside that original category.
     They are not separate custom tabs. */
  const baseNorm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
  const baseKey=v=>baseNorm(String(v||'').split('/')[0]).replace(/[^a-z0-9\u0980-\u09ff]/g,'');
  const customBaseGroups={};
  items.forEach(x=>{
    const cat=String(x.category||'').trim();
    let base=null;
    try{
      const baseMenu=Array.isArray(MENU)?MENU:[];
      base=baseMenu.find(c=>{
        const title=String(c&&c[0]||'');
        return baseNorm(title)===baseNorm(cat) ||
               baseKey(title)===baseKey(cat);
      });
    }catch(e){}
    if(base){
      const key=baseKey(base[0]);
      (customBaseGroups[key]||(customBaseGroups[key]=[])).push(x);
    }
  });

  function appendCustomBaseItems(){
    let baseMenu=[];try{baseMenu=Array.isArray(MENU)?MENU:[]}catch(e){return}
    const titles=Array.from(menu.querySelectorAll('.category-title'));
    titles.forEach(title=>{
      const base=baseMenu.find(c=>String(c&&c[0]).trim()===String(title.textContent||'').trim());
      if(!base)return;
      const grid=title.nextElementSibling;
      if(!grid||!grid.classList.contains('grid'))return;
      const group=customBaseGroups[baseKey(base[0])]||[];
      group.forEach(x=>{
        if(grid.querySelector('[data-lb-custom-id="'+CSS.escape(String(x.id))+'"]'))return;
        const card=document.createElement('div');
        card.className='item lbCustomItem';
        card.dataset.lbCustomId=String(x.id);
        const en=document.createElement('div');en.className='en';en.textContent=x.en||'';
        const bn=document.createElement('div');bn.className='bn';bn.textContent=x.bn||'';
        const price=document.createElement('div');price.className='price';price.textContent='₹'+Number(x.price||0).toFixed(0);
        const controls=document.createElement('span');controls.className='lbCustomQtyControls';
        const minus=document.createElement('span');minus.className='lbCustomMinus';minus.textContent='−';
        const count=document.createElement('b');count.className='lbCustomCount';
        const plus=document.createElement('span');plus.className='lbCustomPlus';plus.textContent='+';
        controls.append(minus,count,plus);
        const customKey=()=>String((x.en||'')+'||'+(x.bn||'')+'||'+Number(x.price||0));
        const getQty=()=>Number(window.__freshCart?.[customKey()]?.qty||0);
        const setQty=q=>{
          q=Math.max(0,Math.floor(Number(q)||0));
          const enV=String(x.en||''),bnV=String(x.bn||''),priceV=Number(x.price||0);
          window.lbFreshCustomSetQty?.(enV,bnV,priceV,q);
          if(window.cart&&typeof window.renderCart==='function'){
            const legacyKey=enV+'|'+bnV+'|'+priceV;
            if(q>0)window.cart[legacyKey]={item:[enV,bnV,priceV],qty:q};else delete window.cart[legacyKey];
            window.renderCart();
          }
          count.textContent=getQty();
        };
        count.textContent=getQty();
        minus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()-1)};
        plus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()+1)};
        controls.onclick=e=>{e.preventDefault();e.stopPropagation()};
        card.append(controls,en,bn,price);
        grid.appendChild(card);
      });
    });
  }

  if(host.dataset.signature===signature && host.children.length===cats.length){
    appendCustomBaseItems();
    return;
  }

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
      const card=document.createElement('div');
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
      const getQty=()=>Number(window.__freshCart?.[customKey()]?.qty||0);
      const setQty=q=>{
        q=Math.max(0,Math.floor(Number(q)||0));
        const en=String(x.en||''),bn=String(x.bn||''),price=Number(x.price||0);
        window.lbFreshCustomSetQty?.(en,bn,price,q);
        if(window.cart&&typeof window.renderCart==='function'){
          const legacyKey=en+'|'+bn+'|'+price;
          if(q>0) window.cart[legacyKey]={item:[en,bn,price],qty:q};
          else delete window.cart[legacyKey];
          window.renderCart();
        }
        count.textContent=getQty();
      };
      count.textContent=getQty();

      minus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()-1);};
      plus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()+1);};
      controls.onclick=e=>{e.preventDefault();e.stopPropagation();};

      card.append(controls,en,bn,price);

      /* Custom item cards are display-only.
         Quantity changes ONLY when the user presses the − or + boxes. */
      card.onclick=null;
      card.setAttribute('role','presentation');

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
  appendCustomBaseItems();

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

function injectCustomItemsIntoBaseCategory(){
  const menu=document.getElementById('menuPanel');
  if(!menu)return;
  const items=customItems();
  if(!items.length)return;

  const baseTitles=Array.from(menu.querySelectorAll('.category-title'));
  baseTitles.forEach(title=>{
    const baseName=String(title.textContent||'').trim().toLowerCase().replace(/\s+/g,' ');
    const grid=title.nextElementSibling;
    if(!grid||!grid.classList.contains('grid'))return;

    const group=items.filter(x=>{
      const cat=String(x.category||'').trim().toLowerCase().replace(/\s+/g,' ');
      return cat===baseName;
    });
    if(!group.length)return;

    grid.querySelectorAll('.lbBaseCustomItem').forEach(x=>x.remove());

    group.forEach(x=>{
      const card=document.createElement('div');
      card.className='item lbCustomItem lbBaseCustomItem';
      if(x.image){
        const img=document.createElement('img');
        img.className='lbCustomImg';
        img.src=x.image;
        img.alt='';
        card.appendChild(img);
      }
      const en=document.createElement('div');en.className='en';en.textContent=x.en||'';
      const bn=document.createElement('div');bn.className='bn';bn.textContent=x.bn||'';
      const price=document.createElement('div');price.className='price';price.textContent='₹'+Number(x.price||0).toFixed(0);

      const controls=document.createElement('span');
      controls.className='lbCustomQtyControls';
      const minus=document.createElement('span');minus.className='lbCustomMinus';minus.textContent='−';
      const count=document.createElement('b');count.className='lbCustomCount';
      const plus=document.createElement('span');plus.className='lbCustomPlus';plus.textContent='+';
      controls.append(minus,count,plus);

      const customKey=()=>String((x.en||'')+'||'+(x.bn||'')+'||'+Number(x.price||0));
      const getQty=()=>Number(window.__freshCart?.[customKey()]?.qty||0);
      const setQty=q=>{
        q=Math.max(0,Math.floor(Number(q)||0));
        window.lbFreshCustomSetQty?.(x.en||'',x.bn||'',Number(x.price||0),q);
        count.textContent=getQty();
      };
      count.textContent=getQty();
      minus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()-1)};
      plus.onclick=e=>{e.preventDefault();e.stopPropagation();setQty(getQty()+1)};
      controls.onclick=e=>{e.preventDefault();e.stopPropagation()};
      card.append(controls,en,bn,price);
      grid.appendChild(card);
    });
  });
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
    
    s.dataset.lbSalesHistory='1';
    document.head.appendChild(s);
  }
}

function apply(){
  style();
  injectManager();
  patchCanonicalRenderMenu();
  patchCanonicalRenderTabs();

  window.renderCustomMenuItems=renderCategories;
  window.renderCustomCategories=renderCategories;

  renderCategories();
  injectCustomItemsIntoBaseCategory();
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
    injectCustomItemsIntoBaseCategory();
    loadExtras();
  },300);
});

window.addEventListener('lb-cloud-updated',()=>{
  setTimeout(renderCategories,100);
});

window.lbRenderCategories=renderCategories;
})();