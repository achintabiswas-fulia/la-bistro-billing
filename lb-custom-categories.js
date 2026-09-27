/* La Bistro — shared custom category display. Does not replace billing logic. */
(()=>{'use strict';
const wait=()=>new Promise(resolve=>{let n=0;const t=setInterval(()=>{if(window.LB){clearInterval(t);resolve(window.LB)}else if(++n>200){clearInterval(t);resolve(null)}},100)});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=x=>String(x??'').trim();
function getItems(B){return Array.isArray(B?.customItems)?B.customItems:[]}
function getCats(B){const a=[];const add=x=>{const v=norm(typeof x==='string'?x:(x?.name??x?.en??x?.title??x?.category));if(v&&!a.includes(v))a.push(v)};(B?.customCategories||[]).forEach(add);getItems(B).forEach(x=>add(x.category??x.cat??x.categoryName??x.group));return a}
function itemValues(x){return {en:norm(x.en??x.name??x.itemName??x.title??'Item'),bn:norm(x.bn??x.bengali??x.bangla??x.nameBn??''),price:Number(x.price??x.rate??x.amount??0)||0}}
function render(B){const panel=document.getElementById('menuPanel');const tabs=document.querySelector('.tabs');if(!panel||!tabs)return;const cats=getCats(B);const old=panel.querySelectorAll('[data-custom-category-section]');old.forEach(x=>x.remove());tabs.querySelectorAll('[data-custom-category-tab]').forEach(x=>x.remove());if(!cats.length)return;
const items=getItems(B);
cats.forEach((cat,idx)=>{const slug='lb-custom-cat-'+idx;const section=document.createElement('section');section.dataset.customCategorySection='1';section.id=slug;section.innerHTML=`<div class="category-title">${esc(cat)}</div><div class="grid"></div>`;const grid=section.querySelector('.grid');const matches=items.filter(x=>norm(x.category??x.cat??x.categoryName??x.group)===cat);matches.forEach(x=>{const v=itemValues(x);const card=document.createElement('div');card.className='item';card.dataset.customId=x.id??'';card.innerHTML=`<div class="en">${esc(v.en)}</div><div class="bn">${esc(v.bn)}</div><div class="price">₹${v.price}</div>`;grid.appendChild(card)});if(matches.length)panel.appendChild(section);
const tab=document.createElement('button');tab.type='button';tab.className='tab';tab.dataset.customCategoryTab='1';tab.textContent=cat;tab.addEventListener('click',()=>{document.querySelectorAll('.tabs .tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');section.scrollIntoView({behavior:'smooth',block:'start'});});tabs.appendChild(tab);});
try{window.injectMenuControls?.()}catch(e){}try{window.injectLBMenu?.()}catch(e){}
}
async function start(){const B=await wait();if(!B)return;const go=()=>render(B);go();setTimeout(go,500);setTimeout(go,1500);setTimeout(go,3000);setInterval(go,10000);window.addEventListener('online',go);document.addEventListener('visibilitychange',()=>{if(!document.hidden)go()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
