// Presenter console: mirrors the audience window (index.html, opener) and sends it the clicker's commands.
(function(){
  const {slides}=window.HOMO_DECK;
  const {presentationKey}=window.HomoNavigation;
  const $=s=>document.querySelector(s);
  const TIMER='homo-urgens-presenter-timer',SIZE='homo-urgens-presenter-notes',SPLIT='homo-urgens-presenter-columns';
  const read=(storage,key)=>{try{return JSON.parse(window[storage].getItem(key));}catch{return null;}};
  const write=(storage,key,value)=>{try{window[storage].setItem(key,JSON.stringify(value));}catch{/* The console works without storage. */}};
  const pad=n=>String(n).padStart(2,'0');
  let state=null,lastSeen=0,size=Number(read('localStorage',SIZE))||28,share=Number(read('localStorage',SPLIT))||58;
  // The timer waits for the first click: the cover may stand on screen long before the talk begins.
  // Session storage keeps it running through a reload of this window.
  let timer={armed:true,running:false,since:0,total:0,...read('sessionStorage',TIMER)};

  const elapsed=()=>timer.total+(timer.running?Date.now()-timer.since:0);
  function saveTimer(){write('sessionStorage',TIMER,timer);tick();}
  function start(){if(!timer.running){timer={...timer,armed:false,running:true,since:Date.now()};saveTimer();}}
  function pause(){if(timer.running){timer={...timer,running:false,total:elapsed()};saveTimer();}}
  function resetTimer(){timer={armed:true,running:false,since:0,total:0};saveTimer();}
  function tick(){
    const s=Math.floor(elapsed()/1000),m=Math.floor(s/60);
    $('#elapsed').textContent=(m>=60?Math.floor(m/60)+':'+pad(m%60):m)+':'+pad(s%60);
    const box=$('#timer'),paused=!timer.running&&!timer.armed;
    box.classList.toggle('is-armed',timer.armed);box.classList.toggle('is-paused',paused);
    $('#pause').textContent=timer.running?'⏸':'▶';
    $('#pause').title=timer.running?'Pauza':timer.armed?'Start teraz':'Wznów';
  }

  // The preview is the deck itself in still mode; it reports ready, then follows deck:show.
  const frame={el:$('#currentFrame'),ready:false,want:null,sent:''};
  function aim(want){
    frame.want=want;
    const key=want.index+':'+want.step;
    if(!frame.ready||frame.sent===key)return;
    frame.sent=key;
    frame.el.contentWindow.postMessage({type:'deck:show',index:want.index,step:want.step},'*');
  }

  function apply(data){
    const index=Math.max(0,Math.min(slides.length-1,data.index)),slide=slides[index],reveals=slide.reveals||0;
    const step=Math.max(0,Math.min(reveals,data.step)),replay=Boolean(data.replay),key=index+':'+step+':'+replay;
    if(state&&state.key!==key&&timer.armed)start();
    const moved=!state||state.index!==index;
    state={index,step,replay,key};
    document.title='Prezenter · '+(index+1)+'/'+slides.length+' · Homo Urgens';
    $('#counter').textContent='Slajd '+(index+1)+' / '+slides.length;
    aim({index,step});
    if(moved){
      const notes=$('#notes');
      notes.innerHTML=window.HomoNotes.toHtml(slide.notes);
      notes.scrollTop=0;clip();
    }
  }

  // A fade at the bottom says the notes go on below the fold.
  function clip(){const notes=$('#notes');notes.classList.toggle('is-clipped',notes.scrollTop+notes.clientHeight<notes.scrollHeight-4);}
  function resize(delta){
    size=Math.max(16,Math.min(64,size+delta));
    document.documentElement.style.setProperty('--notes',size+'px');
    write('localStorage',SIZE,size);clip();
  }
  // The bar between slide and notes trades notes space for a larger slide, as in PowerPoint.
  function split(percent){
    share=Math.max(30,Math.min(80,percent));
    document.documentElement.style.setProperty('--left',share+'%');
    clip();
  }
  function drag(event){
    const bar=$('#split'),box=$('.console'),style=getComputedStyle(box),rect=box.getBoundingClientRect();
    if(!bar.hasPointerCapture(event.pointerId))return;
    const start=rect.left+parseFloat(style.paddingLeft),width=rect.width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
    split((event.clientX-start-bar.offsetWidth/2)/width*100);
  }

  function link(text,live){const el=$('#link');el.textContent=live?'':text;el.title=text;el.classList.toggle('is-live',live);}
  function hello(){
    const opener=window.opener;
    if(!opener){link('Otwórz z prezentacji klawiszem S',false);return;}
    if(opener.closed){link('Okno widowni zamknięte',false);return;}
    opener.postMessage({type:'deck:hello'},'*');
    const live=Date.now()-lastSeen<2500;
    link(live?'Połączono z widownią':'Brak połączenia z oknem widowni',live);
  }
  function send(action){if(window.opener&&!window.opener.closed)window.opener.postMessage({type:'deck:command',action},'*');}
  async function fullscreen(){
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{/* Fullscreen can be refused; the window still works. */}
  }

  window.addEventListener('message',event=>{
    const data=event.data;
    if(!data||typeof data!=='object')return;
    if(data.type==='deck:state'&&event.source===window.opener&&Number.isInteger(data.index)&&Number.isInteger(data.step)){
      lastSeen=Date.now();link('Połączono z widownią',true);apply(data);
    }else if(data.type==='deck:ready'){
      if(event.source===frame.el.contentWindow){frame.ready=true;frame.sent='';if(frame.want)aim(frame.want);}
    }
  });

  // The clicker reaches whichever window has focus; here every move goes to the audience window.
  const NEXT=['ArrowRight','ArrowDown','PageDown',' ','Enter','n'],BACK=['ArrowLeft','ArrowUp','PageUp','Backspace','p'];
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return;
    const key=presentationKey(event),lower=key.toLowerCase();
    const action=NEXT.includes(key)?'next':BACK.includes(key)?'previous':key==='Home'?'home':key==='End'?'end':lower==='r'?'restart':null;
    if(action){event.preventDefault();if(!event.repeat)send(action);}
    else if(lower==='f'){event.preventDefault();if(!event.repeat)void fullscreen();}
    else if(key==='+'||key==='='){event.preventDefault();resize(2);}
    else if(key==='-'){event.preventDefault();resize(-2);}
  });
  // Buttons never keep focus, so Space and Enter from a clicker always mean "next".
  document.querySelectorAll('button').forEach(button=>button.addEventListener('mousedown',event=>event.preventDefault()));
  $('#full').addEventListener('click',fullscreen);
  $('#pause').addEventListener('click',()=>timer.running?pause():start());
  $('#reset').addEventListener('click',resetTimer);
  $('#smaller').addEventListener('click',()=>resize(-2));
  $('#larger').addEventListener('click',()=>resize(2));
  $('#notes').addEventListener('scroll',clip,{passive:true});
  window.addEventListener('resize',clip);
  const bar=$('#split');
  bar.addEventListener('pointerdown',event=>{bar.setPointerCapture(event.pointerId);bar.classList.add('is-dragging');});
  bar.addEventListener('pointermove',drag);
  bar.addEventListener('lostpointercapture',()=>{bar.classList.remove('is-dragging');write('localStorage',SPLIT,share);});
  bar.addEventListener('dblclick',()=>{split(58);write('localStorage',SPLIT,share);});
  document.fonts?.ready.then(clip);

  resize(0);split(share);
  apply({index:0,step:0});
  state=null;
  tick();hello();
  setInterval(tick,250);
  setInterval(hello,1000);
})();
