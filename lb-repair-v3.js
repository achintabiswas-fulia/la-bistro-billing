(()=>{
'use strict';
const M=[
['OUR SPECIALS / আমাদের স্পেশাল', [['Shikari Chicken Tikka','শিকারি চিকেন টিক্কা',215],['La Bistro Veg Croquette','লা বিস্ট্রো ভেজ ক্রোকেট',180],['Garlic Chicken','গার্লিক চিকেন',180],['Fish Finger','ফিশ ফিঙ্গার',145],['Chicken Nugget','চিকেন নাগেট',100]]],
['SPECIAL MAIN COURSE / স্পেশাল মেন কোর্স', [['La Bistro Chicken Kabab Masala','লা বিস্ট্রো চিকেন কাবাব মাসালা',265],['Sultani Chicken Strip','সুলতানি চিকেন স্ট্রিপ',240],['Kashmiri Chicken','কাশ্মীরি চিকেন',275],['Shikari Chicken Tikka Masala','শিকারি চিকেন টিক্কা মাসালা',275],['Zafrani Korachi Chicken','জাফরানি করাচি চিকেন',275],['Chistro Mughlai','চিকেন মুঘলাই',275],['La Bistro Chicken Chap','লা বিস্ট্রো চিকেন চাপ',240]]],
['STARTERS / স্টার্টার্স', [['French Fries','ফ্রেঞ্চ ফ্রাইস',90],['Potato Croquettes','পটেটো ক্রোকেটস',90],['Fish N Chips','ফিশ এন চিপস',240],['Chicken Nugget','চিকেন নাগেট',100],['Chicken Tikka','চিকেন টিক্কা',150],['Chicken Kebab','চিকেন কাবাব',150],['Chicken Lollipop','চিকেন ললিপপ',150],['Paneer Tikka','পনীর টিক্কা',160],['Paneer Satay','পনীর সাতে',150],['Hariyali Chicken Tikka','হরিয়ালি চিকেন টিক্কা',160],['Reshmi Kabab (4 pcs)','রেশমি কাবাব (৪ পিস)',250],['Garlic Chicken','গার্লিক চিকেন',180],['Butter Garlic Chicken','বাটার গার্লিক চিকেন',200],['Tengri Kebab (4 pcs)','তেংরি কাবাব (৪ পিস)',300],['Chicken Popcorn','চিকেন পপকর্ন',150],['Chicken Satay','চিকেন সাতে',180],['Malai Chicken Tikka (4 pcs)','মালাই চিকেন টিক্কা (৪ পিস)',180],['Fish Finger (5 pcs)','ফিশ ফিঙ্গার (৫ পিস)',150],['Paneer Pakora (4 pcs)','পনীর পাকোড়া (৪ পিস)',100],['Cheese Pakora (4 pcs)','চিজ পাকোড়া (৪ পিস)',200],['Chicken Pakora (4 pcs)','চিকেন পাকোড়া (৪ পিস)',120]]],
['SOUP / স্যুপ', [['Chicken Noodles Soup','চিকেন নুডলস স্যুপ',100],['Hot & Sour Soup','হট অ্যান্ড সাওয়ার স্যুপ',80],['Chicken Hot & Sour Soup','চিকেন হট অ্যান্ড সাওয়ার স্যুপ',90],['Chicken Clear Soup','চিকেন ক্লিয়ার স্যুপ',100],['Sweet Corn Soup','সুইট কর্ন স্যুপ',80],['Chicken Sweet Corn Soup','চিকেন সুইট কর্ন স্যুপ',100]]],
['PIZZA / পিজ্জা', [['Margarita Pizza','মার্গারিটা পিজ্জা',140],['Margarita Pizza - Large','মার্গারিটা পিজ্জা - লার্জ',180],['Paneer Pizza','পনীর পিজ্জা',160],['Paneer Pizza - Large','পনীর পিজ্জা - লার্জ',220],['Tandoori Pizza','তন্দুরি পিজ্জা',180],['Tandoori Pizza - Large','তন্দুরি পিজ্জা - লার্জ',250],['Spice Corner Pizza','স্পাইস কর্নার পিজ্জা',180],['Spice Corner Pizza - Large','স্পাইস কর্নার পিজ্জা - লার্জ',250],['Chicken Keema Pizza','চিকেন কিমা পিজ্জা',200],['Chicken Keema Pizza - Large','চিকেন কিমা পিজ্জা - লার্জ',280],['La Bistro Delicious','লা বিস্ট্রো ডেলিশাস',200],['La Bistro Delicious - Large','লা বিস্ট্রো ডেলিশাস - লার্জ',300],['Extra Cheese','এক্সট্রা চিজ',50],['Extra Cheese - Large','এক্সট্রা চিজ - লার্জ',80]]],
['CHINESE / চাইনিজ', [['Veg Fried Noodles','ভেজ ফ্রাইড নুডলস',100],['Egg Fried Noodles','এগ ফ্রাইড নুডলস',120],['Chicken Fried Noodles','চিকেন ফ্রাইড নুডলস',140],['Mixed Noodles','মিক্সড নুডলস',160],['Veg Fried Rice','ভেজ ফ্রাইড রাইস',90],['Egg Fried Rice','এগ ফ্রাইড রাইস',120],['Chicken Fried Rice','চিকেন ফ্রাইড রাইস',140],['Mixed Fried Rice','মিক্সড ফ্রাইড রাইস',160],['Chilli Chicken','চিলি চিকেন',160],['Chicken Manchurian','চিকেন মাঞ্চুরিয়ান',160],['Chilli Fish','চিলি ফিশ',200],['Chilli Paneer','চিলি পনীর',200]]],
['TANDOORI / তন্দুরি', [['Tandoori Chicken - Half','তন্দুরি চিকেন - হাফ',250],['Tandoori Chicken - Full','তন্দুরি চিকেন - ফুল',450],['Tandoori Pomfret','তন্দুরি পমফ্রেট',350],['Grilled Chicken Breast','গ্রিলড চিকেন ব্রেস্ট',350]]],
['BIRYANI / বিরিয়ানি', [['Chicken Biryani - 1 pc','চিকেন বিরিয়ানি - ১ পিস',150],['Chicken Biryani - 2 pcs','চিকেন বিরিয়ানি - ২ পিস',200],['Fish Biryani','ফিশ বিরিয়ানি',200],['Mutton Biryani - Half','মাটন বিরিয়ানি - হাফ',270],['Mutton Biryani - Full','মাটন বিরিয়ানি - ফুল',400]]],
['THALI / থালি', [['Veg Thali','ভেজ থালি',100],['Egg Thali','এগ থালি',120],['Katla Thali','কাতলা থালি',180],['Chicken Thali','চিকেন থালি',180],['Mutton Thali','মাটন থালি',250],['Ilish Thali','ইলিশ থালি',400],['Special Veg Thali','স্পেশাল ভেজ থালি',350],['Special Katla Thali','স্পেশাল কাতলা থালি',500],['Special Chicken Thali','স্পেশাল চিকেন থালি',500],['Special Mutton Thali','স্পেশাল মাটন থালি',600],['La Bistro Special Thali','লা বিস্ট্রো স্পেশাল থালি',900]]],
['MAIN COURSE / মেইন কোর্স', [['Egg Pouch (1 pc)','এগ পোচ (১ পিস)',20],['Egg Bhurji (2 Egg)','এগ ভুর্জি (২ ডিম)',60],['Egg Omelette (2 Egg)','এগ অমলেট (২ ডিম)',40],['Egg Curry (2 Egg)','এগ কারি (২ ডিম)',120],['Daal Fry','ডাল ফ্রাই',80],['Veg Daal','ভেজ ডাল',80],['Daal Makhani','ডাল মাখানি',140],['Plain Tadka','প্লেইন তড়কা',100],['Egg Tadka','এগ তড়কা',120],['Chana Masala','ছোলা মাসালা',120],['Aloo Jeera','আলু জিরা',120],['Aloo Motor','আলু মটর',140],['Aloo Dum','আলু দম',120],['Matar Paneer','মটর পনীর',150],['Palak Paneer','পালক পনীর',200],['Hariyali Paneer Masala','হরিয়ালি পনীর মসলা',200],['Paneer Butter Masala','পনীর বাটার মসলা',150],['Paneer Tikka Masala','পনীর টিক্কা মসলা',250],['Tel Patal','তেল পটল',120],['Chicken Curry (2 pcs)','চিকেন কারি (২ পিস)',150],['Chicken Kosha (2 pcs)','চিকেন কষা (২ পিস)',150],['Chicken Butter Masala','চিকেন বাটার মসলা',250],['Chicken Tikka Masala (4 pcs)','চিকেন টিক্কা মসলা (৪ পিস)',250],['Chicken Bharta','চিকেন ভর্তা',280],['Fish Curry (Ruhi/Katla)','ফিশ কারি (রুই/কাতলা)',110],['Fish Curry (Ruhi/Katla) - Large','ফিশ কারি (রুই/কাতলা) - লার্জ',150],['Katla Fry (1 pc)','কাতলা ফ্রাই (১ পিস)',100],['Katla Fry (1 pc) - Large','কাতলা ফ্রাই (১ পিস) - লার্জ',120],['Mutton Kosha (2 pcs)','মাটন কষা (২ পিস)',350],['Mutton Curry (2 pcs)','মাটন কারি (২ পিস)',350],['Mixed Vegetable','মিক্সড ভেজিটেবল',160],['Kadai Paneer','কড়াই পনীর',200],['Kadai Chicken (2 pcs)','কড়াই চিকেন (২ পিস)',180],['Chicken Do Pyaza (2 pcs)','চিকেন দো পিয়াজা (২ পিস)',180],['Mutton Do Pyaza (2 pcs)','মাটন দো পিয়াজা (২ পিস)',400],['Chicken Handi (6 pcs)','চিকেন হান্ডি (৬ পিস)',450],['Mutton Handi (4 pcs)','মাটন হান্ডি (৪ পিস)',700],['Patal Chingri','পটল চিংড়ি',180],['Chingri Malai Curry','চিংড়ি মালাই কারি',250],['Sorshe Ilish','সরষে ইলিশ',300]]],
['ROTI & PARATHA / রুটি ও পরোটা', [['Tawa Roti','তাওয়া রুটি',7],['Tandoori Roti','তন্দুরি রুটি',20],['Butter Tandoori Roti','বাটার তন্দুরি রুটি',30],['Plain Naan','প্লেইন নান',40],['Butter Naan','বাটার নান',50],['Laccha Paratha','লাচ্ছা পরোটা',40],['Ajwain Paratha','আজওয়াইন পরোটা',40],['Onion Paratha','অনিয়ন পরোটা',50],['Aloo Paratha','আলু পরোটা',50],['Masala Kulcha','মসলা কুলচা',60],['Garlic Butter Naan','গার্লিক বাটার নান',50],['Cheese Naan','চিজ নান',70],['Cheese Garlic Naan','চিজ গার্লিক নান',80],['Chicken Keema Paratha','চিকেন কিমা পরোটা',100]]],
['TEA & COFFEE / চা ও কফি', [['Milk Tea','মিল্ক টি',20],['Black Tea','ব্ল্যাক টি',15],['Green Tea','গ্রিন টি',25],['Milk Coffee','মিল্ক কফি',30],['Green Coffee','গ্রিন কফি',35],['Black Coffee','ব্ল্যাক কফি',20],['Cold Coffee','কোল্ড কফি',100],['Masala Cold Drink','মসলা কোল্ড ড্রিঙ্ক',80],['Lassi','লস্যি',90]]],
['ICE CREAM / আইসক্রিম', [['Butter Scotch','বাটার স্কচ',80],['Vanilla with Dry Fruit','ভ্যানিলা উইথ ড্রাই ফ্রুট',80],['Chocolate','চকলেট',90]]]
];
let cat=0;
const q=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const money=n=>'₹'+Number(n).toFixed(0);
function ensure(){
 let tabs=document.getElementById('tabs'),panel=document.getElementById('menuPanel');
 const bill=document.querySelector('.cart');
 if(!tabs){tabs=document.createElement('div');tabs.id='tabs';tabs.className='tabs';(bill?.parentElement||document.body).insertBefore(tabs,bill||null)}
 if(!panel){panel=document.createElement('main');panel.id='menuPanel';panel.className='menu-panel';(bill?.parentElement||document.body).insertBefore(panel,bill||null)}
 tabs.style.display='flex';tabs.style.visibility='visible';panel.style.display='block';panel.style.visibility='visible';
 return {tabs,panel};
}
function draw(){
 const {tabs,panel}=ensure();
 tabs.innerHTML=M.map((c,i)=>`<button type="button" class="tab ${i===cat?'active':''}" data-cat="${i}">${q(c[0])}</button>`).join('');
 tabs.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cat=Number(b.dataset.cat);draw()});
 const c=M[cat];
 panel.innerHTML=`<div class="category-title">${q(c[0])}</div><div class="grid">${c[1].map((it,i)=>`<button type="button" class="item lb-real-item" data-i="${i}"><span class="lb-dot">＋</span><div class="en">${q(it[0])}</div><div class="bn">${q(it[1])}</div><div class="price">${money(it[2])}</div></button>`).join('')}</div>`;
 panel.querySelectorAll('.lb-real-item').forEach(b=>b.onclick=()=>{
   const it=c[1][Number(b.dataset.i)];
   if(typeof window.addItem==='function'){
     try{window.addItem(encodeURIComponent(it[0]+'|'+it[1]+'|'+it[2]));return}catch(e){}
   }
   fallbackAdd(it);
 });
}
const fb={};
function fallbackAdd(it){const k=it.join('|');fb[k]=(fb[k]||0)+1;renderFallbackBill()}
function fallbackQty(k,d){fb[k]=(fb[k]||0)+d;if(fb[k]<=0)delete fb[k];renderFallbackBill()}
function renderFallbackBill(){
 const box=document.getElementById('cartItems');if(!box)return;
 const keys=Object.keys(fb);box.innerHTML=keys.length?keys.map(k=>{const it=k.split('|'),qty=fb[k];return `<div class="cart-row"><div class="cart-name">${q(it[0])}</div><div class="cart-bn">${q(it[1])}</div><div class="row-controls"><button class="small" onclick="window.lbFallbackQty(${JSON.stringify(k)},-1)">−</button><b>${qty}</b><button class="small" onclick="window.lbFallbackQty(${JSON.stringify(k)},1)">+</button><span class="amount">${money(qty*Number(it[2]))}</span></div></div>`}).join(''):'<div class="empty">Tap a menu item to add / মেনুর আইটেমে ট্যাপ করুন</div>';
 const sub=keys.reduce((s,k)=>{const it=k.split('|');return s+fb[k]*Number(it[2])},0);
 const dis=Number(document.getElementById('discount')?.value||0),rate=Number(document.getElementById('gst')?.value||0),tax=Math.max(0,sub-dis)*rate/100,total=Math.max(0,sub-dis)+tax;
 const s=document.getElementById('subtotal'),t=document.getElementById('total');if(s)s.textContent=money(sub);if(t)t.textContent=money(total);
}
window.lbFallbackQty=fallbackQty;
function style(){if(document.getElementById('lb-v3-style'))return;const s=document.createElement('style');s.id='lb-v3-style';s.textContent=`
#tabs{display:flex!important;gap:7px!important;overflow-x:auto!important;padding:9px 10px!important;background:#fff!important;border-bottom:1px solid #b89b52!important;visibility:visible!important}
#tabs .tab{display:block!important;flex:0 0 auto!important;white-space:nowrap!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;border:2px solid #b9953e!important;border-radius:22px!important;padding:9px 13px!important;font-size:14px!important;font-weight:900!important;min-height:44px!important}
#tabs .tab.active{background:#e7bd55!important;color:#111!important}
#menuPanel{display:block!important;visibility:visible!important;padding:8px 10px 16px!important;background:#f7f7f7!important}
#menuPanel .category-title{display:block!important;color:#111!important;background:#fffaf0!important;border:2px solid #d1ae58!important;font-size:22px!important;font-weight:900!important;text-align:center!important;border-radius:12px!important;padding:9px!important;margin:3px 0 9px!important}
#menuPanel .grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;overflow:visible!important}
#menuPanel .item{display:flex!important;min-height:126px!important;position:relative!important;flex-direction:column!important;align-items:flex-start!important;background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;border:2px solid #ddd!important;border-radius:12px!important;padding:12px!important;cursor:pointer!important;text-align:left!important;touch-action:manipulation!important}
#menuPanel .item:active{transform:scale(.98)!important;background:#fff4d2!important}
#menuPanel .item .en{display:block!important;color:#111!important;-webkit-text-fill-color:#111!important;font-size:15px!important;font-weight:900!important;line-height:1.2!important;margin-top:8px!important}
#menuPanel .item .bn{display:block!important;color:#222!important;-webkit-text-fill-color:#222!important;font-size:14px!important;font-weight:800!important;line-height:1.25!important;margin-top:5px!important}
#menuPanel .item .price{display:block!important;color:#111!important;-webkit-text-fill-color:#111!important;font-size:16px!important;font-weight:900!important;margin-top:auto!important;align-self:flex-end!important}
#menuPanel .lb-dot{position:absolute!important;top:7px!important;right:8px!important;font-size:20px!important;font-weight:900!important;color:#b38316!important}
@media(min-width:700px){#menuPanel .grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
`;
document.head.appendChild(s)}
function run(){style();draw();try{window.renderCart?.()}catch(e){};if(!window.renderCart)renderFallbackBill()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
