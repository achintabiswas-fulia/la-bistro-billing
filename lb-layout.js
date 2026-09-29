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

  function renderCustomSectionsAfterBase(){
    const panel=document.getElementById('menuPanel');
    if(!panel)return;
    panel.querySelectorAll('.lbCustomSection').forEach(x=>x.remove());

    const groups={};
    customItems().forEach(x=>{
      const cat=normalizeCategory(x.category);
      (groups[cat]||(groups[cat]=[])).push(x);
    });

    Object.keys(groups).forEach(cat=>{
      const section=document.createElement('section');
      section.className='lbCustomSection';
      section.dataset.category=cat;
      section.style.cssText='display:block!important;margin-top:12px!important;';
      
      const title=document.createElement('div');
      title.className='category-title';
      title.textContent=cat;
      section.appendChild(title);

      const grid=document.createElement('div');
      grid.className='grid';
      grid.style.cssText='display:grid!important;visibility:visible!important;opacity:1!important;overflow:visible!important;';

      groups[cat].forEach(x=>{
        const card=document.createElement('button');
        card.type='button';
        card.className='item lbCustomItem';
        card.style.cssText='display:block!important;visibility:visible!important;opacity:1!important;min-height:128px!important;';
        const en=document.createElement('div'); en.className='en'; en.textContent=x.en||'';
        const bn=document.createElement('div'); bn.className='bn'; bn.textContent=x.bn||'';
        const price=document.createElement('div'); price.className='price'; price.textContent='₹'+Number(x.price||0).toFixed(0);
        card.append(en,bn,price);
        if(x.image){
          const img=document.createElement('img'); img.className='lbCustomImg'; img.src=x.image; img.alt='';
          card.insertBefore(img,en);
        }
        card.onclick=()=>{
          const key='custom::'+(x.id||((x.en||'')+'|'+(x.bn||'')+'|'+Number(x.price||0)));
          window.cart=window.cart||{};
          window.cart[key]=window.cart[key]||{item:[x.en||'',x.bn||'',Number(x.price||0)],qty:0};
          window.cart[key].qty++;
          window.renderCart?.();
        };
        grid.appendChild(card);
      });
      section.appendChild(grid);
      panel.appendChild(section);
    });
  }

  function showCustomCategory(cat){
    const section=document.querySelector('#menuPanel .lbCustomSection[data-category="'+String(cat||'').replace(/"/g,'\\\"')+'"]');
    if(section){
      window.__lbSelectedCustomCategory=String(cat||'').trim();
      section.scrollIntoView({behavior:'smooth',block:'start'});
      document.querySelectorAll('.tabs .lbCustomTab').forEach(btn=>{
        btn.classList.toggle('active',String(btn.dataset.category||'').trim()===window.__lbSelectedCustomCategory);
      });
      return;
    }
    window.__lbSelectedCustomCategory=String(cat||'').trim();
    renderCustomSectionsAfterBase();
    const target=document.querySelector('#menuPanel .lbCustomSection[data-category="'+String(cat||'').replace(/"/g,'\\\"')+'"]');
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
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
      if(cat){window.__lbSelectedCustomCategory=cat;showCustomCategory(cat);}
    },true);
    document.addEventListener('click',(e)=>{
      const base=e.target?.closest?.('#tabs .tab:not(.lbCustomTab)');
      if(base)window.__lbSelectedCustomCategory=null;
    },true);
    document.addEventListener('touchend',(e)=>{
      const base=e.target?.closest?.('#tabs .tab:not(.lbCustomTab)');
      if(base)window.__lbSelectedCustomCategory=null;
    },{capture:true,passive:false});
  }

  function renderCategories(){
    const customPanel=document.getElementById('lbCustomPanel');
    if(!window.__lbSelectedCustomCategory && customPanel)customPanel.style.display='none';
    const basePanel=document.getElementById('menuPanel');
    if(basePanel)basePanel.style.display='';

    const tabsHost=document.getElementById('tabs')||document.querySelector('.tabs');
    if(!tabsHost)return;

    tabsHost.querySelectorAll('.lbCustomTab').forEach(x=>x.remove());
    allCustomCategories().forEach(cat=>{
      const b=document.createElement('button');
      b.className='tab lbCustomTab';
      b.style.userSelect='none';
      b.style.webkitUserSelect='none';
      b.style.touchAction='manipulation';
      b.style.pointerEvents='auto';
      b.style.position='relative';
      b.style.zIndex='1002';
      b.type='button';
      b.dataset.category=cat;
      b.textContent=cat.split('/')[0].trim();
      const openCustom=(e)=>{
        if(e){e.preventDefault();e.stopPropagation();}
        window.__lbSelectedCustomCategory=cat;
        showCustomCategory(cat);
        setTimeout(()=>showCustomCategory(cat),50);
      };
      b.onclick=openCustom;
      b.onpointerdown=openCustom;
      b.ontouchstart=openCustom;
      b.ontouchend=(e)=>{e.preventDefault();e.stopPropagation();};
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
        #lbCustomPanel{display:block!important;margin:0!important;width:100%!important;max-height:none!important;min-height:1px!important;overflow:visible!important;grid-column:1 / -1!important}
        #lbCustomPanel .lbCustomSection{display:block!important}
        #lbCustomPanel .grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;overflow:visible!important}
        #lbCustomPanel .item{display:block!important;visibility:visible!important;opacity:1!important;min-height:110px!important}
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
    hookCanonicalMenu();
    hookManagerRenderer();
    renderCategories();
  }

  function hookCanonicalMenu(){
    if(typeof window.renderTabs==='function' && !window.__lbCanonicalTabsHookedForCustomPanel){
      const originalTabs=window.renderTabs;
      window.renderTabs=function(){
        if(window.__lbSelectedCustomCategory){
          renderCategories();
          return;
        }
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
        if(searchEl && searchEl.value.trim()){
          window.__lbSelectedCustomCategory=null;
        }
        const out=original.apply(this,arguments);
        const cp=document.getElementById('lbCustomPanel'); if(cp)cp.style.display='none';
        const bp=document.getElementById('menuPanel'); if(bp)bp.style.display='';
        renderCustomSectionsAfterBase();
        setTimeout(renderCategories,0);
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