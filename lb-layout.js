/* La Bistro mobile layout + custom category tabs. */
(function(){
  function categoryNames(){
    const out=[]; const add=v=>{v=String(v||'').trim();if(v&&!out.includes(v))out.push(v);};
    try{(window.MENU||[]).forEach(x=>add(x[0]));}catch(e){}
    try{(window.LB?.customItems||[]).forEach(x=>add(x.category));}catch(e){}
    try{JSON.parse(localStorage.getItem('lb_categories_v1')||'[]').forEach(add);}catch(e){}
    return out;
  }
  function saveCategories(a){localStorage.setItem('lb_categories_v1',JSON.stringify(a));}
  function allCategories(){const saved=(()=>{try{return JSON.parse(localStorage.getItem('lb_categories_v1')||'[]')}catch(e){return []}})();const names=[];const add=v=>{v=String(v||'').trim();if(v&&!names.includes(v))names.push(v);};saved.forEach(add);categoryNames().forEach(add);return names;}
  function customItems(){
    try{
      const a=window.LB?.customItems;
      if(Array.isArray(a)&&a.length)return a;
      const b=JSON.parse(localStorage.getItem('lb_custom_menu_v2')||'[]');
      return Array.isArray(b)?b:[];
    }catch(e){return Array.isArray(window.LB?.customItems)?window.LB.customItems:[]}
  }
  function renderCategories(){
    const panel=document.getElementById('menuPanel');const tabsHost=document.querySelector('.tabs');if(!panel)return;
    panel.querySelectorAll('.lbCustomSection').forEach(x=>x.remove());tabsHost?.querySelectorAll('.lbCustomTab').forEach(x=>x.remove());
    const items=customItems();
    allCategories().forEach(cat=>{
      const sec=document.createElement('section');sec.className='lbCustomSection';sec.id='lbcat_'+btoa(unescape(encodeURIComponent(cat))).replace(/[^a-zA-Z0-9]/g,'');sec.style.scrollMarginTop='95px';
      sec.innerHTML='<div class="category-title"></div><div class="grid"></div>';sec.querySelector('.category-title').textContent=cat;
      const grid=sec.querySelector('.grid');const group=items.filter(x=>String(x.category||'').trim()===cat);
      group.forEach(x=>{const card=document.createElement('div');card.className='item lbCustomItem';card.innerHTML=(x.image?'<img class="lbCustomImg" src="'+x.image+'" alt="">':'')+'<div class="en"></div><div class="bn"></div><div class="price">₹'+Number(x.price||0).toFixed(0)+'</div>';card.querySelector('.en').textContent=x.en||'';card.querySelector('.bn').textContent=x.bn||'';card.onclick=()=>{try{const key='custom::'+x.en+'|'+x.bn;window.cart[key]={item:[x.en,x.bn,x.price],qty:(window.cart[key]?.qty||0)+1};window.renderCart?.()}catch(e){}};grid.appendChild(card)});
      if(!group.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='No items yet / এখনও কোনো আইটেম নেই';grid.appendChild(empty)}
      panel.appendChild(sec);if(tabsHost){
        const b=document.createElement('button');
        b.className='tab lbCustomTab';
        b.type='button';
        b.dataset.category=cat;
        b.textContent=cat.split('/')[0].trim();
        b.onclick=(e)=>{
          e.preventDefault();
          e.stopPropagation();
          const items=customItems();
          const group=items.filter(x=>String(x.category||'').trim()===String(cat).trim());
          const panel=document.getElementById('menuPanel');
          if(!panel)return;
          panel.querySelectorAll('.lbCustomSection').forEach(x=>x.style.display='none');
          let target=document.getElementById(sec.id);
          if(!target){
            target=document.createElement('section');
            target.className='lbCustomSection';
            target.id=sec.id;
            panel.appendChild(target);
          }
          target.style.display='block';
          target.innerHTML='';
          const title=document.createElement('div');
          title.className='category-title';
          title.textContent=cat;
          target.appendChild(title);
          const grid=document.createElement('div');
          grid.className='grid';
          group.forEach(x=>{
            const card=document.createElement('button');
            card.type='button';
            card.className='item lbCustomItem';
            card.innerHTML='<div class="en"></div><div class="bn"></div><div class="price"></div>';
            card.querySelector('.en').textContent=x.en||'';
            card.querySelector('.bn').textContent=x.bn||'';
            card.querySelector('.price').textContent='₹'+Number(x.price||0).toFixed(0);
            card.onclick=()=>{
              window.cart=window.cart||{};
              const k='custom::'+(x.id||x.en+'|'+x.bn);
              window.cart[k]=window.cart[k]||{item:[x.en||'',x.bn||'',Number(x.price||0)],qty:0};
              window.cart[k].qty++;
              window.renderCart?.();
            };
            grid.appendChild(card);
          });
          if(!group.length){
            const empty=document.createElement('div');
            empty.className='empty';
            empty.textContent='No items found / কোনো আইটেম পাওয়া যায়নি';
            target.appendChild(empty);
          }else target.appendChild(grid);
          target.scrollIntoView({behavior:'smooth',block:'start'});
        };
        tabsHost.appendChild(b)
      }
    });
  }
  function addCategoryControls(){
    const box=document.getElementById('lbContent');if(!box||box.querySelector('#lbCategoryControls'))return;const wrap=document.createElement('div');wrap.id='lbCategoryControls';wrap.style.cssText='border:1px solid #d4b25b;background:#fffaf0;border-radius:10px;padding:10px;margin:8px 0 14px';wrap.innerHTML='<b>📁 Add Category / ক্যাটাগরি যোগ করুন</b><div style="display:flex;gap:6px;margin-top:7px"><input id="lbNewCategory" class="lbInput" style="margin:0" placeholder="e.g. Desserts / ডেজার্ট"><button id="lbAddCategoryBtn" class="lbPrimary">Add / যোগ</button></div><div class="lbHint" style="margin-top:5px">New category will appear as a new menu box at the end of the category bar.</div>';const h3=box.querySelector('h3');if(h3)h3.after(wrap);else box.prepend(wrap);document.getElementById('lbAddCategoryBtn').onclick=()=>{const input=document.getElementById('lbNewCategory');const name=(input.value||'').trim();if(!name)return alert('Enter a category name / ক্যাটাগরির নাম লিখুন');const cats=(()=>{try{return JSON.parse(localStorage.getItem('lb_categories_v1')||'[]')}catch(e){return []}})();if(cats.includes(name))return alert('Category already exists / ক্যাটাগরি আগে থেকেই আছে');cats.push(name);saveCategories(cats);input.value='';window.LB?.toast?.('Category added / ক্যাটাগরি যোগ হয়েছে');renderCategories();};
  }
  function injectCategoryManager(){if(typeof window.openLBManager!=='function'||window.__lbCategoryManagerWrapped)return;window.__lbCategoryManagerWrapped=true;const original=window.openLBManager;window.openLBManager=function(tab){original(tab);if(tab==='item')setTimeout(addCategoryControls,60)}}
  function applyMobileLayout(){
    if(!document.getElementById('lb-mobile-layout-style')){const style=document.createElement('style');style.id='lb-mobile-layout-style';style.textContent=`@media (max-width:560px){header{position:relative!important;top:auto!important;z-index:20!important;background:#fff!important}.tabs{position:sticky!important;top:0!important;z-index:1000!important;background:#fff!important}.billing-customer-fields{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;margin:0 0 9px!important;padding:0!important}.billing-customer-fields input{width:100%!important;min-width:0!important;background:#fff!important;color:#111!important;border:1px solid #bbb!important;border-radius:8px!important;padding:9px!important}}`;document.head.appendChild(style)}
    const cart=document.querySelector('.cart'),customer=document.getElementById('customer'),phone=document.getElementById('customerPhone');if(cart&&(customer||phone)){let box=cart.querySelector('.billing-customer-fields');if(!box){box=document.createElement('div');box.className='billing-customer-fields';const heading=cart.querySelector('h2');if(heading)heading.parentNode.insertBefore(box,heading);else cart.insertBefore(box,cart.firstChild)}if(customer&&customer.parentElement!==box)box.appendChild(customer);if(phone&&phone.parentElement!==box)box.appendChild(phone)}
    Array.from(document.body.childNodes).forEach(node=>{if(node.nodeType===Node.TEXT_NODE&&/function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=/.test(node.textContent||''))node.remove()});injectCategoryManager();renderCategories();
  }
  function loadSyncBridge(){if(document.querySelector('script[data-lb-sync-fix]'))return;const s=document.createElement('script');s.src='./lb-sync-fix.js?v=2';s.dataset.lbSyncFix='1';document.head.appendChild(s)}
  function loadSalesHistory(){if(document.querySelector('script[data-lb-sales-history]'))return;const s=document.createElement('script');s.src='./lb-sales-history.js?v=1';s.dataset.lbSalesHistory='1';document.head.appendChild(s)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyMobileLayout,{once:true});else applyMobileLayout();
  window.addEventListener('lb-cloud-updated',()=>setTimeout(renderCategories,50));
  window.addEventListener('load',()=>setTimeout(()=>{injectCategoryManager();renderCategories();loadSyncBridge();loadSalesHistory()},300));
  window.lbRenderCategories=renderCategories;
})();
