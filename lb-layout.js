/* La Bistro — CLEAN custom-category fix, based only on V51-SPECIAL-LOCK.
   Purpose: stop custom-category layout from changing the user's viewport. */
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

function renderCategories(){
  const menu=document.getElementById('menuPanel');
  const tabs=document.querySelector('.tabs');
  if(!menu||!tabs)return;

  let host=document.getElementById('lbCleanCustomHost');
  if(!host){
    host=document.createElement('div');
    host.id='lbCleanCustomHost';
    menu.insertAdjacentElement('afterend',host);
  }

  const items=customItems();
  const cats=customCategories();
  const signature=JSON.stringify(cats.map(cat=>[
    cat,
    items.filter(x=>String(x.category||'MY ITEMS / আমার আইটেম').trim()===cat)
      .map(x=>[x.id,x.en,x.bn,x.price,x.image||''])
  ]));

  if(host.dataset.signature===signature && host.children.length===cats.length)return;

  const oldY=window.scrollY;
  host.dataset.signature=signature;
  host.replaceChildren();
  tabs.querySelectorAll('.lbCustomTab').forEach(x=>x.remove());

  const frag=document.createDocumentFragment();

  cats.forEach(cat=>{
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

      card.append(en,bn,price);

      card.onclick=()=>{
        try{
          const k='custom::'+(x.id||x.en+'|'+x.bn);
          window.cart=window.cart||{};
          window.cart[k]=window.cart[k]||{
            item:[x.en||'',x.bn||'',Number(x.price||0)],
            qty:0
          };
          window.cart[k].qty++;
          window.renderCart?.();
        }catch(e){}
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

    const tab=document.createElement('button');
    tab.type='button';
    tab.className='tab lbCustomTab';
    tab.textContent=cat.split('/')[0].trim();
    tab.onclick=()=>{
      const y=section.getBoundingClientRect().top+window.scrollY-90;
      window.scrollTo(0,y);
    };
    tabs.appendChild(tab);
  });

  host.appendChild(frag);

  /* Critical fix: restoring the exact viewport prevents the custom section
     from pulling the user down to Current Bill when it is refreshed. */
  window.scrollTo(0,oldY);
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
  s.textContent='#lbCleanCustomHost{display:block;margin:0 0 10px;overflow-anchor:none}.lbCustomSection{margin:0 0 10px;overflow-anchor:none}.lbCustomTab{background:#fff!important;color:#111!important}.lbCustomTab:focus{outline:none}.lbCustomItem{color:#111!important}.lbCustomImg{position:relative!important;left:auto!important;right:auto!important;top:auto!important;width:100%!important;height:70px!important;object-fit:cover;border-radius:7px;display:block;margin-bottom:5px}';

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

function apply(){
  style();
  injectManager();
  /* Disable the old manager renderer. Cloud sync calls this function; routing it
     to the clean renderer prevents duplicate custom sections and viewport jumps. */
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
    renderCategories();
    loadExtras();
  },300);
});

window.addEventListener('lb-cloud-updated',()=>{
  setTimeout(renderCategories,100);
});

window.lbRenderCategories=renderCategories;
})();