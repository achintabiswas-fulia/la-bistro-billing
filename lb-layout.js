/* La Bistro mobile layout only. Does not change billing, saving, printing, WhatsApp, menu data or calculations. */
(function(){
  function applyMobileLayout(){
    if(document.documentElement.dataset.lbLayoutApplied) return;
    const cart=document.querySelector('.cart');
    const customer=document.getElementById('customer');
    const phone=document.getElementById('customerPhone');
    if(!cart) return;

    const style=document.createElement('style');
    style.id='lb-mobile-layout-style';
    style.textContent=`
      @media (max-width:560px){
        /* Mobile only: let the category menu remain at the top while menu items scroll. */
        header{position:relative!important;top:auto!important;z-index:20!important;background:#fff!important;}
        .tabs{position:sticky!important;top:0!important;z-index:1000!important;background:#fff!important;}
        .billing-customer-fields{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;margin:0 0 9px!important;padding:0!important;}
        .billing-customer-fields input{width:100%!important;min-width:0!important;background:#fff!important;color:#111!important;border:1px solid #bbb!important;border-radius:8px!important;padding:9px!important;}
      }
    `;
    document.head.appendChild(style);

    /* Move only customer name and phone into the billing panel on mobile.
       The same DOM elements are reused, so existing handlers/data are preserved. */
    if(customer || phone){
      let box=cart.querySelector('.billing-customer-fields');
      if(!box){
        box=document.createElement('div');
        box.className='billing-customer-fields';
        box.setAttribute('aria-label','Customer details');
        const heading=cart.querySelector('h2');
        if(heading) heading.parentNode.insertBefore(box,heading);
        else cart.insertBefore(box,cart.firstChild);
      }
      if(customer && customer.parentElement!==box) box.appendChild(customer);
      if(phone && phone.parentElement!==box) box.appendChild(phone);
    }

    /* Hide JavaScript source accidentally rendered as plain text by the receipt template. */
    document.querySelectorAll('body > *').forEach(el => {
      if(el.tagName === 'SCRIPT') return;
    });
    Array.from(document.body.childNodes).forEach(node => {
      if(node.nodeType !== Node.TEXT_NODE) return;
      const t=node.textContent || '';
      if(/function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=/.test(t)) node.remove();
    });

    document.documentElement.dataset.lbLayoutApplied='1';
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyMobileLayout,{once:true});
  else applyMobileLayout();
})();
