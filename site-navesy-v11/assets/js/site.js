(()=>{
const config=window.MD_SITE_CONFIG||{};
const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];

const toggle=$('.nav-toggle'),nav=document.getElementById('site-navigation');
if(toggle&&nav){
  toggle.addEventListener('click',()=>{
    const open=nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  });
  $$('a',nav).forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
  }));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

$$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

const filters=$$('[data-filter]'),cards=$$('[data-category]'),count=$('[data-count]');
const showMore=$('[data-show-more]'),galleryStatus=$('[data-gallery-status]');
let filterValue='all',limit=12;
function photoWord(n){ const m=n%100;return m>=11&&m<=14?'фотографий':n%10===1?'фотография':n%10>=2&&n%10<=4?'фотографии':'фотографий'; }
function renderGallery(){
  const filtered=cards.filter(c=>filterValue==='all'||c.dataset.category===filterValue);
  cards.forEach(c=>{ const index=filtered.indexOf(c);c.classList.toggle('is-hidden',index===-1||index>=limit); });
  const visible=Math.min(limit,filtered.length);
  if(count)count.textContent=filtered.length+' '+photoWord(filtered.length);
  if(galleryStatus)galleryStatus.textContent=`Показано ${visible} из ${filtered.length}`;
  if(showMore){showMore.hidden=visible>=filtered.length;showMore.setAttribute('aria-expanded',String(visible>=filtered.length));}
  filters.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.filter===filterValue)));
}
filters.forEach(btn=>btn.addEventListener('click',()=>{filterValue=btn.dataset.filter;limit=12;renderGallery()}));
showMore?.addEventListener('click',()=>{limit+=9;renderGallery()});
if(cards.length)renderGallery();

const dialog=document.getElementById('image-dialog');
if(dialog){
  const dialogImg=$('img',dialog), caption=$('[data-dialog-title]',dialog);
  $$('[data-enlarge]').forEach(el=>{
    const open=()=>{
      const img=$('img',el);
      dialogImg.src=img.dataset.fullSrc||img.src;
      dialogImg.alt=img.alt;
      caption.textContent=el.dataset.caption||'';
      dialog.showModal();
    };
    el.addEventListener('click',e=>{ if(e.target.closest('[data-popup-open]')) return; open(); });
    el.addEventListener('keydown',e=>{ if(e.target.closest('[data-popup-open]')) return; if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
  });
  $('[data-close]',dialog)?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{ if(e.target===dialog) dialog.close(); });
}

const popup=document.getElementById('lead-modal');
const backdrop=$('.popup-backdrop');
const popupTitle=$('#lead-modal-title');
const popupText=$('[data-popup-text]',popup||document);
const popupChannel=$('input[name="channel"]',popup||document);
const popupPage=$('input[name="page"]',popup||document);
let lastTrigger=null;
const bodyLock=(on)=>document.body.classList.toggle('body-locked',on);
const closePopup=()=>{
  if(!popup) return;
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden','true');
  bodyLock(false);
  if(backdrop) backdrop.hidden=true;
  if(lastTrigger) lastTrigger.focus();
};
const openPopup=(trigger)=>{
  if(!popup) return;
  const chosen=String(trigger?.dataset.popupOpen||'').toLowerCase();
  const socialUrl=config.socials?.[chosen];
  if(socialUrl && /^https:\/\//.test(socialUrl)){ window.open(socialUrl,'_blank','noopener,noreferrer'); return; }
  lastTrigger=trigger||null;
  const title=trigger?.dataset.popupTitle||'Ответьте на 4 вопроса';
  const note=trigger?.dataset.popupNote||'Это поможет нам быстрее понять задачу и подготовить предложение.';
  const channel=trigger?.dataset.popupOpen||'Квиз с сайта';
  if(popupTitle) popupTitle.textContent=title;
  if(popupText) popupText.textContent=note;
  if(popupChannel) popupChannel.value=channel;
  if(popupPage) popupPage.value=window.location.pathname;
  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden','false');
  bodyLock(true);
  if(backdrop) backdrop.hidden=false;
  resetQuiz();
  if(trigger?.dataset.calcSummary){
    const desc=quizForm?.querySelector('textarea[name="message"]');
    if(desc) desc.value='Данные из 3D-калькулятора: '+trigger.dataset.calcSummary;
    const width=quizForm?.querySelector('input[name="width"]');
    const length=quizForm?.querySelector('input[name="length"]');
    if(width)width.value=trigger.dataset.calcWidth||'';
    if(length)length.value=trigger.dataset.calcLength||'';
    quizForm?.querySelector('input[name="purpose"][value="Нужен другой вариант"]')?.click();
    const typeRadio=Array.from(quizForm?.querySelectorAll('input[name="type"]')||[]).find(r=>r.value===trigger.dataset.calcType);
    if(typeRadio)typeRadio.checked=true;
    // All parameters came from the calculator; customer needs only contact details.
    currentStep=4;updateQuiz();
  }
  const type=trigger?.dataset.workType;
  const valueByType={arch:'Арочный',gable:'Двускатный',one:'Односкатный'};
  const selectedType=valueByType[type];
  if(selectedType){
    const radio=quizForm?.querySelector(`input[name="type"][value="${selectedType}"]`);
    if(radio) radio.checked=true;
    const desc=quizForm?.querySelector('textarea[name="message"]');
    if(desc) desc.value='Интересует конструкция, похожая на фото из раздела «Наши работы». ';
  }
  const methods={telegram:'Telegram',max:'MAX',whatsapp:'WhatsApp'};
  const method=methods[chosen];
  if(method){
    const select=quizForm?.querySelector('select[name="contact_method"]');
    if(select) select.value=method;
  }
  setTimeout(()=>{
    const first=$('[data-popup-close]',popup);
    first?.focus();
  },30);
};
$$('[data-popup-open]').forEach(btn=>btn.addEventListener('click',()=>openPopup(btn)));
$$('[data-popup-close]').forEach(btn=>btn.addEventListener('click',closePopup));
backdrop?.addEventListener('click',closePopup);
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && popup?.classList.contains('is-open')) closePopup(); });
// Keep keyboard navigation inside the modal while it is open.
document.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||!popup?.classList.contains('is-open')) return;
  const focusables=$$('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])',popup)
    .filter(el=>el.getClientRects().length>0 && !el.closest('.quiz-step:not(.is-active)'));
  if(!focusables.length) return;
  const first=focusables[0],last=focusables[focusables.length-1];
  if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
});

