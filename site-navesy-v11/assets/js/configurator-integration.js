/* v10: compact independent panel scrolling, constant 3D preview on phones.
   Does not change calculation formulas or THREE model. */
(()=>{
 const component=document.getElementById('calc-component');
 if(!component)return;
 const panel=component.querySelector('#panel');
 const model=component.querySelector('#view');
 const results=component.querySelector('#calc-results-slot');
 const nav=[...component.querySelectorAll('[data-calc-tab]')];
 const expand=component.querySelector('[data-calc-expand]');
 const media=window.matchMedia('(max-width: 860px)');
 let active='settings';
 const estimate=()=>component.querySelector('#est');
 const moveEstimate=()=>{
   const est=estimate();if(!est)return;
   const container=media.matches?results:panel;
   if(est.parentElement!==container)container.appendChild(est);
 };
 const setTab=(name,focus=false)=>{
   active=name==='estimate'?'estimate':'settings';
   component.dataset.calcMobileTab=active;
   moveEstimate();
   nav.forEach(button=>{
     const selected=button.dataset.calcTab===active;
     button.setAttribute('aria-selected',String(selected));
     button.tabIndex=selected?0:-1;
     if(focus&&selected)button.focus({preventScroll:true});
   });
   if(active==='settings')panel.scrollTop=Math.min(panel.scrollTop,80);
 };
 nav.forEach((button,index)=>{
   button.addEventListener('click',()=>setTab(button.dataset.calcTab));
   button.addEventListener('keydown',event=>{
     if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
     event.preventDefault();
     let next=event.key==='Home'?0:event.key==='End'?nav.length-1:(index+(event.key==='ArrowRight'?1:-1)+nav.length)%nav.length;
     setTab(nav[next].dataset.calcTab,true);
   });
 });
 const syncMode=()=>{
   moveEstimate();
   if(!media.matches){component.removeAttribute('data-calc-mobile-tab');model?.classList.remove('is-expanded');}
   else setTab(active);
 };
 media.addEventListener?.('change',syncMode);
 syncMode();
 if(expand&&model){
   expand.addEventListener('click',()=>{
     const expanded=model.classList.toggle('is-expanded');
     expand.textContent=expanded?'Свернуть 3D':'Увеличить 3D';
     expand.setAttribute('aria-label',expanded?'Свернуть 3D-модель':'Увеличить 3D-модель');
     expand.setAttribute('aria-expanded',String(expanded));
   });
 }
 // Read source app state, without modifying the original engineering model.
 const quoteButton=component.querySelector('[data-calc-request]');
 const syncQuote=()=>{
   if(!quoteButton||typeof S==='undefined')return;
   const type=(typeof TY!=='undefined'&&TY[S.type]?.n)||'Навес';
   const roof=(typeof ROOF!=='undefined'&&ROOF[S.roof]?.n)||'Кровля не указана';
   const total=estimate()?.querySelector('.total strong')?.textContent?.trim()||'Предварительный расчёт';
   quoteButton.dataset.calcSummary=`Навес: ${type}; ширина: ${S.W} м; длина: ${S.L} м; высота: ${S.H} м; покрытие: ${roof}; предварительная стоимость: ${total}.`;
   quoteButton.dataset.calcWidth=String(S.W);
   quoteButton.dataset.calcLength=String(S.L);
   quoteButton.dataset.calcType=/ароч/i.test(type)?'Арочный':/двускат/i.test(type)?'Двускатный':/односкат|плоск/i.test(type)?'Односкатный':'Нужен совет';
 };
 const totalSmall=component.querySelector('[data-calc-total]');
 const est=estimate();
 if(est){
   const refresh=()=>{
     if(totalSmall)totalSmall.textContent=est.querySelector('.total strong')?.textContent?.trim()||'Расчёт';
     syncQuote();
   };
   new MutationObserver(refresh).observe(est,{childList:true,subtree:true,characterData:true});
   refresh();
 }
 panel.addEventListener('change',()=>requestAnimationFrame(syncQuote));
 panel.addEventListener('input',()=>requestAnimationFrame(syncQuote));
 panel.addEventListener('click',()=>requestAnimationFrame(syncQuote));
})();

(()=>{
 if(typeof THREE!=='undefined')return;
 const c=document.querySelector('#calc-component');if(!c)return;
 const msg=document.createElement('p');msg.className='calc-native__offline';
 msg.textContent='3D-модель требует загрузки библиотеки Three.js. Проверьте подключение к интернету. Если модель не появилась, можно запросить расчёт у менеджера.';
 c.querySelector('.calc-native__intro')?.append(msg);
})();
