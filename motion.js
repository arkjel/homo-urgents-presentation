/* Motion design: one geometric language taken from the conference heart's facets.
 * Everything here is decoration. Each slide's final state is plain CSS, so a cancelled
 * or skipped animation (fast clicking, back, editing, reduced motion) leaves a correct slide.
 */
(function(global){
  const W=1920,H=1080,NS='http://www.w3.org/2000/svg';
  const RED='#ee312f',MID='#cf1723',DARK='#95161d',SHADES=[RED,MID,DARK];
  const EASE={out:'cubic-bezier(.2,.8,.2,1)',expo:'cubic-bezier(.16,1,.3,1)',snap:'cubic-bezier(.7,0,.2,1)',accel:'cubic-bezier(.55,0,.85,.35)',back:'cubic-bezier(.34,1.56,.64,1)',inOut:'cubic-bezier(.45,0,.2,1)'};
  // A damped spring sampled into CSS linear(); browsers without linear() get a back-out curve.
  function spring(zeta=.5,omega=11){
    const wd=omega*Math.sqrt(1-zeta*zeta),points=[];
    for(let i=0;i<=48;i++){const t=i/48;points.push((1-Math.exp(-zeta*omega*t)*(Math.cos(wd*t)+zeta*omega/wd*Math.sin(wd*t))).toFixed(4));}
    points[48]='1';
    return 'linear('+points.join(',')+')';
  }
  EASE.spring=typeof CSS!=='undefined'&&CSS.supports?.('animation-timing-function','linear(0, 1)')?spring():EASE.back;
  function bezier(x1,y1,x2,y2){
    const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
    const sx=t=>((ax*t+bx)*t+cx)*t,sy=t=>((ay*t+by)*t+cy)*t;
    return x=>{
      if(x<=0)return 0;if(x>=1)return 1;
      let lo=0,hi=1,t=x;
      for(let i=0;i<32;i++){if(sx(t)<x)lo=t;else hi=t;t=(lo+hi)/2;}
      return sy(t);
    };
  }
  const expoOut=bezier(.16,1,.3,1);
  // Bursts and stalls: the bar jumps, waits, jumps again. Monotonic, exact at both ends.
  const LOADER=[[0,0],[.07,.17],[.2,.22],[.28,.44],[.43,.49],[.51,.68],[.65,.72],[.73,.87],[.87,.91],[.94,.97],[1,1]];
  function loaderValue(t,from,to){
    t=Math.min(1,Math.max(0,t));
    let i=0;while(i<LOADER.length-2&&t>LOADER[i+1][0])i++;
    const [t0,p0]=LOADER[i],[t1,p1]=LOADER[i+1],u=(t-t0)/(t1-t0);
    return from+(to-from)*(p0+(p1-p0)*(1-Math.pow(1-u,3)));
  }

  // Sessions: every render starts a new one; timers and frames of older sessions die quietly.
  let session=0,current=null,recorder=null;
  // Set by the PPTX exporter while it replays scenes; helpers describe what they animate.
  const record=event=>recorder?.event({...event,at:recorder.now()+(event.delay||0)});
  const timers=new Set(),frames=new Set(),pausedWhileHidden=new Set(),mascots=new WeakMap();
  const doc=()=>global.document;
  function later(ms,fn){const id=session;const t=setTimeout(()=>{timers.delete(t);if(id===session)fn();},ms);timers.add(t);return t;}
  function frame(fn){const f=requestAnimationFrame(now=>{frames.delete(f);fn(now);});frames.add(f);}
  function stop(){
    session++;
    timers.forEach(clearTimeout);timers.clear();
    frames.forEach(cancelAnimationFrame);frames.clear();
    current=null;
  }

  const $=(root,selector)=>root?.querySelector(selector)||null;
  const $$=(root,selector)=>root?Array.from(root.querySelectorAll(selector)):[];
  function svg(name,attrs={},parent){
    const node=doc().createElementNS(NS,name);
    for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);
    parent?.append(node);return node;
  }
  function A(el,keyframes,options={}){
    if(!el)return null;
    return el.animate(keyframes,{duration:520,easing:EASE.out,fill:'backwards',...options});
  }
  function rng(seed){
    return ()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
  }
  // Slide coordinates (1920 × 1080), whatever the window's scale.
  function box(el,article){
    const a=article.getBoundingClientRect(),r=el.getBoundingClientRect(),k=a.width/W||1;
    const x=(r.left-a.left)/k,y=(r.top-a.top)/k,w=r.width/k,h=r.height/k;
    return {x,y,w,h,cx:x+w/2,cy:y+h/2,right:x+w,bottom:y+h};
  }
  const pts=list=>list.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const centroid=t=>[(t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3];
  function positioned(el){if(el&&getComputedStyle(el).position==='static')el.style.position='relative';return el;}
  function triangle(size,random){
    const a=random()*Math.PI*2;
    return [0,1,2].map(k=>{const ang=a+k*2.094+(random()-.5)*.9,d=size*(.55+random()*.45);return [Math.cos(ang)*d,Math.sin(ang)*d];});
  }

  // Text: lines rise from behind a mask; characters can move on their own.
  function splitLines(el){
    if(!el)return [];
    if(el.dataset.moLines)return $$(el,':scope > .mo-line > .mo-line-i');
    const groups=[[]];
    for(const node of Array.from(el.childNodes)){
      if(node.nodeName==='BR'){groups.push([]);continue;}
      if(node.nodeType===3&&node.textContent.includes('\n')){
        node.textContent.split('\n').forEach((text,i)=>{if(i)groups.push([]);if(text.trim())groups.at(-1).push(doc().createTextNode(text));});
        continue;
      }
      groups.at(-1).push(node);
    }
    el.textContent='';
    const inners=groups.filter(g=>g.some(n=>n.nodeType!==3||n.textContent.trim())).map(group=>{
      const line=doc().createElement('span'),inner=doc().createElement('span');
      line.className='mo-line';inner.className='mo-line-i';
      inner.append(...group);line.append(inner);el.append(line);
      return inner;
    });
    el.dataset.moLines='1';
    return inners;
  }
  function splitChars(el,{open=false}={}){
    const chars=[];
    splitLines(el).forEach(inner=>{
      if(open)inner.parentElement.classList.add('mo-open');
      const walker=doc().createTreeWalker(inner,4),texts=[];
      while(walker.nextNode())texts.push(walker.currentNode);
      texts.forEach(text=>{
        const fragment=doc().createDocumentFragment();
        for(const ch of Array.from(text.textContent)){
          if(/\s/.test(ch)){fragment.append(ch);continue;}
          const span=doc().createElement('span');span.className='mo-char';span.textContent=ch;
          fragment.append(span);chars.push(span);
        }
        text.replaceWith(fragment);
      });
    });
    return chars;
  }
  function fadeUp(el,delay=0,{distance=24,duration=600,easing=EASE.expo}={}){
    return A(el,[{opacity:0,transform:'translateY('+distance+'px)'},{opacity:1,transform:'none'}],{duration,delay,easing});
  }
  function rise(el,delay=0,{stagger=85,duration=820}={}){
    if(el)record({type:'lines',el,delay,stagger,duration});
    splitLines(el).forEach((line,i)=>A(line,[{transform:'translateY(112%)'},{transform:'none'}],{duration,delay:delay+i*stagger,easing:EASE.expo}));
  }
  function typeText(el,{delay=0,speed=55,variance=.8,caret=true}={}){
    if(!el)return delay;
    const chars=Array.from(el.textContent),node=doc().createTextNode(''),random=rng(chars.length*31+7);
    el.textContent='';el.append(node);
    const mark=caret?doc().createElement('span'):null;
    if(mark){mark.className='mo-caret';el.append(mark);}
    let t=delay;
    chars.forEach((ch,i)=>{
      t+=speed*(1-variance/2+random()*variance)*(ch===' '?1.7:1);
      later(t,()=>{node.textContent=chars.slice(0,i+1).join('');});
    });
    if(mark)later(t+1100,()=>mark.remove());
    record({type:'type',el,delay,duration:t-delay,length:chars.length});
    return t;
  }
  function countUp(strong,to,{from=0,duration=1200,delay=0,ease=expoOut}={}){
    const text=Array.from(strong?.childNodes||[]).find(n=>n.nodeType===3);
    if(!text)return;
    if(recorder){record({type:'count',el:strong,from,to,delay,duration});text.textContent=String(to);return;}
    text.textContent=String(from);
    const begin=performance.now()+delay;
    const step=now=>{
      const t=Math.min(1,Math.max(0,(now-begin)/duration));
      text.textContent=String(Math.round(from+(to-from)*ease(t)));
      if(t<1)frame(step);
    };
    frame(step);
    later(delay+duration+60,()=>{text.textContent=String(to);});
  }

  // Geometry: facets, shards, sparkles, confetti and the screen-wide mosaic.
  function fxLayer(parent){
    let layer=$(parent,':scope > .mo-fx');
    if(!layer){layer=svg('svg',{class:'mo-fx',viewBox:'0 0 1920 1080','aria-hidden':'true'});parent.append(layer);}
    return layer;
  }
  function flyingFacet(layer,{x,y,size,fill,dx,dy,spin,duration,delay=0,easing=EASE.out}){
    const random=rng(Math.round(x*7+y*13+size*17));
    const p=svg('polygon',{points:pts(triangle(size,random)),fill},layer);
    p.style.transformBox='view-box';p.style.transformOrigin='0 0';
    const run=p.animate([
      {transform:'translate('+x+'px,'+y+'px) rotate(0deg) scale(1)',opacity:1},
      {transform:'translate('+(x+dx)+'px,'+(y+dy)+'px) rotate('+spin+'deg) scale(.2)',opacity:0}
    ],{duration,delay,easing,fill:'both'});
    run.onfinish=()=>p.remove();
    return p;
  }
  function sparkle(parent,x,y,{n=5,colors=SHADES,reach=[50,120],size=[7,16],seed=1}={}){
    const layer=fxLayer(parent),random=rng(seed+Math.round(x+y));
    for(let i=0;i<n;i++){
      const ang=random()*Math.PI*2,d=reach[0]+random()*(reach[1]-reach[0]);
      flyingFacet(layer,{x,y,size:size[0]+random()*(size[1]-size[0]),fill:colors[i%colors.length],dx:Math.cos(ang)*d,dy:Math.sin(ang)*d,spin:(random()-.5)*360,duration:620+random()*260,delay:random()*60});
    }
  }
  function shards(layer,rect,{n=24,from,colors=[RED,MID,DARK,'#3a3a3a','#ffffff'],seed=3,reach=[160,520]}){
    const random=rng(seed);
    for(let i=0;i<n;i++){
      const x=rect.x+random()*rect.w,y=rect.y+random()*rect.h;
      const ang=Math.atan2(y-from[1],x-from[0])+(random()-.5)*1.4,d=reach[0]+random()*(reach[1]-reach[0]);
      flyingFacet(layer,{x,y,size:5+random()*17,fill:colors[i%colors.length],dx:Math.cos(ang)*d,dy:Math.sin(ang)*d-60*random(),spin:(random()-.5)*900,duration:700+random()*500,easing:'cubic-bezier(.1,.7,.3,1)'});
    }
  }
  function confetti(parent,x,y,{n=72,seed=9}={}){
    const layer=fxLayer(parent),random=rng(seed);
    for(let i=0;i<n;i++){
      const size=7+random()*15,ang=-Math.PI/2+(random()-.5)*Math.PI*1.35,v=420+random()*680;
      const vx=Math.cos(ang)*v,vy=Math.sin(ang)*v,T=1.5+random()*1.1,spin=(random()-.5)*1500,g=1700;
      const p=svg('polygon',{points:pts(triangle(size,random)),fill:SHADES[i%3]},layer);
      p.style.transformBox='view-box';p.style.transformOrigin='0 0';
      const keyframes=[0,.15,.35,.6,.8,1].map(o=>{const t=o*T,drag=1-.38*o;return {offset:o,opacity:o>.8?1-(o-.8)*5:1,transform:'translate('+(x+vx*t*drag).toFixed(1)+'px,'+(y+vy*t+g*t*t/2).toFixed(1)+'px) rotate('+(spin*o).toFixed(0)+'deg)'};});
      p.animate(keyframes,{duration:T*1000,delay:random()*90,easing:'linear',fill:'both'}).onfinish=()=>p.remove();
    }
  }
  function mesh(cols,rows,seed=5,jitter=.34){
    const random=rng(seed),cw=W/cols,rh=H/rows,grid=[];
    for(let j=0;j<=rows;j++){
      grid[j]=[];
      for(let i=0;i<=cols;i++){
        const inX=i>0&&i<cols,inY=j>0&&j<rows;
        grid[j][i]=[i*cw+(inX?(random()-.5)*2*jitter*cw:0),j*rh+(inY?(random()-.5)*2*jitter*rh:0)];
      }
    }
    const tris=[];
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const a=grid[j][i],b=grid[j][i+1],c=grid[j+1][i+1],d=grid[j+1][i];
      if((i+j)%2)tris.push([a,b,c],[a,c,d]);else tris.push([a,b,d],[b,c,d]);
    }
    return tris;
  }
  function discard(node){node.getAnimations?.({subtree:true}).forEach(run=>run.cancel());node.remove();}
  function overlay(article){
    const layer=doc().createElement('div');
    layer.className='mo-overlay';layer.setAttribute('aria-hidden','true');
    article.append(layer);return layer;
  }
  function mosaic(layer,tris,colorOf){
    const field=svg('svg',{viewBox:'0 0 1920 1080',preserveAspectRatio:'none'},layer);
    return tris.map((t,i)=>{
      const fill=colorOf(t,i);
      const p=svg('polygon',{points:pts(t),fill,stroke:fill,'stroke-width':'1.6','stroke-linejoin':'round'},field);
      p.style.transformBox='fill-box';p.style.transformOrigin='center';
      return p;
    });
  }
  // The previous slide stays on screen above the mosaic for the first frames of a cut.
  function ghost(layer,previous){
    if(!previous)return null;
    previous.querySelectorAll('.mo-overlay').forEach(n=>n.remove());
    for(const el of [previous,...previous.querySelectorAll('*')])for(const attr of ['data-reveal','data-loader-value','data-edit','data-move-key','data-copy-key','id'])el.removeAttribute(attr);
    previous.classList.add('mo-ghost');previous.inert=true;
    layer.append(previous);
    return previous;
  }
  const themeKey=slide=>slide.layout.includes('worlds')?'split':slide.theme;
  function colorFor(slide){
    if(themeKey(slide)==='split')return t=>centroid(t)[0]<960?'#111':'#faf8f5';
    const fill={dark:'#111',light:'#fff',red:RED}[slide.theme]||'#fff';
    return ()=>fill;
  }
  function sweep(ctx,{origin=[0,H],reverse=false,cols=9,rows=5,seed=9,spread=340,duration=380,colorOf=colorFor(ctx.prevSlide),rotate=80,toward=null,ghostOut=170}={}){
    if(recorder){
      const tris=mesh(cols,rows,seed),ds=tris.map(t=>{const c=centroid(t);return Math.hypot(c[0]-origin[0],c[1]-origin[1]);}),max=Math.max(...ds),next=colorFor(ctx.slide);
      record({type:'wave',tris,base:ctx.prevSlide?themeKey(ctx.prevSlide)==='split'?'split':colorFor(ctx.prevSlide)(tris[0]):'#111',
        colors:tris.map(t=>next(t)),delays:ds.map(d=>(reverse?1-d/max:d/max)*spread),duration,turns:tris.map((t,i)=>(i%2?1:-1)*rotate)});
      return {layer:null,ghost:null};
    }
    const layer=overlay(ctx.article),tris=mesh(cols,rows,seed),polys=mosaic(layer,tris,colorOf);
    const old=ghost(layer,ctx.prev);
    if(old)A(old,[{opacity:1},{opacity:0}],{duration:ghostOut,easing:'linear',fill:'forwards'});
    const ds=tris.map(t=>{const c=centroid(t);return Math.hypot(c[0]-origin[0],c[1]-origin[1]);}),max=Math.max(...ds);
    polys.forEach((p,i)=>{
      const c=centroid(tris[i]),d=reverse?1-ds[i]/max:ds[i]/max,turn=(i%2?1:-1)*rotate;
      const end=toward?'translate('+((toward[0]-c[0])*.6).toFixed(1)+'px,'+((toward[1]-c[1])*.6).toFixed(1)+'px) rotate('+turn+'deg) scale(0)':'rotate('+turn+'deg) scale(0)';
      A(p,[{transform:'none'},{transform:end}],{duration,delay:d*spread,easing:EASE.accel,fill:'forwards'});
    });
    later(spread+duration+90,()=>discard(layer));
    return {layer,ghost:old};
  }
  function shake(el,{amount=10,duration=260}={}){
    const a=amount;
    return A(el,[{translate:'0 0'},{translate:-a+'px '+a*.45+'px'},{translate:a*.75+'px '+(-a*.6)+'px'},{translate:-a*.45+'px '+a*.3+'px'},{translate:a*.2+'px 0'},{translate:'0 0'}],{duration,easing:'linear',fill:'none'});
  }
  function rule(el,{delay=0,color=RED,duration=900}={}){
    positioned(el);
    const line=doc().createElement('span');
    line.className='mo-rule';line.style.background=color;line.setAttribute('aria-hidden','true');
    el.append(line);
    A(line,[{transform:'scaleX(0)',opacity:1},{transform:'scaleX(1)',opacity:1,offset:.55},{transform:'scaleX(1)',opacity:0}],{duration,delay,easing:EASE.out,fill:'both'}).onfinish=()=>line.remove();
  }
  // Geometric backdrop for the dark opening and closing: large facets drifting very slowly.
  const epoch={t:null};
  function backdrop(article,{seed=23,count=13,drift=true}={}){
    const field=svg('svg',{class:'mo-backdrop',viewBox:'0 0 1920 1080',preserveAspectRatio:'none','aria-hidden':'true'});
    const random=rng(seed),facets=[];
    for(let i=0;i<count;i++){
      const cx=random()*W,cy=random()*H,size=200+random()*360;
      const tri=triangle(size,random).map(([x,y])=>[cx+x,cy+y]);
      const g=svg('g',{},field);
      svg('polygon',{points:pts(tri),fill:['#131313','#141414','#161616','#171717'][i%4]},g);
      const red=svg('polygon',{points:pts(tri),fill:[DARK,'#5c1014',MID][i%3],opacity:'0'},g);
      facets.push({g,red,motion:[(random()-.5)*80,(random()-.5)*60,(random()-.5)*12,17000+random()*12000]});
    }
    article.prepend(field);
    if(drift){
      epoch.t??=performance.now();
      facets.forEach(({g,motion:[dx,dy,rot,duration]})=>{
        g.style.transformBox='fill-box';g.style.transformOrigin='center';
        const run=g.animate([{transform:'translate(0,0) rotate(0deg)'},{transform:'translate('+dx+'px,'+dy+'px) rotate('+rot+'deg)'}],{duration,iterations:Infinity,direction:'alternate',easing:'ease-in-out'});
        run.currentTime=performance.now()-epoch.t;
      });
    }
    return {field,facets};
  }
  function tint(field,indexes,{opacity=.26,duration=1400}={}){
    indexes.forEach((i,k)=>{const red=field.facets[i]?.red;if(red)A(red,[{opacity:0},{opacity}],{duration,delay:k*160,fill:'forwards',easing:'ease-in-out'});});
  }

  // The heart, rebuilt facet by facet from the conference artwork (2492 × 2054 px, measured).
  const HV={ls:[152,225],lt:[614,0],n:[998,277],rt:[1382,0],rs:[1845,225],l:[0,563],r:[1997,563],lb:[152,866],rb:[1845,866],c:[998,727],b:[998,1646]};
  const HEART=[['ls lt c',MID],['lt n c',RED],['n rt c',MID],['rt rs c',RED],['rs r rb c',MID],['ls l lb c',DARK],['lb c b',MID],['c rb b',DARK]];
  function heartOver(img){
    const field=svg('svg',{class:'mo-heart',viewBox:'0 0 2000 1648','aria-hidden':'true'});
    Object.assign(field.style,{left:img.offsetLeft+'px',top:img.offsetTop+'px',width:img.offsetWidth+'px',height:img.offsetHeight+'px',translate:img.style.translate||''});
    const facets=HEART.map(([names,fill])=>{
      const p=svg('polygon',{points:pts(names.split(' ').map(n=>HV[n])),fill,stroke:fill,'stroke-width':'3','stroke-linejoin':'round'},field);
      p.style.transformBox='fill-box';p.style.transformOrigin='center';
      return p;
    });
    img.after(field);
    return {field,facets};
  }
  function assembleHeart(img,{delay=0,seed=13}={}){
    if(!img)return;
    const {field,facets}=heartOver(img),random=rng(seed),landed=delay+1250;
    if(recorder)img.dataset.pptxSkip='1';
    facets.forEach((p,i)=>{
      const ang=random()*Math.PI*2,d=1500+random()*1300;
      A(p,[{transform:'translate('+(Math.cos(ang)*d).toFixed(0)+'px,'+(Math.sin(ang)*d).toFixed(0)+'px) rotate('+((random()-.5)*400).toFixed(0)+'deg) scale(.35)',opacity:0},{opacity:1,offset:.25},{transform:'none',opacity:1}],{duration:1000,delay:delay+i*65,easing:EASE.spring});
    });
    // The original artwork takes over, so the resting state is the brand file itself.
    if(recorder)return;
    A(img,[{opacity:0},{opacity:0,offset:landed/(landed+260)},{opacity:1}],{duration:landed+260,easing:'linear'});
    A(field,[{opacity:1},{opacity:0}],{duration:260,delay:landed,fill:'forwards'});
    later(landed+300,()=>field.remove());
  }

  // Character placement: standing at the end of the loading bar.
  function waitingMascot(ctx,width=184){
    const track=$(ctx.article,'.loading-track');
    if(!track||!global.DECK_MASCOT)return null;
    const b=box(track,ctx.article),m=global.DECK_MASCOT.create({width});
    m.el.style.left=(b.right+14-width/2).toFixed(1)+'px';
    m.el.style.top=(b.cy+1-width*1.65).toFixed(1)+'px';
    ctx.article.append(m.el);mascots.set(m.el,m);
    return m;
  }
  function closingMascot(ctx,width=232){
    if(!global.DECK_MASCOT)return null;
    const m=global.DECK_MASCOT.create({width});
    m.el.style.left=(1618-width/2)+'px';m.el.style.top=(905-width*1.65)+'px';
    ctx.article.append(m.el);mascots.set(m.el,m);
    return m;
  }

  function fridgeMascot(ctx,width=210){
    if(!global.DECK_MASCOT)return null;
    const m=global.DECK_MASCOT.create({width});
    m.el.style.left='930px';m.el.style.top=(965-width*1.65).toFixed(1)+'px';
    ctx.article.append(m.el);mascots.set(m.el,m);
    return m;
  }

  // Shared vocabulary for content slides.
  const CHROME='.brand-top,.corner-heart,.slide-footer,.deck-progress,.slide-heading,.reveal,.mo-overlay,.mo-fx,.mo-backdrop,.mo-mascot,.mo-heart,.story-clock,.mo-typing';
  const WRAPPERS='.shopping-copy,.metrics-pair,.relevance-metric,.decision-cards,.phase-line,.lessons,.onsite-points,.mechanism-line';
  function blocks(root){
    const out=[];
    for(const el of root.children){
      if(el.matches(CHROME))continue;
      if(el.matches(WRAPPERS))out.push(...blocks(el));else out.push(el);
    }
    return out;
  }
  function headingIn(article,delay=60){
    const heading=$(article,'.slide-heading');
    if(!heading)return;
    const kicker=$(heading,'.kicker');
    if(kicker)fadeUp(kicker,delay,{distance:14,duration:520});
    rise($(heading,'h1'),delay+(kicker?90:0));
  }
  function footerIn(article){A($(article,'.slide-footer'),[{opacity:0},{opacity:1}],{duration:600,delay:520});}
  function frameIn(ctx,frameEl,delay){
    A(frameEl,[{opacity:0,transform:'translateX(90px) rotate(1.5deg)'},{opacity:1,transform:'none'}],{duration:950,delay,easing:EASE.expo});
    $$(frameEl,'.product-row,.relevant-offer,.app-banner,.app-cats,.app-tile').filter(row=>!row.closest('.reveal:not(.is-visible)')).forEach((row,i)=>fadeUp(row,delay+260+i*70,{distance:14}));
  }
  function metricIn(ctx,figure,delay=0){
    const strong=$(figure,'.metric-value'),value=Number(strong?.dataset.value);
    if(!Number.isFinite(value))return;
    record({type:'ring',el:figure,delay});
    countUp(strong,value,{delay,duration:1200});
    later(delay+1120,()=>{
      const disc=$(figure,'.metric-disc');if(!disc)return;
      const b=box(disc,ctx.article),a=(-90+3.6*value)*Math.PI/180,r=b.w*146/320;
      sparkle(ctx.article,b.cx+Math.cos(a)*r,b.cy+Math.sin(a)*r,{n:5,seed:value});
    });
  }
  function defaultEnter(ctx){
    const a=ctx.article;
    headingIn(a);
    blocks(a).forEach((el,i)=>{
      const delay=240+i*90;
      if(el.matches('.shopping-frame')){if(!ctx.vtShop)frameIn(ctx,el,delay);return;}
      fadeUp(el,delay);
      if(el.matches('.metric'))metricIn(ctx,el,delay);
    });
    footerIn(a);
  }
  function defaultReveal(ctx,el,delay=0){
    const targets=getComputedStyle(el).display==='contents'?Array.from(el.children):[el];
    targets.forEach((t,i)=>fadeUp(t,delay+i*80,{distance:26,duration:620}));
    $$(el,'.metric').forEach(figure=>metricIn(ctx,figure,delay));
  }
  function progressIn(ctx){
    const bar=$(ctx.article,'.deck-progress');
    if(!bar||ctx.prevIndex==null||ctx.prevIndex>=ctx.index)return;
    A(bar,[{transform:'scaleX('+((ctx.prevIndex+1)/(ctx.index+1)).toFixed(3)+')'},{transform:'none'}],{duration:900,delay:180,easing:EASE.expo});
  }
  function phaseFill(ctx,step,animate){
    const line=$(ctx.article,'.phase-line');
    if(!line)return;
    let fill=$(line,':scope > .mo-phase-fill');
    if(!fill){fill=doc().createElement('span');fill.className='mo-phase-fill';fill.setAttribute('aria-hidden','true');line.prepend(fill);}
    const lb=box(line,ctx.article),dots=$$(line,'.phase-dot');
    const at=i=>dots[i]?Math.min(1,(box(dots[i],ctx.article).cx-lb.x)/lb.w):0;
    const target=at(Math.min(step,dots.length-1)),from=Number(fill.dataset.scale||0);
    fill.dataset.scale=String(target);fill.style.transform='scaleX('+target.toFixed(4)+')';
    if(animate&&target>from){
      A(fill,[{transform:'scaleX('+from.toFixed(4)+')'},{transform:'scaleX('+target.toFixed(4)+')'}],{duration:760,easing:EASE.inOut,delay:120});
      const dot=dots[Math.min(step,dots.length-1)];
      A(dot,[{transform:'scale(.2)'},{transform:'scale(1.45)',offset:.6},{transform:'none'}],{duration:460,delay:760,easing:EASE.out});
    }
  }
  function cursorClick(ctx,target,{delay=0,onClick}={}){
    const a=ctx.article,t=box(target,a),pointer=svg('svg',{class:'mo-cursor',viewBox:'0 0 30 44','aria-hidden':'true'});
    svg('path',{d:'M2 2L2 34L10 27L16 41L22 38L16 25L27 25Z',fill:'#151515',stroke:'#fff','stroke-width':'2','stroke-linejoin':'round'},pointer);
    a.append(pointer);
    const sx=1880,sy=1050,ex=t.cx-3,ey=t.cy-3;
    A(pointer,[{transform:'translate('+sx+'px,'+sy+'px)',opacity:0},{opacity:1,offset:.12},{transform:'translate('+((sx+ex)/2+60)+'px,'+((sy+ey)/2+50)+'px)',offset:.55},{transform:'translate('+ex+'px,'+ey+'px)',opacity:1}],{duration:720,delay,easing:EASE.inOut,fill:'both'});
    const arrow=pointer.firstChild;arrow.style.transformBox='fill-box';arrow.style.transformOrigin='0 0';
    A(arrow,[{transform:'scale(1)'},{transform:'scale(.78)'},{transform:'scale(1)'}],{duration:200,delay:delay+720,fill:'none'});
    later(delay+760,()=>{
      const layer=fxLayer(a),ring=svg('circle',{cx:t.cx,cy:t.cy,r:22,fill:'none',stroke:RED,'stroke-width':'4'},layer);
      ring.style.transformBox='fill-box';ring.style.transformOrigin='center';
      A(ring,[{transform:'scale(.3)',opacity:.9},{transform:'scale(2.6)',opacity:0}],{duration:560,fill:'both'}).onfinish=()=>ring.remove();onClick?.();
    });
    A(pointer,[{opacity:1},{opacity:0}],{duration:320,delay:delay+1500,fill:'forwards'});
    later(delay+1900,()=>pointer.remove());
  }

  // The story clock: the hand moves on from where the previous slide left it.
  function clockIn(ctx){
    const clock=$(ctx.article,'.story-clock');
    if(!clock)return;
    const minute=Number(clock.dataset.clock),before=ctx.prevSlide?.clock,delay=ctx.clockDelay??600;
    if(Number.isInteger(before)&&before<minute&&ctx.prevIndex<ctx.index){
      const run=950;
      A($(clock,'.clock-hand'),[{transform:'rotate('+before*18+'deg)'},{transform:'rotate('+minute*18+'deg)'}],{duration:run,delay,easing:EASE.inOut});
      $$(clock,'.clock-wedge').forEach(w=>{const k=Number(w.dataset.k);if(k>before)A(w,[{opacity:0},{opacity:1}],{duration:140,delay:delay+run*(k-before-.5)/(minute-before)});});
      later(delay+run,()=>A($(clock,'svg'),[{transform:'none'},{transform:'scale(1.14)',offset:.4},{transform:'none'}],{duration:340,easing:EASE.out}));
    }else A(clock,[{opacity:0,transform:'translateY(-14px) scale(.85)'},{opacity:1,transform:'none'}],{duration:700,delay,easing:EASE.back});
  }
  function quoteIn(card,delay){
    if(!card)return;
    fadeUp(card,delay,{distance:30,duration:700});
    A($(card,'.quote-mark'),[{opacity:0,transform:'scale(.3) rotate(-18deg)'},{opacity:1,transform:'scale(1.12)',offset:.6},{opacity:1,transform:'none'}],{duration:640,delay:delay+140,easing:EASE.out});
    rule(card,{delay:delay+60,color:RED,duration:1100});
  }
  // A product falls onto the slide and settles with a small squash.
  const DROP=[
    {transform:'translateY(-780px) scale(.96,1.06)',opacity:0,easing:'cubic-bezier(.5,0,.9,.55)'},
    {opacity:1,offset:.1},
    {transform:'translateY(0) scale(.96,1.06)',offset:.5,easing:'ease-out'},
    {transform:'translateY(0) scale(1.08,.88)',offset:.62,easing:'ease-out'},
    {transform:'translateY(-28px) scale(.98,1.03)',offset:.78,easing:'ease-in'},
    {transform:'translateY(0) scale(1.015,.985)',offset:.9},
    {transform:'none',opacity:1}
  ];
  const WIGGLE=[{transform:'rotate(0)'},{transform:'rotate(-16deg)',offset:.04},{transform:'rotate(11deg)',offset:.08},{transform:'rotate(-6deg)',offset:.12},{transform:'rotate(0)',offset:.16},{transform:'rotate(0)'}];
  function clickAdd(ctx,row,add,{flash}={}){
    if(!row||!add)return false;
    cursorClick(ctx,add,{delay:60});
    if(flash)A(row,flash,{duration:260,delay:820,easing:'ease-out'});
    A(add,[{transform:'scale(0)'},{transform:'scale(0)',offset:.7},{transform:'scale(1.35)',offset:.88},{transform:'none'}],{duration:1150,easing:'linear'});
    return true;
  }

  // Scenes. Anything not listed uses defaultEnter / defaultReveal.
  const SCENES={
    'prosze-czekac':{
      enter(ctx){
        const a=ctx.article;
        backdrop(a);
        const m=waitingMascot(ctx);
        A($(a,'.loader-orbit'),[{opacity:0,scale:'.2'},{opacity:1,scale:'1'}],{duration:800,easing:EASE.spring});
        splitChars($(a,'.waiting-content h1')).forEach((c,i)=>A(c,[{transform:'translateY(110%)'},{transform:'none'}],{duration:760,delay:120+i*30,easing:EASE.expo}));
        A($(a,'.loading-track'),[{transform:'scaleX(0)'},{transform:'none'}],{duration:850,delay:300,easing:EASE.expo});
        fadeUp($(a,'.loader-percent'),460,{distance:10});
        if(!m)return;
        m.assemble({delay:520,stagger:540,duration:800,distance:300});
        later(1500,()=>m.loop('blink'));
        later(1750,()=>{m.pose('watch',{duration:560});m.face('bored');});
        later(2750,()=>{m.pose('rest',{duration:420});m.loop('tap',{period:640});});
      },
      still(ctx){
        backdrop(ctx.article,{drift:ctx.ambient});
        const m=waitingMascot(ctx);
        if(m&&ctx.ambient){m.loop('blink');m.loop('breathe');}
      }
    },
    'jeszcze-chwila':{
      enter(ctx){
        const a=ctx.article,field=backdrop(a),m=waitingMascot(ctx);
        if(!ctx.viaVT)rise($(a,'.waiting-content h1'),0);
        rise($(a,'.waiting-subtitle'),120,{duration:900});
        if(!m)return;
        m.setFace('bored');m.loop('blink');m.loop('tap',{period:540});
        if(ctx.prevSlide?.layout!=='waiting')m.assemble({delay:200,stagger:400});
        later(1300,()=>{m.face('annoyed');m.loop('tap',{period:430});});
        later(2500,()=>m.pose('cross',{duration:480}));
        later(3700,()=>{m.face('furious',{duration:300});m.loop('steam',{period:1200});m.loop('hair');m.loop('tap',{period:320});tint(field,[1,6]);});
        later(4600,()=>tint(field,[3,9,12]));
        later(5000,()=>{
          m.loop('shake',{amount:1.6});m.loop('steam',{period:760});tint(field,[0,4,8,11]);
          $(a,'.loader-orbit')?.getAnimations().forEach(run=>{run.playbackRate=2.8;});
        });
        later(6050,()=>{
          const track=$(a,'.loading-track');
          A(track,[{transform:'scaleY(1)'},{transform:'scaleY(2.6)'},{transform:'scaleY(1)'}],{duration:520,iterations:Infinity,easing:'ease-in-out',fill:'none'});
          A(track,[{translate:'0 0'},{translate:'2px 0'},{translate:'-2px 0'},{translate:'0 0'}],{duration:110,iterations:Infinity,fill:'none'});
          A($(a,'.loader-percent'),[{color:'#888'},{color:RED},{color:'#888'}],{duration:520,iterations:Infinity,fill:'none'});
        });
      },
      still(ctx){
        backdrop(ctx.article,{drift:ctx.ambient});
        const m=waitingMascot(ctx);
        if(!m)return;
        m.setPose('cross');m.setFace('furious');
        if(ctx.ambient){m.loop('blink');m.loop('tap',{period:320});}
      }
    },
    'tryb-teraz':{
      custom:true,
      enter(ctx){
        const a=ctx.article,fromWait=ctx.prev&&ctx.prevSlide?.layout==='waiting';
        let from=[960,360];
        if(fromWait)from=breakthrough(ctx);
        else if(ctx.prev)sweep(ctx);
        const t0=fromWait?250:80;
        splitChars($(a,'.breakthrough-copy h1'),{open:true}).forEach((c,i)=>A(c,[
          {opacity:0,transform:'translateY(-90px) scale(1.55) rotate(-8deg)'},
          {opacity:1,transform:'translateY(10px) scale(.95)',offset:.55},
          {opacity:1,transform:'none'}
        ],{duration:640,delay:t0+i*36,easing:EASE.out}));
        typeText($(a,'.breakthrough-copy .kicker'),{delay:t0+420,speed:24,variance:.5,caret:false});
        orbitIn(ctx,from,fromWait?120:0);
      },
      reveal:{1(ctx){
        const word=$(ctx.article,'.now-word');
        if(!word)return;
        word.style.transformOrigin='24% 62%';
        A(word,[{opacity:0,transform:'scale(2.4)'},{opacity:1,transform:'scale(.94)',offset:.55},{opacity:1,transform:'none'}],{duration:440,easing:EASE.out});
        rule(word,{delay:180,color:'#fff'});
        later(240,()=>{
          shake(ctx.article,{amount:7,duration:220});
          const b=box(word,ctx.article);
          sparkle(ctx.article,b.x+40,b.y+b.h*.55,{n:7,colors:['#fff',DARK,'#ffd0cf'],reach:[70,170],seed:3});
        });
      }}
    },
    'tytul':{
      custom:true,
      enter(ctx){
        const a=ctx.article,img=$(a,'.cover-heart');
        const t0=ctx.prev?380:140;
        if(ctx.prev&&img){
          const b=box(img,a),random=rng(41);
          sweep(ctx,{origin:[b.cx,b.cy],reverse:true,cols:13,rows:7,seed:17,spread:440,duration:520,colorOf:ctx.prevSlide.theme==='red'?()=>SHADES[Math.floor(random()*3)]:colorFor(ctx.prevSlide),toward:[b.cx,b.cy],rotate:120,ghostOut:220});
        }else if(ctx.prev)sweep(ctx);
        assembleHeart(img,{delay:t0});
        fadeUp($(a,'.cover-copy .kicker'),t0+80,{distance:14});
        rise($(a,'.cover-copy h1'),t0+160,{stagger:120,duration:950});
        rise($(a,'.cover-subtitle'),t0+480,{stagger:90});
        fadeUp($(a,'.speakers'),t0+820,{distance:18,duration:700});
        footerIn(a);
      }
    },
    'cytaty':{
      enter(ctx){
        const a=ctx.article;
        headingIn(a);
        quoteIn($(a,'.quote-grid > .quote-card'),360);
        footerIn(a);
      },
      reveal:Object.fromEntries([1,2].map(step=>[step,(ctx,els)=>els.forEach(el=>quoteIn($(el,'.quote-card'),0))]))
    },
    'kiedys-teraz':{
      enter(ctx){
        const a=ctx.article,col=$(a,'.then-col'),map=$(col,'.then-map');
        fadeUp($(col,'.kicker'),80,{distance:14,duration:520});
        rise($(col,'h2'),150);
        fadeUp($(col,'.then-caption'),340,{distance:14});
        A($(a,'.then-divider'),[{transform:'scaleY(0)'},{transform:'none'}],{duration:900,delay:200,easing:EASE.expo});
        A(map,[{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'none'}],{duration:800,delay:380,easing:EASE.expo});
        $$(map,'.street').forEach((street,i)=>A(street,[{transform:street.matches('.v')?'scaleY(0)':'scaleX(0)'},{transform:'none'}],{duration:700,delay:460+i*45,easing:EASE.expo}));
        A($(map,'.map-radius'),[{opacity:0,transform:'scale(.1)'},{opacity:1,transform:'none'}],{duration:900,delay:820,easing:EASE.spring});
        $$(map,'.map-pin').forEach((pin,i)=>A(pin,[{opacity:0,transform:'translateY(-70px)'},{opacity:1,transform:'none'}],{duration:620,delay:980+i*260,easing:EASE.back}));
        $$(map,'.map-tag').forEach((tag,i)=>fadeUp(tag,1200+i*300,{distance:10,duration:460}));
        A($(map,'.route.v'),[{transform:'scaleY(0)'},{transform:'none'}],{duration:380,delay:1500,easing:EASE.inOut});
        A($(map,'.route.h'),[{transform:'scaleX(0)'},{transform:'none'}],{duration:380,delay:1860,easing:EASE.inOut});
        footerIn(a);
      },
      reveal:{
        1(ctx,els){
          els.forEach(el=>{
            const col=$(el,'.now-col');
            if(!col)return defaultReveal(ctx,el);
            fadeUp($(col,'.kicker'),0,{distance:14,duration:520});
            rise($(col,'h2'),60);
            fadeUp($(col,':scope > .then-caption'),240,{distance:14});
            const card=$(col,'.now-app');
            A(card,[{opacity:0,transform:'translateX(80px) rotate(1.2deg)'},{opacity:1,transform:'none'}],{duration:900,delay:260,easing:EASE.expo});
            $$(card,'.now-shop').forEach((shop,i)=>A(shop,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.06)',offset:.7},{opacity:1,transform:'none'}],{duration:420,delay:520+i*70,easing:EASE.out}));
          });
        },
        2(ctx,els){
          els.forEach(el=>{
            const sponsor=$(el,'.now-sponsor'),plus=$(el,'.now-plus');
            if(sponsor){
              A(sponsor,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:620,easing:EASE.snap});
              sheen(ctx,sponsor,520);
            }else if(plus){
              A(plus,[{opacity:0,transform:'translateX(-30px)'},{opacity:1,transform:'none'}],{duration:620,delay:220,easing:EASE.expo});
              later(760,()=>{const b=box(plus,ctx.article);sparkle(ctx.article,b.x+18,b.cy,{n:5,seed:11});});
            }else defaultReveal(ctx,el);
          });
        }
      }
    },
    'goscie':{
      enter(ctx){
        const a=ctx.article,card=$(a,'.notification');
        fadeUp($(a,'.message-kicker'),100,{distance:14,duration:520});
        let land=320;
        if(card&&!recorder){
          // Someone is typing: three dots, then the message lands.
          const typing=doc().createElement('div');
          typing.className='mo-typing';typing.setAttribute('aria-hidden','true');typing.innerHTML='<i></i><i></i><i></i>';
          a.append(typing);
          A(typing,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'none'}],{duration:380,delay:260,easing:EASE.back});
          $$(typing,'i').forEach((dot,i)=>A(dot,[{transform:'none',opacity:.5},{transform:'translateY(-12px)',opacity:1,offset:.3},{transform:'none',opacity:.5,offset:.6},{transform:'none',opacity:.5}],{duration:720,delay:420+i*130,iterations:3,fill:'none'}));
          A(typing,[{opacity:1},{opacity:0,transform:'scale(.85)'}],{duration:200,delay:2300,fill:'forwards'});
          later(2520,()=>typing.remove());
          land=2400;
        }
        A(card,[{opacity:0,transform:'translateY(36px) scale(.94)'},{opacity:1,transform:'translateY(-6px) scale(1.01)',offset:.65},{opacity:1,transform:'none'}],{duration:640,delay:land,easing:EASE.out});
        later(land+700,()=>shake(card,{amount:5,duration:280}));
        ctx.clockDelay=land+900;
        footerIn(a);
      },
      reveal:{1(ctx,els){els.forEach(el=>rise($(el,'.message-twist')||el,0,{duration:760}));}}
    },
    'lodowka':{
      enter(ctx){
        const a=ctx.article,fridge=$(a,'.fridge');
        headingIn(a);
        A(fridge,[{opacity:0,transform:'translateX(90px)'},{opacity:1,transform:'none'}],{duration:850,delay:120,easing:EASE.expo});
        A($(fridge,'.fridge-door'),[{transform:'scaleX(.04)'},{transform:'scaleX(1.05)',offset:.75},{transform:'none'}],{duration:900,delay:620,easing:EASE.out});
        // The inside light flickers on as the door opens.
        A($(fridge,'.fridge-inside'),[{opacity:.12},{opacity:.12,offset:.3},{opacity:1,offset:.42},{opacity:.35,offset:.52},{opacity:1,offset:.66},{opacity:1}],{duration:1100,delay:620,easing:'linear'});
        A($(fridge,'.fridge-glow'),[{opacity:0},{opacity:1}],{duration:900,delay:1000});
        $$(fridge,'.fridge-item').forEach((item,i)=>fadeUp(item,1250+i*120,{distance:12,duration:500}));
        const m=fridgeMascot(ctx);
        if(m){
          m.assemble({delay:900,stagger:420,duration:700,distance:240});
          later(1900,()=>m.loop('blink'));
          later(2100,()=>{m.pose('watch',{duration:520});m.face('annoyed');});
          later(3200,()=>m.loop('tap',{period:560}));
        }
        footerIn(a);
      },
      still(ctx){
        const m=fridgeMascot(ctx);
        if(!m)return;
        m.setPose('watch');m.setFace('annoyed');
        if(ctx.ambient)m.loop('blink');
      }
    },
    'dwa-plany':{
      enter(ctx){
        const a=ctx.article,brand=$(a,'.world-brand'),consumer=$(a,'.world-consumer');
        A(brand,[{opacity:0,transform:'translateX(-80px)'},{opacity:1,transform:'none'}],{duration:850,delay:140,easing:EASE.expo});
        A(consumer,[{opacity:0,transform:'translateX(80px)'},{opacity:1,transform:'none'}],{duration:850,delay:240,easing:EASE.expo});
        rise($(brand,'h1'),220);rise($(consumer,'h1'),320);
        $$(brand,'.brand-goals p').forEach((p,i)=>fadeUp(p,440+i*80,{distance:18}));
        fadeUp($(brand,'.world-quote'),780,{distance:12});
        footerIn(a);
      },
      reveal:{2(ctx,els){
        els.forEach(el=>{
          const bridge=$(el,'.world-bridge');
          if(!bridge)return defaultReveal(ctx,el);
          A(bridge,[{clipPath:'inset(0 50% 0 50%)'},{clipPath:'inset(0 0% 0 0%)'}],{duration:660,easing:EASE.snap});
          fadeUp($(bridge,'h2'),260,{distance:12});
          A($(bridge,'.bridge-icon'),[{transform:'scale(.2)',opacity:0},{transform:'scale(1.4)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:540,delay:300,easing:EASE.out});
        });
      }}
    },
    'potrzeba-teraz':{
      enter(ctx){
        const a=ctx.article,pack=$(a,'.choc-pack');
        headingIn(a);
        fadeUp($(a,'.scenario-question'),380);
        if(pack){
          pack.style.transformOrigin='50% 100%';
          A(pack,DROP,{duration:1150,delay:260,easing:'linear'});
          A($(a,'.choc-shadow'),[{opacity:0,transform:'scale(.3)'},{opacity:.5,transform:'scale(.6)',offset:.5},{opacity:1,transform:'scale(1.12)',offset:.62},{transform:'none',opacity:1}],{duration:1150,delay:260,easing:'linear'});
          $$(a,'.choc-piece').forEach((piece,i)=>A(piece,[{opacity:0,transform:'translateY(-50px) scale(.5) rotate(-30deg)'},{opacity:1,transform:'translateY(6px) scale(1.05)',offset:.7},{opacity:1,transform:'none'}],{duration:540,delay:1000+i*130,easing:EASE.out}));
          A($(a,'.choc-brand'),WIGGLE,{duration:3800,delay:1700,iterations:Infinity,fill:'none'});
        }
        footerIn(a);
      }
    },
    'tryb-sytuacyjny':{
      enter(ctx){
        const a=ctx.article;
        headingIn(a);
        fadeUp($(a,'.mechanism-line > p'),380);
        footerIn(a);
      },
      reveal:{
        1(ctx,els){
          els.forEach(el=>{
            const plus=$(el,'.mechanism-plus');
            A(plus,[{opacity:0,transform:'rotate(-180deg) scale(.2)'},{opacity:1,transform:'none'}],{duration:640,easing:EASE.back});
            fadeUp($(el,'p'),140);
          });
        },
        2(ctx,els){
          els.forEach(el=>{
            const result=$(el,'.mode-result')||el;
            A(result,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:620,easing:EASE.snap});
            later(560,()=>{const b=box(result,ctx.article);sparkle(ctx.article,b.x+20,b.y+4,{n:5,seed:7});});
          });
        }
      }
    },
    'decyzja-sie-domyka':{
      enter(ctx){defaultEnter(ctx);phaseFill(ctx,ctx.step,true);},
      still(ctx){phaseFill(ctx,ctx.step,false);},
      sync(ctx,step,animate){phaseFill(ctx,step,animate);}
    },
    'otwieram-aplikacje':{
      enter(ctx){defaultEnter(ctx);sheen(ctx,$(ctx.article,'.app-banner'),ctx.vtShop?700:1300);},
      reveal:{1(ctx,els){
        const banner=$(ctx.article,'.app-banner'),cta=$(banner,'.banner-cta');
        if(cta)cursorClick(ctx,cta,{delay:60,onClick:()=>A(banner,[{transform:'none'},{transform:'scale(.97)',offset:.4},{transform:'none'}],{duration:320,easing:EASE.out})});
        els.forEach(el=>defaultReveal(ctx,el,cta?900:0));
      }}
    },
    'szukam-przekasek':{
      enter(ctx){
        defaultEnter(ctx);
        typeText($(ctx.article,'.type-query'),{delay:ctx.vtShop?360:900,speed:72});
      },
      reveal:{1(ctx,els){
        els.forEach(el=>{
          if(!el.matches('.shop-results'))return defaultReveal(ctx,el,260);
          Array.from(el.children).forEach((row,i)=>fadeUp(row,i*90,{distance:16,duration:560}));
          sheen(ctx,$(el,'.relevant-offer'),520);
        });
      }}
    },
    'wybieram':{
      reveal:{1(ctx,els){
        const tile=$(ctx.article,'.app-grid .selected');
        clickAdd(ctx,tile,$(tile,'.product-add'),{flash:[{outlineColor:'rgba(238,49,47,0)'},{outlineColor:'rgba(238,49,47,1)'}]});
        els.forEach(el=>defaultReveal(ctx,el,$(el,'.selection-feedback')?980:1250));
      }}
    },
    'koszyk':{
      enter(ctx){
        defaultEnter(ctx);
        const a=ctx.article,start=ctx.vtShop?240:520;
        $$(a,'.app-cart > .shop-body > .product-row').forEach((row,i)=>A(row,[{opacity:0,transform:'translateY(-110px) scale(.86) rotate(-4deg)'},{opacity:1,transform:'translateY(6px) scale(1.02) rotate(1deg)',offset:.7},{opacity:1,transform:'none'}],{duration:720,delay:start+i*140,easing:'cubic-bezier(.3,0,.3,1)'}));
        A($(a,'.shop-cart-icon'),[{transform:'none'},{transform:'scale(1.55) rotate(-12deg)',offset:.4},{transform:'scale(.9)',offset:.7},{transform:'none'}],{duration:520,delay:start+600});
        const suggestion=$(a,'.cart-suggestion');
        fadeUp(suggestion,start+700,{distance:18});
        sheen(ctx,suggestion,start+1300);
      },
      reveal:{1(ctx,els){
        const suggestion=$(ctx.article,'.cart-suggestion');
        clickAdd(ctx,suggestion,$(suggestion,'.product-add'),{flash:[{backgroundColor:'#faf6f0'},{backgroundColor:'#fdecec'}]});
        els.forEach(el=>defaultReveal(ctx,el,1250));
      }}
    },
    'wnioski':{
      reveal:Object.fromEntries([1,2,3].map(step=>[step,(ctx,els)=>els.forEach(el=>{
        const lesson=$(el,'.lesson');
        if(!lesson)return defaultReveal(ctx,el);
        rule(lesson,{color:RED,duration:1300});
        A($(lesson,':scope > span'),[{opacity:0,transform:'translateX(-36px)'},{opacity:1,transform:'none'}],{duration:620,delay:120,easing:EASE.expo});
        fadeUp($(lesson,'h2'),200,{distance:20});
      })]))
    },
    'stol':{
      enter(ctx){
        const a=ctx.article,art=$(a,'.table-art'),random=rng(27);
        headingIn(a);
        A($(art,'.table-top'),[{opacity:0,transform:'translateY(140px)'},{opacity:1,transform:'none'}],{duration:950,delay:200,easing:EASE.expo});
        $$(art,'.table-item').forEach((g,i)=>A(g,[{opacity:0,transform:'translateY(-240px)'},{opacity:1,transform:'translateY(10px)',offset:.72},{opacity:1,transform:'none'}],{duration:720,delay:620+i*150,easing:'cubic-bezier(.3,0,.3,1)'}));
        // Nachos land facet by facet, like the conference heart.
        $$(art,'.nacho').forEach((p,i)=>{
          p.style.transformBox='fill-box';p.style.transformOrigin='center';
          const ang=random()*Math.PI*2,d=500+random()*500;
          A(p,[{transform:'translate('+(Math.cos(ang)*d).toFixed(0)+'px,'+(Math.sin(ang)*d-300).toFixed(0)+'px) rotate('+((random()-.5)*540).toFixed(0)+'deg) scale(.4)',opacity:0},{opacity:1,offset:.3},{transform:'none',opacity:1}],{duration:1000,delay:1150+i*70,easing:EASE.spring});
        });
        footerIn(a);
      },
      reveal:{1(ctx,els){
        els.forEach(el=>{
          const slogan=$(el,'.table-slogan')||el;
          rise(slogan,0,{stagger:130,duration:900});
          later(900,()=>{const b=box(slogan,ctx.article);sparkle(ctx.article,b.right-30,b.y+30,{n:7,seed:5,reach:[60,150]});});
        });
      }}
    },
    'potrzeba-zalatwiona':{
      enter(ctx){
        const a=ctx.article;
        backdrop(a);
        const meter=$(a,'.closing-meter'),m=closingMascot(ctx);
        rise($(a,'.closing-content h1'),420,{stagger:110,duration:950});
        footerIn(a);
        const snap=meter?finale(ctx,meter):2400;
        if(!m)return;
        m.assemble({delay:500,stagger:520,distance:320});
        later(1500,()=>m.loop('blink'));
        later(1650,()=>{m.pose('watch',{duration:520});m.face('annoyed');});
        later(snap,()=>{m.face('happy',{duration:160});m.pose('crouch',{duration:110});});
        later(snap+110,()=>m.pose('jump',{duration:260}));
        later(snap+370,()=>m.pose('up',{duration:300,easing:'cubic-bezier(.5,0,.8,.4)'}));
        later(snap+980,()=>m.pose('thumb',{duration:480}));
        later(snap+1600,()=>m.loop('breathe'));
      },
      still(ctx){
        backdrop(ctx.article,{drift:ctx.ambient});
        const m=closingMascot(ctx);
        if(!m)return;
        m.setPose('thumb');m.setFace('happy');
        if(ctx.ambient){m.loop('blink');m.loop('breathe');}
      }
    }
  };
  function sheen(ctx,target,delay){
    if(!target||recorder)return;
    target.classList.add('mo-sheen-host');
    const light=doc().createElement('span');light.className='mo-sheen';light.setAttribute('aria-hidden','true');
    target.append(light);
    A(light,[{transform:'translateX(-120%)'},{transform:'translateX(320%)'}],{duration:1000,delay,easing:EASE.inOut,fill:'both'}).onfinish=()=>light.remove();
  }
  function orbitIn(ctx,from,delay){
    const wrap=$(ctx.article,'.orbit-fragments');
    if(!wrap)return;
    const b=box(wrap,ctx.article),dx=from[0]-b.cx,dy=from[1]-b.cy;
    $$(wrap,'i').forEach((fragment,i)=>{
      const style=getComputedStyle(fragment),turn=(parseFloat(style.rotate)||0)*Math.PI/180;
      const fx=style.getPropertyValue('--fx').trim()||'40px',fy=style.getPropertyValue('--fy').trim()||'40px';
      const lx=dx*Math.cos(turn)+dy*Math.sin(turn),ly=-dx*Math.sin(turn)+dy*Math.cos(turn);
      A(fragment,[{transform:'translate('+lx.toFixed(1)+'px,'+ly.toFixed(1)+'px) scale(.15)',opacity:0},{opacity:1,offset:.25},{transform:'translate('+fx+','+fy+') scale(1)',opacity:.65}],{duration:1050,delay:delay+i*75,easing:EASE.expo});
    });
    A(wrap,[{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:150000,delay:delay+900,iterations:Infinity,easing:'linear',fill:'none'});
  }
  // 99% → 100%: the opening's loader finally completes.
  function breakthrough(ctx){
    const a=ctx.article,layer=overlay(a),random=rng(31);
    const tris=mesh(16,9,31,.38),polys=recorder?[]:mosaic(layer,tris,()=>'#111');
    const old=ghost(layer,ctx.prev);
    const track=$(old,'.loading-track'),orbit=$(old,'.loader-orbit');
    const tb=track?box(track,a):{x:610,y:700,w:700,h:5,cx:960,cy:702,right:1310};
    const ob=orbit?box(orbit,a):{x:923,y:322,w:74,h:74,cx:960,cy:359};
    const impact=[tb.right,tb.cy];
    A($(old,'.mo-backdrop'),[{opacity:1},{opacity:0}],{duration:280,fill:'forwards'});
    $$(old,'.waiting-content h1,.waiting-subtitle').forEach((t,i)=>A(t,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-34px) scale(1.12)'}],{duration:300,delay:30+i*40,fill:'forwards',easing:EASE.accel}));
    $$(old,'.loading-track,.loader-orbit,.loader-percent').forEach(el=>{el.style.visibility='hidden';});
    const sparks=fxLayer(layer);
    shards(sparks,{x:tb.x,y:tb.y-6,w:tb.w,h:tb.h+12},{n:30,from:impact,seed:4});
    shards(sparks,ob,{n:14,from:[ob.cx,ob.cy],seed:8,reach:[120,360]});
    const m=mascots.get($(old,'.mo-mascot'));
    if(m){
      m.cancel();m.setFace('furious');m.setPose('cross');
      m.pose('crouch',{duration:90});
      later(90,()=>{m.pose('jump',{duration:200});m.shatter({distance:540,duration:900});});
    }
    const ds=tris.map(t=>{const c=centroid(t);return Math.hypot(c[0]-impact[0],c[1]-impact[1]);}),max=Math.max(...ds);
    if(recorder){
      const flash=[],turns=[];
      tris.forEach((t,i)=>{flash.push(SHADES[Math.floor(random()*3)]);turns.push((i%2?1:-1)*(50+random()*80));});
      record({type:'wave',tris,base:'#111',colors:tris.map(()=>RED),flash,delays:ds.map(d=>40+d/max*470),duration:600,turns});
    }
    polys.forEach((p,i)=>{
      const shade=SHADES[Math.floor(random()*3)],turn=(i%2?1:-1)*(50+random()*80);
      A(p,[{transform:'none',fill:'#111',stroke:'#111'},{transform:'none',fill:shade,stroke:shade,offset:.22,easing:EASE.accel},{transform:'rotate('+turn.toFixed(0)+'deg) scale(0)',fill:shade,stroke:shade}],{duration:600,delay:40+ds[i]/max*470,easing:'linear',fill:'forwards'});
    });
    shake(a,{amount:16,duration:320});
    later(1250,()=>discard(layer));
    return [ob.cx,ob.cy];
  }
  function finale(ctx,meter){
    const a=ctx.article,value=$(meter,':scope > span');
    positioned(meter);
    const ring=svg('svg',{class:'mo-meter',viewBox:'0 0 540 540','aria-hidden':'true'});
    svg('circle',{cx:270,cy:270,r:261,fill:'none',stroke:'#262626','stroke-width':18},ring);
    const arc=svg('circle',{cx:270,cy:270,r:261,fill:'none',stroke:RED,'stroke-width':18,pathLength:100,transform:'rotate(-90 270 270)','stroke-dasharray':'0 100'},ring);
    meter.prepend(ring);
    const fillAt=300,stall=1700,snap=fillAt+1300+stall-500;
    A(meter,[{borderColor:'rgba(238,49,47,0)'},{borderColor:'rgba(238,49,47,0)'}],{duration:snap+200,easing:'linear'});
    A(arc,[{strokeDasharray:'0 100'},{strokeDasharray:'99 100'}],{duration:1300,delay:fillAt,easing:EASE.expo,fill:'forwards'});
    countUp(value,99,{delay:fillAt,duration:1300});
    later(fillAt+1350,()=>{
      A(meter,[{translate:'0 0'},{translate:'2px -1px'},{translate:'-2px 1px'},{translate:'1px 1px'},{translate:'0 0'}],{duration:130,iterations:Math.round((stall-500)/130),fill:'none'});
    });
    record({type:'snap',el:value,delay:snap});
    later(snap,()=>{
      const text=Array.from(value?.childNodes||[]).find(n=>n.nodeType===3);
      if(text)text.textContent='100';
      A(arc,[{strokeDasharray:'99 100'},{strokeDasharray:'100 0'}],{duration:200,easing:EASE.out,fill:'forwards'});
      A(meter,[{transform:'scale(1)'},{transform:'scale(1.08)',offset:.35},{transform:'none'}],{duration:640,easing:EASE.out,fill:'none'});
      const b=box(meter,a);
      confetti(a,b.cx,b.cy-40);
      sparkle(a,b.cx,b.y+10,{n:6,seed:2,reach:[60,160]});
    });
    later(snap+700,()=>ring.remove());
    return snap;
  }

  function transitionFor(prev,next){
    if(!prev||!next||prev.id===next.id)return {type:'none'};
    if(SCENES[next.id]?.custom)return {type:next.id==='tryb-teraz'&&prev.layout==='waiting'?'breakthrough':'wave',custom:true};
    return {type:themeKey(prev)!==themeKey(next)?'wave':'morph'};
  }
  function enter(slide,article,{play=false,source='jump',previous=null,index=0}={}){
    stop();
    const root=doc().documentElement,reduce=root.dataset.motion==='reduce',editing=doc().body.classList.contains('editing-text');
    const slides=global.HOMO_DECK?.slides||[],prevIndex=previous?Number(previous.dataset.slideIndex):null,prevSlide=Number.isInteger(prevIndex)?slides[prevIndex]:null;
    // While exporting, a Morph slide in PowerPoint stands in for the browser's View Transition.
    const morph=Boolean(recorder)&&prevSlide&&transitionFor(prevSlide,slide).type==='morph';
    const ctx={slide,article,index,source,play,ambient:!reduce&&!editing,step:Number(article.dataset.revealIndex)||0,
      prev:play&&prevSlide&&prevSlide.id!==slide.id&&!previous.isConnected?previous:null,prevSlide,prevIndex,
      viaVT:root.classList.contains('mo-vt')||morph,vtShop:root.classList.contains('mo-vt-shop')||morph&&/shopping/.test(prevSlide.layout)&&/shopping/.test(slide.layout),capture:Boolean(recorder)};
    current=ctx;
    const scene=SCENES[slide.id]||{};
    if(!play)scene.still?.(ctx);
    else{
      const link=transitionFor(prevSlide,slide);
      if(ctx.prev&&!link.custom&&link.type==='wave'){sweep(ctx);progressIn(ctx);}
      (scene.enter||defaultEnter)(ctx);
      clockIn(ctx);
    }
    // Loops on a slide that left the screen would keep ticking; the ghost keeps its own until removed.
    if(previous&&!previous.isConnected)previous.getAnimations?.({subtree:true}).forEach(run=>run.cancel());
  }
  function reveal(slide,article,step,previousStep){
    const ctx=current;
    if(!ctx||ctx.article!==article||ctx.slide.id!==slide.id||step===previousStep)return;
    ctx.step=step;
    const scene=SCENES[slide.id]||{};
    if(step<previousStep||!ctx.ambient){
      $$(article,'[data-reveal]').forEach(el=>{if(Number(el.dataset.reveal)>step)el.getAnimations({subtree:true}).forEach(run=>run.cancel());});
      scene.sync?.(ctx,step,false);
      return;
    }
    scene.sync?.(ctx,step,true);
    for(let s=previousStep+1;s<=step;s++){
      const els=$$(article,'[data-reveal="'+s+'"]');
      if(scene.reveal?.[s])scene.reveal[s](ctx,els);
      else els.forEach(el=>defaultReveal(ctx,el));
    }
  }
  function useViewTransition(previous,next,source){
    const root=doc().documentElement;
    root.classList.remove('mo-vt','mo-vt-loader','mo-vt-shop');
    if(source!=='next'||!doc().startViewTransition||transitionFor(previous,next).type!=='morph')return false;
    // A cut still in progress holds a copy of the previous slide; shared names must stay unique.
    doc().querySelectorAll('.mo-overlay').forEach(discard);
    root.classList.add('mo-vt');
    root.classList.toggle('mo-vt-loader',previous.layout==='waiting'&&next.layout==='waiting');
    root.classList.toggle('mo-vt-shop',/shopping/.test(previous.layout)&&/shopping/.test(next.layout));
    return true;
  }
  function endViewTransition(){doc().documentElement.classList.remove('mo-vt','mo-vt-loader','mo-vt-shop');}
  function setHidden(hidden){
    const scripted=run=>!(global.CSSAnimation&&run instanceof global.CSSAnimation)&&!(global.CSSTransition&&run instanceof global.CSSTransition);
    if(hidden)doc().getAnimations().forEach(run=>{if(run.playState==='running'&&scripted(run)){run.pause();pausedWhileHidden.add(run);}});
    else{pausedWhileHidden.forEach(run=>{if(run.playState==='paused')run.play();});pausedWhileHidden.clear();}
  }
  global.DECK_MOTION={enter,reveal,stop,loaderValue,useViewTransition,endViewTransition,setHidden,transitionFor,easing:{bezier,spring},
    record:target=>{recorder=target;},loaderPoints:LOADER,
    geometry:{mesh,rng,triangle,heartVertices:HV,heartFacets:HEART,shades:SHADES}};
})(typeof window==='undefined'?globalThis:window);