const deliverLead=async (payload,feedback)=>{
  const endpoint=String(config.leadEndpoint||'').trim();
  if(endpoint){
    if(!/^https:\/\//.test(endpoint)){
      if(feedback) feedback.textContent='Адрес приёма заявок настроен некорректно.';
      return false;
    }
    if(feedback) feedback.textContent='Отправляем заявку…';
    try{
      const resp=await fetch(endpoint,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      if(!resp.ok) throw new Error('HTTP '+resp.status);
      if(feedback) feedback.textContent='Заявка передана. Мы свяжемся с вами после обработки обращения.';
      return true;
    } catch(e){
      if(feedback) feedback.textContent='Не удалось отправить заявку. Позвоните нам или попробуйте позже.';
      return false;
    }
  }
  const subject=encodeURIComponent(payload.subject||'Заявка — МЫ ДЕЛАЕМ НАВЕСЫ');
  const body=encodeURIComponent(payload.text||'');
  const email=String(config.email||'grupp.md@mail.ru');
  if(feedback) feedback.textContent='Откроется почтовое приложение. Письмо нужно отправить самостоятельно — заявка пока не передана.';
  window.location.href='mailto:'+email+'?subject='+subject+'&body='+body;
  return false;
};

const quizForm=$('[data-quiz-form]');
const steps=$$('.quiz-step',quizForm||document);
const prevBtn=$('[data-quiz-prev]',quizForm||document);
const nextBtn=$('[data-quiz-next]',quizForm||document);
const submitBtn=$('[data-quiz-submit]',quizForm||document);
const progress=$('[data-quiz-progress]',popup||document);
const currentLabel=$('[data-quiz-step-current]',popup||document);
let currentStep=1;
const totalSteps=steps.length||4;

const updateQuiz=()=>{
  steps.forEach((step,i)=>step.classList.toggle('is-active',i===currentStep-1));
  if(currentLabel) currentLabel.textContent=String(currentStep);
  if(progress) progress.style.width=(currentStep/totalSteps*100)+'%';
  if(prevBtn) prevBtn.hidden=currentStep===1;
  if(nextBtn) nextBtn.hidden=currentStep===totalSteps;
  if(submitBtn) submitBtn.hidden=currentStep!==totalSteps;
};

const validateStep=(stepNum)=>{
  if(!quizForm) return true;
  const step=steps[stepNum-1];
  if(!step) return true;
  const feedback=$('.form-message',quizForm);
  const requiredInputs=$$('input[required], textarea[required], select[required]',step);
  for(const input of requiredInputs){
    if(input.type==='radio'){
      const checked=quizForm.querySelector(`input[name="${input.name}"]:checked`);
      if(!checked){ if(feedback) feedback.textContent='Пожалуйста, выберите один из вариантов.'; return false; }
    } else if(input.type==='checkbox'){
      if(!input.checked){ if(feedback) feedback.textContent='Пожалуйста, подтвердите согласие на обработку данных.'; return false; }
    } else if(!String(input.value||'').trim()){
      if(feedback) feedback.textContent='Пожалуйста, заполните обязательные поля на текущем шаге.'; return false;
    }
  }
  if(feedback) feedback.textContent=config.leadEndpoint ? 'После подтверждения мы передадим ваши ответы менеджеру.' : 'После последнего шага откроется письмо — его нужно будет отправить самостоятельно.';
  return true;
};

const resetQuiz=()=>{
  currentStep=1;
  quizForm?.reset();
  updateQuiz();
};
nextBtn?.addEventListener('click',()=>{ if(!validateStep(currentStep)) return; currentStep=Math.min(totalSteps,currentStep+1); updateQuiz(); });
prevBtn?.addEventListener('click',()=>{ currentStep=Math.max(1,currentStep-1); updateQuiz(); });
quizForm?.addEventListener('submit',e=>{
  e.preventDefault();
  if(!validateStep(currentStep)) return;
  const data=new FormData(quizForm);
  const feedback=$('.form-message',quizForm);
  const name=String(data.get('name')||'').trim();
  const phone=String(data.get('phone')||'').trim();
  const consent=data.get('consent');
  if(!name||phone.replace(/\D/g,'').length<10||!consent){
    if(feedback) feedback.textContent='Укажите имя, корректный номер телефона и подтвердите согласие.';
    return;
  }
  const channel=String(data.get('channel')||'Квиз с сайта').trim();
  const page=String(data.get('page')||window.location.pathname).trim();
  const bodyLines=[
    `Источник: ${page}`,
    `Канал: ${channel}`,
    `Что нужно: ${data.get('purpose')||'Не указано'}`,
    `Тип навеса: ${data.get('type')||'Не указано'}`,
    `Ширина: ${data.get('width')||'Не указана'}`,
    `Длина: ${data.get('length')||'Не указана'}`,
    `Комментарий: ${data.get('message')||'Не указано'}`,
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Удобная связь: ${data.get('contact_method')||'Телефон'}`
  ];
  const payload={subject:channel+' — МЫ ДЕЛАЕМ НАВЕСЫ',text:bodyLines.join('\n'),type:'quiz',page,channel,
    purpose:String(data.get('purpose')||''),canopyType:String(data.get('type')||''),width:String(data.get('width')||''),length:String(data.get('length')||''),name,phone,preferredContact:String(data.get('contact_method')||'Телефон'),message:String(data.get('message')||''),consent:true};
  deliverLead(payload,feedback).then(sent=>{
    if(sent){ quizForm.reset(); currentStep=1; updateQuiz(); }
  });
});
updateQuiz();

const simpleForms=$$('form[data-lead-form], #contact-form').filter(f=>f!==quizForm);
simpleForms.forEach(form=>{const btn=form.querySelector('button[type=submit]');if(btn){btn.textContent=config.leadEndpoint?'Отправить заявку ↗':'Подготовить письмо ↗';}const note=form.querySelector('.form-message');if(note){note.textContent=config.leadEndpoint?'Нажимая кнопку, вы передаёте данные для ответа на ваш запрос.':'Форма подготовит письмо. Для передачи заявки его нужно отправить самостоятельно.';}});
simpleForms.forEach(form=>{
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(form);
    const name=String(data.get('name')||'').trim();
    const phone=String(data.get('phone')||'').trim();
    const message=String(data.get('message')||'').trim();
    const consent=data.get('consent');
    const feedback=$('.form-message',form);
    if(!name||phone.replace(/\D/g,'').length<10||!consent){
      if(feedback) feedback.textContent='Укажите имя, корректный номер телефона и подтвердите согласие.';
      return;
    }
    const text='Источник: '+window.location.pathname+'\nИмя: '+name+'\nТелефон: '+phone+'\nОписание: '+(message||'Не указано');
    const payload={subject:'Заявка — МЫ ДЕЛАЕМ НАВЕСЫ',text,type:'simple',page:window.location.pathname,name,phone,message,consent:true};
    deliverLead(payload,feedback).then(sent=>{ if(sent) form.reset(); });
  });
});
// Prevent sticky contact widgets from covering the footer links and legal note.
const footer=document.querySelector('.footer');
if(footer && 'IntersectionObserver' in window){
 const footerObserver=new IntersectionObserver(entries=>{
  document.body.classList.toggle('footer-in-view',!!entries[0]?.isIntersecting);
 },{threshold:0.05});
 footerObserver.observe(footer);
}
// Use the locally bundled MAX-style icon; retain a text fallback if the image fails.
$$('.max-official-icon').forEach(img=>{
  const fallback=img.nextElementSibling;
  const showFallback=()=>{img.style.display='none';if(fallback)fallback.style.setProperty('display','inline-flex','important');};
  img.addEventListener('error',showFallback,{once:true});
  if(img.complete && !img.naturalWidth) showFallback();
});
})();