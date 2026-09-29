/* La Bistro mobile layout + custom category tabs. Locked base MENU is never modified. */
(function(){
  'use strict';

  const MY_ITEMS='MY ITEMS / আমার আইটেম';

  function customItems(){
    const a=Array.isArray(window.LB?.customItems)?window.LB.customItems:[];
    if(a.length)return a;
    try{
      const b=JSON.parse(localStorage.getItem('lb_custom_menu_v2')||'[]');
      return Array.isArray(b)?b:[];
    }catch(e){return []}
  }
  function normalizeCategory(v){
    const s=String(v||'').trim();
    return s||MY_ITEMS;
  }
  function categoryNames(){
    const out=[]; const add=v=>{v=String(v||'').trim();if(v&&!out.includes(v))out.push(v);};
    try{(window.MENU||[]).forEach(x=>add(x[0]));}catch(e){}
    customItems().forEach(x=>add(normalizeCategory(x.category)));
    try{JSON.parse(localStorage.getItem('lb_categories_v1')||'[]').forEach(add);}catch(e){}
    return out;
  }
  function saveCategories(a){localStorage.setItem('lb_categories_v1',JSON.stringify(a));}
  function allCustomCategories(){
    const out=[]; const add=v=>{v=String(v||'').trim();if(v&&!out.includes(v))out.push(v);};
    try{JSON.parse(localStorage.getItem('lb_categories_v1')||'[]').forEach(add);}catch(e){}
    customItems().forEach(x=>add(normalizeCategory(x.category)));
    return out;
  }

  function getCustomPanel(){
    let p=document.getElementById('lbCustomPanel');
    if(p)return p;
    const tabs=document.getElementById('tabs');
    if(!tabs)return null;
    p=document.createElement('main');
    p.id='lbCustomPanel';
    p.className='menu-panel';
    p.style.display='none';
    tabs.parentNode.insertBefore(p,tabs.nextSibling);
    return p;
  }

  function showCustomCategory(cat){
    const panel=getCustomPanel(); if(!panel)return;
    const base=document.getElementById('menuPanel');
    window.__lbSelectedCustomCategory=cat;
    const wanted=String(cat||'').trim();
    const group=customItems().filter(x=>normalizeCategory(x.category).trim()===wanted);
    panel.innerHTML='';
    const sec=document.createElement('section');
    sec.className='lbCustomSection lbCustomActiveSection';
    sec.dataset.category=cat;
    const title=document.createElement('div');
    title.className='category-title';
    title.textContent=cat;
    const grid=document.createElement('div');
    grid.className='grid';
    group.forEach(x=>{
      const card=document.createElement('div');
      card.className='item lbCustomItem';
      card.innerHTML=(x.image?'<img class="lbCustomImg" src="'+x.image+'" alt="">':'')+
        '<div class="en"></div><div class="bn"></div><div class="price">₹'+Number(x.price||0).toFixed(0)+'</div>';
      card.querySelector('.en').textContent=x.en||'';
      card.querySelector('.bn').textContent=x.bn||'';
      card.onclick=()=>{
        const key='custom::'+x.id;
        window.cart=window.cart||{};
        window.cart[key]={item:[x.en,x.bn,Number(x.price||0)],qty:(window.cart[key]?.qty||0)+1};
        window.renderCart?.();
      };
      grid.appendChild(card);
    });
    if(!group.length){
      const empty=document.createElement('div');
      empty.className='empty';
      empty.textContent='No items yet / এখনও কোনো আইটেম নেই';
      grid.appendChild(empty);
    }
    sec.appendChild(title);
    sec.appendChild(grid);
    panel.appendChild(sec);
    if(base)base.style.display='none';
    panel.style.display='block';
    document.querySelectorAll('.tabs .lbCustomTab').forEach(b=>{
      b.classList.toggle('active',b.dataset.category===cat);
    });
  }


  function installCustomTabTapHandler(){
    if(window.__lbCustomTabTapHandler)return;
    window.__lbCustomTabTapHandler=true;
    document.addEventListener('click',(e)=>{
      const b=e.target?.closest?.('.lbCustomTab');
      if(!b)return;
      e.preventDefault();
      e.stopPropagation();
      const cat=b.dataset.category;
      if(cat)showCustomCategory(cat);
    },true);
    document.addEventListener('touchend',(e)=>{
      const b=e.target?.closest?.('.lbCustomTab');
      if(!b)return;
      e.preventDefault();
      e.stopPropagation();
      const cat=b.dataset.category;
      if(cat)showCustomCategory(cat);
    },{capture:true,passive:false});
  }

  function renderCategories(){
    const customPanel=document.getElementById('lbCustomPanel');
    if(!window.__lbSelectedCustomCategory && customPanel)customPanel.style.display='none';
    const basePanel=document.getElementById('menuPanel');
    if(!window.__lbSelectedCustomCategory && basePanel)basePanel.style.display='';

    const tabsHost=document.getElementById('tabs')||document.querySelector('.tabs');
    if(!tabsHost)return;

    tabsHost.querySelectorAll('.lbCustomTab').forEach(x=>x.remove());
    allCustomCategories().forEach(cat=>{
      const b=document.createElement('button');
      b.className='tab lbCustomTab';
      b.style.userSelect='none';
      b.style.webkitUserSelect='none';
      b.style.touchAction='manipulation';
      b.type='button';
      b.dataset.category=cat;
      b.textContent=cat.split('/')[0].trim();
      b.onclick=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        window.__lbSelectedCustomCategory=cat;
        showCustomCategory(cat);
      };
      tabsHost.appendChild(b);
    });

    if(window.__lbSelectedCustomCategory){
      const current=document.querySelector('.lbCustomActiveSection[data-category]');
      if(!current || current.dataset.category!==window.__lbSelectedCustomCategory) showCustomCategory(window.__lbSelectedCustomCategory);
    }
  }

  function addCategoryControls(){
    const box=document.getElementById('lbContent');
    if(!box||box.querySelector('#lbCategoryControls'))return;
    const wrap=document.createElement('div');
    wrap.id='lbCategoryControls';
    wrap.style.cssText='border:1px solid #d4b25b;background:#fffaf0;border-radius:10px;padding:10px;margin:8px 0 14px';
    wrap.innerHTML='<b>📁 Add Category / ক্যাটাগরি যোগ করুন</b><div style="display:flex;gap:6px;margin-top:7px"><input id="lbNewCategory" class="lbInput" style="margin:0" placeholder="e.g. Desserts / ডেজার্ট"><button id="lbAddCategoryBtn" class="lbPrimary">Add / যোগ</button></div><div class="lbHint" style="margin-top:5px">New category will appear as a new menu box at the end of the category bar.</div>';
    const h3=box.querySelector('h3');
    if(h3)h3.after(wrap);else box.prepend(wrap);
    document.getElementById('lbAddCategoryBtn').onclick=()=>{
      const input=document.getElementById('lbNewCategory');
      const name=(input.value||'').trim();
      if(!name)return alert('Enter a category name / ক্যাটাগরির নাম লিখুন');
      const cats=(()=>{try{return JSON.parse(localStorage.getItem('lb_categories_v1')||'[]')}catch(e){return []}})();
      if(cats.includes(name))return alert('Category already exists / ক্যাটাগরি আগে থেকেই আছে');
      cats.push(name); saveCategories(cats); input.value='';
      window.LB?.toast?.('Category added / ক্যাটাগরি যোগ হয়েছে');
      renderCategories();
    };
  }

  function injectCategoryManager(){
    if(typeof window.openLBManager!=='function'||window.__lbCategoryManagerWrapped)return;
    window.__lbCategoryManagerWrapped=true;
    const original=window.openLBManager;
    window.openLBManager=function(tab){
      original(tab);
      if(tab==='item')setTimeout(addCategoryControls,60);
    };
  }

  function applyMobileLayout(){
    installCustomTabTapHandler();
    if(!document.getElementById('lb-mobile-layout-style')){
      const style=document.createElement('style');
      style.id='lb-mobile-layout-style';
      style.textContent=`@media(max-width:560px){
        header{position:relative!important;top:auto!important;z-index:20!important;background:#fff!important}
        .tabs{position:sticky!important;top:0!important;z-index:1000!important;background:#fff!important}
        .billing-customer-fields{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;margin:0 0 9px!important;padding:0!important}
        .billing-customer-fields input{width:100%!important;min-width:0!important;background:#fff!important;color:#111!important;border:1px solid #bbb!important;border-radius:8px!important;padding:9px!important}
        .lbCustomActiveSection{display:block!important}
        #lbCustomPanel{display:block!important;margin:0!important;width:100%!important;max-height:none!important;overflow:visible!important}
        #lbCustomPanel .lbCustomSection{display:block!important}
        #lbCustomPanel .grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;overflow:visible!important}
        #lbCustomPanel .item{display:block!important;visibility:visible!important;opacity:1!important}
      }`;
      document.head.appendChild(style);
    }
    const cart=document.querySelector('.cart'),customer=document.getElementById('customer'),phone=document.getElementById('customerPhone');
    if(cart&&(customer||phone)){
      let box=cart.querySelector('.billing-customer-fields');
      if(!box){
        box=document.createElement('div');box.className='billing-customer-fields';
        const heading=cart.querySelector('h2');
        if(heading)heading.parentNode.insertBefore(box,heading);else cart.insertBefore(box,cart.firstChild);
      }
      if(customer&&customer.parentElement!==box)box.appendChild(customer);
      if(phone&&phone.parentElement!==box)box.appendChild(phone);
    }
    Array.from(document.body.childNodes).forEach(node=>{
      if(node.nodeType===Node.TEXT_NODE&&/function\\s+\\w+\\s*\\(|const\\s+\\w+\\s*=|let\\s+\\w+\\s*=/.test(node.textContent||''))node.remove();
    });
    injectCategoryManager();
    renderCategories();
  }

  function hookCanonicalMenu(){
    if(typeof window.renderTabs==='function' && !window.__lbCanonicalTabsHookedForCustomPanel){
      const originalTabs=window.renderTabs;
      window.renderTabs=function(){
        window.__lbSelectedCustomCategory=null;
        const cp=document.getElementById('lbCustomPanel'); if(cp)cp.style.display='none';
        const bp=document.getElementById('menuPanel'); if(bp)bp.style.display='';
        const out=originalTabs.apply(this,arguments);
        setTimeout(renderCategories,0);
        return out;
      };
      window.__lbCanonicalTabsHookedForCustomPanel=true;
    }

    if(typeof window.renderMenu==='function' && !window.__lbCanonicalMenuHookedForCustomPanel){
      const original=window.renderMenu;
      window.renderMenu=function(){
        const searchEl=document.getElementById('search');
        if(searchEl && searchEl.value.trim()) window.__lbSelectedCustomCategory=null;
        const selected=window.__lbSelectedCustomCategory;
        const out=original.apply(this,arguments);
        if(selected && !(searchEl && searchEl.value.trim())){
          setTimeout(()=>showCustomCategory(selected),0);
        }else{
          const cp=document.getElementById('lbCustomPanel'); if(cp)cp.style.display='none';
          const bp=document.getElementById('menuPanel'); if(bp)bp.style.display='';
          setTimeout(renderCategories,0);
        }
        return out;
      };
      window.__lbCanonicalMenuHookedForCustomPanel=true;
    }
  }

  function hookManagerRenderer(){
    if(typeof window.renderCustomMenuItems!=='function'||window.__lbManagerCustomRendererWrapped)return;
    window.__lbManagerCustomRendererWrapped=true;
    window.renderCustomMenuItems=renderCategories;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyMobileLayout,{once:true});
  else applyMobileLayout();

  window.addEventListener('load',()=>{
    setTimeout(()=>{
      injectCategoryManager();
      hookCanonicalMenu();
      hookManagerRenderer();
      renderCategories();
      loadSyncBridge();
      loadSalesHistory();
    },300);
  });

  function loadSyncBridge(){
    if(document.querySelector('script[data-lb-sync-fix]'))return;
    const s=document.createElement('script');s.src='./lb-sync-fix.js?v=3';s.dataset.lbSyncFix='1';document.head.appendChild(s);
  }
  function loadSalesHistory(){
    if(document.querySelector('script[data-lb-sales-history]'))return;
    const s=document.createElement('script');s.src='./lb-sales-history.js?v=1';s.dataset.lbSalesHistory='1';document.head.appendChild(s);
  }

  setTimeout(()=>{
    hookCanonicalMenu();
    hookManagerRenderer();
    renderCategories();
  },500);

  window.addEventListener('lb-cloud-updated',()=>{
    setTimeout(()=>{
      hookCanonicalMenu();
      hookManagerRenderer();
      renderCategories();
    },50);
  });

  window.lbRenderCategories=renderCategories;
})();