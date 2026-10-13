(function(){
  const {slides}=window.HOMO_DECK;
  const {createNavigation,presentationKey}=window.HomoNavigation;
  const nav=createNavigation(slides);
  const stage=document.querySelector('#stage'),shell=document.querySelector('#stageShell');
  const previous=document.querySelector('#previous'),next=document.querySelector('#next');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const options=new URLSearchParams(location.search);
  let loaderFrame=0,drawFrame=0,hudTimer=0;
  const editing=()=>Boolean(window.DECK_EDITOR?.isEditing());
  const reduced=()=>motion.matches||options.get('motion')==='off';
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function fitStage(){
    const {width,height}=shell.getBoundingClientRect(),scale=Math.min(width/1920,height/1080);
    stage.style.transform='translate('+((width-1920*scale)/2)+'px,'+((height-1080*scale)/2)+'px) scale('+scale+')';
  }
  function stopAnimation(){
    cancelAnimationFrame(loaderFrame);cancelAnimationFrame(drawFrame);
    loaderFrame=drawFrame=0;
    window.DECK_MOTION?.stop();
  }
  function setLoader(value){
    const number=stage.querySelector('[data-loader-value]'),track=stage.querySelector('.loading-track');
    if(!number||!track)return;
    number.textContent=String(Math.round(value));
    track.style.setProperty('--load',value+'%');
    track.setAttribute('aria-valuenow',String(Math.round(value)));
  }
  function startLoader(slide,animate){
    if(!slide.loader)return;
    const {from,to,duration}=slide.loader;
    if(!animate||editing()||reduced()){setLoader(to);return;}
    setLoader(from);
    const began=performance.now(),id=slide.id;
    function frame(now){
      if(nav.state().id!==id||editing())return;
      const t=Math.min(1,(now-began)/duration);
      // Bursts and stalls toward the final value: theater, never real loading.
      const value=window.DECK_MOTION?window.DECK_MOTION.loaderValue(t,from,to):from+(to-from)*(1-Math.pow(1-t,2));
      setLoader(value);
      if(t<1)loaderFrame=requestAnimationFrame(frame);
      else loaderFrame=0;
    }
    loaderFrame=requestAnimationFrame(frame);
  }
  function syncReveals(draw=true){
    const {index,step}=nav.state(),slide=slides[index],full=editing();
    const article=stage.querySelector('.slide');
    article.dataset.revealIndex=String(step);
    stage.querySelectorAll('[data-reveal]').forEach(el=>{
      const visible=full||Number(el.dataset.reveal)<=step;
      el.classList.toggle('is-visible',visible);el.setAttribute('aria-hidden',String(!visible));el.inert=!visible;
    });
    if(draw)stage.querySelectorAll('.metric').forEach(el=>{
      if(!el.closest('.reveal')||el.closest('.reveal').classList.contains('is-visible'))el.classList.add('is-drawn');
      else el.classList.remove('is-drawn');
    });
    document.querySelector('#slideCounter').textContent=(index+1)+' / '+slides.length+(slide.reveals?' · '+step+'/'+slide.reveals:'');
    previous.disabled=index===0&&step===0;
    next.disabled=index===slides.length-1&&step===(slide.reveals||0);
  }
  function render(animate=false,source='jump'){
    // Forward moves, the opening and its replay are choreographed; going back shows the final state.
    const play=!reduced()&&!editing()&&(animate?source!=='back':['initial','restart'].includes(source));
    const shown=stage.querySelector('.slide'),before=shown&&slides[Number(shown.dataset.slideIndex)];
    if(play&&window.DECK_MOTION?.useViewTransition(before,slides[nav.state().index],source)){
      const transition=document.startViewTransition(()=>commit(play,source));
      transition.ready.catch(()=>{});
      transition.finished.catch(()=>{}).then(()=>window.DECK_MOTION.endViewTransition());
    }else commit(play,source);
    const hash='#'+slides[nav.state().index].id;
    if(location.hash!==hash){
      try{history.replaceState(null,'',hash);}catch{location.hash=hash;}
    }
  }
  function commit(play,source){
    stopAnimation();
    const {index}=nav.state(),slide=slides[index],shown=stage.querySelector('.slide');
    document.documentElement.dataset.motion=reduced()&&source!=='capture'?'reduce':'normal';
    stage.innerHTML='<article class="slide theme-'+slide.theme+' layout-'+slide.layout.split(' ').join(' layout-')+'" data-slide-id="'+slide.id+'" data-slide-index="'+index+'" data-reveal-index="0">'+
      '<img class="brand-top" src="assets/brand/conference-logo.png" alt="I love marketing & technology">'+
      '<img class="corner-heart" src="assets/brand/conference-heart.png" alt="">'+
      slide.html+'<footer class="slide-footer"><p class="source-note">'+escape(slide.source||'')+'</p><span class="slide-number">'+String(index+1).padStart(2,'0')+' / '+slides.length+'</span></footer>'+
      '<div class="deck-progress" style="--progress:'+((index+1)/slides.length*100)+'%" aria-hidden="true"></div></article>';
    window.DECK_EDITOR.bindSlide(stage,slide.id);
    syncReveals(false);fitStage();
    // Commit the zero-length arcs before drawing; otherwise a fresh DOM skips the transition.
    stage.querySelectorAll('.ring-value').forEach(el=>getComputedStyle(el).strokeDasharray);
    drawFrame=requestAnimationFrame(()=>{syncReveals();drawFrame=0;});
    window.DECK_MOTION?.enter(slide,stage.firstElementChild,{play,source,previous:shown,index});
    startLoader(slide,!['back','refresh','capture'].includes(source));
  }
  function show(index,step=0,source='jump'){
    const before=nav.state();nav.show(index,step);
    render(before.index!==nav.state().index,source);
  }
  function move(direction){
    if(editing()||document.querySelector('dialog[open]'))return;
    const before=nav.state();
    nav[direction]();
    const after=nav.state();
    if(before.index!==after.index)render(true,direction==='previous'?'back':'next');
    else{syncReveals();window.DECK_MOTION?.reveal(slides[after.index],stage.firstElementChild,after.step,before.step);}
  }
  window.DECK_NAV={show,next:()=>move('next'),previous:()=>move('previous'),getState:nav.state,syncReveals,refresh:()=>render(false,'refresh'),
    // The PPTX exporter replays each slide and each reveal with the choreography on.
    capture(index){nav.show(index,0);commit(true,'capture');return stage.firstElementChild;},
    captureStep(step){const before=nav.state();nav.show(before.index,step);syncReveals();window.DECK_MOTION?.reveal(slides[before.index],stage.firstElementChild,nav.state().step,before.step);}};
  function showControls(){
    document.body.classList.add('hud-visible');
    clearTimeout(hudTimer);hudTimer=setTimeout(()=>document.body.classList.remove('hud-visible'),2400);
  }
  function openNotes(){
    const {index}=nav.state(),slide=slides[index],elapsed=slides.slice(0,index).reduce((n,s)=>n+s.seconds,0);
    const time=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
    document.querySelector('#notesMeta').textContent='Slajd '+(index+1)+' · '+slide.speaker+' · '+slide.seconds+' s · '+time(elapsed)+'–'+time(elapsed+slide.seconds);
    document.querySelector('#notesTitle').textContent=slide.title;
    document.querySelector('#notesBody').innerHTML='<p>'+escape(slide.notes)+'</p>'+(slide.source?'<p class="notes-source">'+escape(slide.source)+'</p>':'');
    document.querySelector('#notesDialog').showModal();
  }
  async function fullscreen(){
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{showControls();}
  }
  previous.addEventListener('click',()=>{move('previous');showControls();});
  next.addEventListener('click',()=>{move('next');showControls();});
  document.querySelector('#fullscreen').addEventListener('click',fullscreen);
  document.querySelector('#edit').addEventListener('click',()=>window.DECK_EDITOR.toggle());
  document.querySelector('#notes').addEventListener('click',openNotes);
  document.querySelector('#help').addEventListener('click',()=>document.querySelector('#helpDialog').showModal());
  document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.addEventListener('pointermove',showControls,{passive:true});
  document.addEventListener('touchstart',showControls,{passive:true});
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return;
    if(event.target.closest('[contenteditable="true"],input,textarea,select'))return;
    const key=presentationKey(event);
    if(event.target.closest('button,a')&&[' ','Enter'].includes(key))return;
    if(document.querySelector('dialog[open]'))return;
    if(key.toLowerCase()==='e'){event.preventDefault();if(!event.repeat)window.DECK_EDITOR.toggle();return;}
    if(editing())return;
    if(['ArrowRight','ArrowDown','PageDown',' ','Enter','n'].includes(key)){event.preventDefault();if(!event.repeat)move('next');}
    else if(['ArrowLeft','ArrowUp','PageUp','Backspace','p'].includes(key)){event.preventDefault();if(!event.repeat)move('previous');}
    else if(key==='Home'){event.preventDefault();if(!event.repeat)show(0);}
    else if(key==='End'){event.preventDefault();if(!event.repeat)show(slides.length-1,Infinity);}
    else if(key.toLowerCase()==='f'){event.preventDefault();if(!event.repeat)void fullscreen();}
    else if(key.toLowerCase()==='o'){event.preventDefault();if(!event.repeat)openNotes();}
    else if(key.toLowerCase()==='r'){event.preventDefault();if(!event.repeat)show(0,0,'restart');}
    showControls();
  });
  stage.addEventListener('click',event=>{
    if(!editing()&&!event.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))move('next');
  });
  function fromHash(){const index=slides.findIndex(s=>s.id===location.hash.slice(1));return index<0?0:index;}
  window.addEventListener('hashchange',()=>{if(nav.state().id!==location.hash.slice(1))show(fromHash(),0,'hash');});
  window.addEventListener('resize',fitStage);
  motion.addEventListener('change',()=>render(false,'refresh'));
  document.addEventListener('visibilitychange',()=>{
    document.documentElement.classList.toggle('deck-hidden',document.hidden);
    window.DECK_MOTION?.setHidden(document.hidden);
  });
  show(fromHash(),0,'initial');showControls();
  // Fonts and assets are local. This hook also lets visual checks wait for settled loading.
  window.DECK_READY=Promise.all([document.fonts.ready,...Array.from(document.images,im=>im.decode().catch(()=>{}))]);
})();
