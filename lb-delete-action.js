/* La Bistro — reliable bill deletion. Billing system unchanged. */
(()=>{'use strict';
const wait=()=>new Promise(resolve=>{let n=0;const t=setInterval(()=>{if(window.LB&&typeof window.LB.save==='function'){clearInterval(t);resolve()}else if(++n>160){clearInterval(t);resolve()}},250)});
const getId=btn=>{const modal=btn?.closest?.('#lbBillViewModal,.modal,.popup,.overlay')||document;const text=modal.innerText||modal.textContent||'';const m=text.match(/Bill:\s*(LB-[A-Z0-9]+-[A-Z0-9]+)/i);return m?m[1]:null};
const deleted=()=>{try{return JSON.parse(localStorage.getItem('lb_deleted_sales_v1')||'[]').map(String)}catch(e){return[]}};
const markDeleted=id=>{const a=new Set(deleted());a.add(String(id));localStorage.setItem('lb_deleted_sales_v1',JSON.stringify([...a]))};
const removeLocal=id=>{const next=(Array.isArray(LB.sales)?LB.sales:[]).filter(x=>String(x?.id??'')!==String(id));LB.sales=next;LB.save('lb_sales_v2',next);return next.length};
const closeView=()=>{try{window.lbCloseBillView?.()}catch(e){}const m=document.getElementById('lbBillViewModal');if(m){m.classList.remove('open');m.style.display='none'}};
const removeHistoryRow=id=>{try{
  const nodes=[...document.querySelectorAll('td,div,span,p')].filter(el=>(el.textContent||'').trim()===String(id));
  for(const node of nodes){
    let row=node;
    for(let i=0;i<8&&row;i++,row=row.parentElement){
      const txt=(row.textContent||'');
      if(txt.includes(String(id)) && (row.querySelector?.('button')||row.tagName==='TR')){
        const buttons=[...(row.querySelectorAll?.('button')||[])];
        if(buttons.some(b=>/view bill|বিল দেখুন|edit|delete|ডিলিট/i.test(b.textContent||''))){row.remove();break}
      }
    }
  }
}catch(e){console.warn('history row refresh failed',e)}};
const refresh=()=>{try{window.lbShowDateSales?.()}catch(e){}try{window.renderSales?.()}catch(e){}try{window.renderReports?.()}catch(e){}};
const handler=async ev=>{const btn=ev.target?.closest?.('button');if(!btn)return;const label=(btn.innerText||btn.textContent||'').trim();if(!/delete|ডিলিট/i.test(label))return;const id=getId(btn);if(!id)return;ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();if(!confirm('Delete this bill? / এই বিলটি ডিলিট করবেন?'))return;btn.disabled=true;try{markDeleted(id);removeLocal(id);closeView();refresh();removeHistoryRow(id);setTimeout(()=>removeHistoryRow(id),50);let cloudOk=true;try{if(typeof window.lbCloudPush==='function')cloudOk=await window.lbCloudPush()!==false}catch(e){cloudOk=false}window.dispatchEvent(new CustomEvent('lb-cloud-updated'));if(cloudOk){alert('Bill deleted successfully / বিল ডিলিট হয়েছে')}else{alert('Bill deleted from this phone. Cloud sync will retry automatically. / এই ফোন থেকে বিল ডিলিট হয়েছে। Cloud sync আবার চেষ্টা করবে।')}}catch(e){console.error(e);alert('Delete could not be completed / ডিলিট করা যায়নি।')}finally{btn.disabled=false}};
const start=async()=>{await wait();document.addEventListener('click',handler,true);const inject=()=>{const m=document.getElementById('lbBillViewModal');if(!m||!m.classList.contains('open'))return;const box=m.querySelector('.lbViewBox');if(!box||box.querySelector('#lbFallbackDelete'))return;const id=getId(box);if(!id)return;const row=document.createElement('div');row.id='lbFallbackDelete';row.style.marginTop='8px';row.innerHTML='<button type="button" style="background:#d9534f;color:#fff;border:1px solid #b52b27;border-radius:7px;padding:8px 12px;font-weight:700">🗑️ Delete / ডিলিট</button>';box.appendChild(row)};new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});setInterval(inject,500)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();