/* Exports the deck to an editable PowerPoint file (.pptx) with native animations.
 * Each slide is replayed with its real choreography on a virtual clock. The exporter measures every
 * shape, samples where it is over time and rewrites that motion as PowerPoint effects, so the HTML
 * stays the single source of truth for content and movement.
 */
(function(){
  const W=1920,H=1080,STEP=1000/30,OFF=2400,LOOP_CAP=6000,SYMBOL_FONT='Segoe UI Symbol',EMOJI_FONT='Segoe UI Emoji';
  const realTimeout=window.setTimeout.bind(window);
  const breathe=()=>new Promise(resolve=>realTimeout(resolve,0));
  const SKIP='.mo-caret,.mo-sheen,[data-pptx-skip]';
  const fmt=v=>(Math.round(v*1e5)/1e5).toString();
  const offset=(attr,v,size)=>{const d=fmt(Math.abs(v)/size);return '#'+attr+(v<0&&d!=='0'?'-':'+')+d;};

  // ---- CSS parsing ---------------------------------------------------------------------------
  function splitTop(text){
    const out=[];let depth=0,cur='';
    for(const ch of text){if(ch==='(')depth++;if(ch===')')depth--;if(ch===','&&!depth){out.push(cur.trim());cur='';}else cur+=ch;}
    if(cur.trim())out.push(cur.trim());
    return out;
  }
  function color(value){
    const m=/rgba?\(([^)]+)\)/.exec(value||'');
    if(!m)return {hex:'000000',a:0};
    const p=m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return {hex:p.slice(0,3).map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''),a:p.length>3?p[3]:1};
  }
  function gradient(value){
    const m=/linear-gradient\((.*)\)\s*$/.exec(value||'');
    if(!m)return null;
    const parts=splitTop(m[1]);let angle=180;
    if(/deg\s*$/.test(parts[0]))angle=parseFloat(parts.shift());
    else if(/^to\s/.test(parts[0]))angle={'to top':0,'to right':90,'to bottom':180,'to left':270}[parts.shift().replace(/\s+/g,' ')]??180;
    const stops=parts.map(p=>{const c=color(/rgba?\([^)]*\)/.exec(p)?.[0]);const pos=/([\d.]+)%\s*$/.exec(p);return {color:c.hex,alpha:c.a,pos:pos?parseFloat(pos[1])/100:null};});
    if(stops.length<2)return null;
    stops[0].pos??=0;stops.at(-1).pos??=1;
    for(let i=1;i<stops.length-1;i++)if(stops[i].pos==null){let j=i;while(stops[j].pos==null)j++;for(let k=i;k<j;k++)stops[k].pos=stops[i-1].pos+(stops[j].pos-stops[i-1].pos)*(k-i+1)/(j-i+1);}
    return {angle:((angle-90)%360+360)%360,stops};
  }
  function shadow(value){
    if(!value||value==='none')return null;
    const first=splitTop(value)[0];
    if(/inset/.test(first))return null;
    const c=color(/rgba?\([^)]*\)/.exec(first)?.[0]);
    const [x=0,y=0,blur=0]=first.replace(/rgba?\([^)]*\)/,'').trim().split(/\s+/).map(parseFloat);
    return c.a>0?{color:c.hex,alpha:c.a,blur,dist:Math.hypot(x,y),dir:(Math.atan2(y,x)*180/Math.PI+360)%360}:null;
  }
  const number=(v,fallback=0)=>{const n=parseFloat(v);return Number.isFinite(n)?n:fallback;};
  function parsePoints(value){
    const n=String(value||'').trim().split(/[\s,]+/).map(parseFloat),out=[];
    for(let i=0;i+1<n.length;i+=2)out.push([n[i],n[i+1]]);
    return out;
  }
  function parsePath(value){
    const d=String(value||'').replace(/^path\(["']?|["']?\)$/g,''),out=[];
    for(const m of d.matchAll(/[ML]\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/gi))out.push([parseFloat(m[1]),parseFloat(m[2])]);
    return out;
  }
  function radii(cs,w,h){
    const v=k=>{const s=cs[k]||'0';return s.endsWith('%')?parseFloat(s)/100*Math.min(w,h):number(s);};
    return [v('borderTopLeftRadius'),v('borderTopRightRadius'),v('borderBottomRightRadius'),v('borderBottomLeftRadius')];
  }
  function geometry(r,w,h,clipTop=0){
    if(clipTop){r=[Math.max(r[0],clipTop),Math.max(r[1],clipTop),r[2],r[3]];}
    const min=Math.max(1,Math.min(w,h)),cap=v=>Math.min(50000,v/min*100000);
    if(Math.max(...r)<.5)return {geom:'rect'};
    if(r.every(x=>x>=min/2-.5)&&Math.abs(w-h)<1)return {geom:'ellipse'};
    if(r.every(x=>Math.abs(x-r[0])<.5))return {geom:'roundRect',adj:{adj:cap(r[0])}};
    if(Math.abs(r[0]-r[1])<.5&&Math.abs(r[2]-r[3])<.5)return {geom:'round2SameRect',adj:{adj1:cap(r[0]),adj2:cap(r[2])}};
    return {geom:'roundRect',adj:{adj:cap(Math.max(...r))}};
  }

  // ---- Fonts: which characters Lato can draw ------------------------------------------------
  function coverage(ttf){
    const dv=new DataView(ttf.buffer,ttf.byteOffset,ttf.byteLength),set=new Set();
    let cmap=0;
    for(let i=0,n=dv.getUint16(4);i<n;i++){const o=12+16*i;if(String.fromCharCode(ttf[o],ttf[o+1],ttf[o+2],ttf[o+3])==='cmap')cmap=dv.getUint32(o+8);}
    for(let i=0,n=dv.getUint16(cmap+2);i<n;i++){
      const r=cmap+4+8*i,platform=dv.getUint16(r),table=cmap+dv.getUint32(r+4),format=dv.getUint16(table);
      if(platform===3&&format===4){
        const segs=dv.getUint16(table+6)/2,ends=table+14,starts=ends+segs*2+2;
        for(let s=0;s<segs;s++){const end=dv.getUint16(ends+2*s),start=dv.getUint16(starts+2*s);for(let c=start;c<=end&&c<0xFFFF;c++)set.add(c);}
      }
    }
    return set;
  }

  // ---- Capture: virtual clock, recorded animations, DOM history ------------------------------
  // simple: the Google Slides target, whose scenes keep their reduced, export-only choreography.
  function createSession(stage,{simple=false}={}){
    const clock={now:0,seq:0,queue:[]},saved={};
    let group=0,sampling=false,state=null,observer=null,cursor=0;
    const css=document.createElement('style');
    css.textContent='.pptx-capture *{transition:none!important;animation-play-state:paused!important}';
    const setAttr=(el,name,value)=>value==null?el.removeAttribute(name):el.setAttribute(name,value);
    function born(node,at){
      if(!state.born.has(node))state.born.set(node,at);
      for(const n of node.querySelectorAll('*'))if(!state.born.has(n))state.born.set(n,at);
    }
    function stamp(){
      if(!observer)return;
      for(const m of observer.takeRecords()){
        if(m.type==='attributes')state.attrs.push({el:m.target,name:m.attributeName,old:m.oldValue,next:m.target.getAttribute(m.attributeName),at:clock.now});
        else m.addedNodes.forEach(node=>{if(node.nodeType===1)born(node,clock.now);});
      }
    }
    return {
      install(){
        Object.assign(saved,{setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,raf:window.requestAnimationFrame,caf:window.cancelAnimationFrame,animate:Element.prototype.animate,remove:Element.prototype.remove,cancel:Animation.prototype.cancel});
        window.setTimeout=(fn,ms,...args)=>{const id=++clock.seq;clock.queue.push({id,at:clock.now+Math.max(0,Number(ms)||0),fn:()=>{if(typeof fn==='function')fn(...args);}});return id;};
        window.clearTimeout=id=>{const i=clock.queue.findIndex(q=>q.id===id);if(i>=0)clock.queue.splice(i,1);};
        window.requestAnimationFrame=fn=>{const id=++clock.seq;clock.queue.push({id,at:clock.now+STEP/2,fn:()=>fn(clock.now)});return id;};
        window.cancelAnimationFrame=window.clearTimeout;
        Element.prototype.animate=function(keyframes,options){
          const anim=saved.animate.call(this,keyframes,options);
          if(sampling||!state)return anim;
          anim.pause();anim.currentTime=0;anim.finished.catch(()=>{});
          const rec={anim,el:this,start:clock.now,group,timing:anim.effect.getTiming(),keyframes:Array.isArray(keyframes)?keyframes:[],canceledAt:null};
          state.records.push(rec);state.byAnim.set(anim,rec);
          return anim;
        };
        Element.prototype.remove=function(){if(state&&!sampling){if(!state.removed.has(this))state.removed.set(this,clock.now);}else saved.remove.call(this);};
        Animation.prototype.cancel=function(){const rec=state?.byAnim.get(this);if(rec&&!sampling&&rec.canceledAt==null)rec.canceledAt=clock.now;this.finished.catch(()=>{});return saved.cancel.call(this);};
        window.DECK_MOTION.record({now:()=>clock.now,event:e=>state?.events.push({...e,group}),simple});
        document.head.append(css);document.documentElement.classList.add('pptx-capture');
      },
      uninstall(){
        if(!saved.animate)return;
        window.setTimeout=saved.setTimeout;window.clearTimeout=saved.clearTimeout;window.requestAnimationFrame=saved.raf;window.cancelAnimationFrame=saved.caf;
        Element.prototype.animate=saved.animate;Element.prototype.remove=saved.remove;Animation.prototype.cancel=saved.cancel;
        window.DECK_MOTION.record(null);css.remove();document.documentElement.classList.remove('pptx-capture');
        saved.animate=null;
      },
      begin(){
        state={records:[],byAnim:new Map(),events:[],attrs:[],born:new Map(),removed:new Map(),lastTimer:[0]};
        clock.queue.length=0;clock.now=0;group=0;
        observer=new MutationObserver(()=>{});
        observer.observe(stage,{subtree:true,childList:true,attributes:true,attributeOldValue:true,attributeFilter:['class','style','data-reveal-index']});
        return state;
      },
      setGroup(g,at){group=g;clock.now=at;state.lastTimer[g]=at;},
      run(){
        stamp();
        for(let guard=0;clock.queue.length&&guard<200000;guard++){
          let best=0;
          for(let i=1;i<clock.queue.length;i++){const a=clock.queue[i],b=clock.queue[best];if(a.at<b.at||(a.at===b.at&&a.id<b.id))best=i;}
          const next=clock.queue.splice(best,1)[0];
          if(next.at-clock.now>60000)continue;
          clock.now=Math.max(clock.now,next.at);
          try{next.fn();}catch(error){console.warn('PPTX: scene error',error);}
          stamp();state.lastTimer[group]=Math.max(state.lastTimer[group]||0,clock.now);
        }
      },
      end(){stamp();observer.disconnect();observer=null;cursor=state.attrs.length;},
      setTime(t){
        sampling=true;
        const a=state.attrs;
        while(cursor>0&&a[cursor-1].at>t){const m=a[--cursor];setAttr(m.el,m.name,m.old);}
        while(cursor<a.length&&a[cursor].at<=t){const m=a[cursor++];setAttr(m.el,m.name,m.next);}
        for(const r of state.records){
          if(t<r.start||t>=(r.canceledAt??Infinity)){if(r.anim.playState!=='idle'){r.anim.finished.catch(()=>{});r.anim.cancel();}continue;}
          if(r.anim.playState==='idle')r.anim.pause();
          r.anim.currentTime=t-r.start;
        }
        sampling=false;
      }
    };
  }
  const recordEnd=r=>{const t=r.timing;return t.iterations===Infinity?Infinity:r.start+(t.delay||0)+(Number(t.duration)||0)*(t.iterations??1)+(t.endDelay||0);};
  function groupEnd(state,g,start,slide){
    let end=Math.max(start,state.lastTimer[g]||0);
    for(const r of state.records)if(r.group===g&&recordEnd(r)<Infinity)end=Math.max(end,recordEnd(r));
    for(const e of state.events){
      if(e.group!==g)continue;
      const lines=e.type==='lines'?Math.max(1,e.el.querySelectorAll('.mo-line').length):1;
      end=Math.max(end,e.at+(e.duration||0)+(e.stagger||0)*(lines-1)+(e.type==='ring'?1200:0)+(e.type==='wave'?Math.max(...e.delays)+e.duration:0));
    }
    if(g===0&&slide.loader)end=Math.max(end,slide.loader.duration);
    return end+STEP;
  }

  // ---- Geometry of rendered elements --------------------------------------------------------
  const frameOf=article=>{const r=article.getBoundingClientRect();return {article,left:r.left,top:r.top,k:r.width/W||1};};
  function rotation(value){
    if(!value||value==='none')return 0;
    const last=value.trim().split(/\s+/).at(-1);
    return parseFloat(last)*(/rad$/.test(last)?180/Math.PI:/turn$/.test(last)?360:1);
  }
  function linear(el,article){
    const chain=[];for(let n=el;n&&n!==article;n=n.parentElement)chain.unshift(n);
    let m=new DOMMatrix();
    for(const n of chain){
      const cs=getComputedStyle(n);
      const r=rotation(cs.rotate);if(r)m=m.rotate(r);
      if(cs.scale&&cs.scale!=='none'){const [sx,sy=sx]=cs.scale.split(/\s+/).map(parseFloat);m=m.scale(sx,sy);}
      if(cs.transform&&cs.transform!=='none')m=m.multiply(new DOMMatrix(cs.transform));
    }
    return m;
  }
  function presence(prim,frame){
    let o=1;
    for(let n=prim.el;n&&n!==frame.article.parentElement;n=n.parentElement){
      const cs=getComputedStyle(n);
      if(cs.display==='none')return 0;
      o*=number(cs.opacity,1);
      if(o<=.001)return 0;
    }
    const cs=getComputedStyle(prim.el);
    if(cs.visibility==='hidden')return 0;
    if(prim.kind==='text'){
      if(prim.pseudo){const c=getComputedStyle(prim.el,prim.pseudo).content;if(!c||c==='none'||c==='normal'||c==='""')return 0;}
      else if(!(number(cs.fontSize)>0))return 0;
    }
    if(prim.role==='outline'&&(cs.outlineStyle==='none'||!(number(cs.outlineWidth)>0)))return 0;
    if(prim.probe)o*=color(cs[prim.probe]).a/(prim.probeMax||1);
    return o;
  }
  function measure(prim,frame,t,state){
    const alive=prim.lineage.every(n=>(state.born.get(n)??0)<=t&&!((state.removed.get(n)??Infinity)<=t));
    const s={t,alive};
    if(!alive)return s;
    s.presence=presence(prim,frame);
    if(prim.svg){
      const m=prim.el.getScreenCTM();
      if(!m){s.alive=false;return s;}
      const n=new DOMMatrix().scale(1/frame.k).translate(-frame.left,-frame.top).multiply(m);
      s.m=[n.a,n.b,n.c,n.d,n.e,n.f];
      const cs=getComputedStyle(prim.el);
      if(prim.feature)s.d=cs.d;
      if(prim.fill&&!prim.fill.gradient)s.fill=color(cs.fill).hex;
      if(prim.line)s.stroke=color(cs.stroke).hex;
    }else{
      const r=prim.el.getBoundingClientRect(),l=linear(prim.el,frame.article);
      s.cx=((r.left+r.right)/2-frame.left)/frame.k;s.cy=((r.top+r.bottom)/2-frame.top)/frame.k;
      s.w=prim.el.offsetWidth||r.width/frame.k;s.h=prim.el.offsetHeight||r.height/frame.k;
      s.l=[l.a,l.b,l.c,l.d];
    }
    return s;
  }
  function pose(prim,s){
    if(prim.svg){
      const m=s.m,sx=Math.hypot(m[0],m[1])||1e-9,sy=(m[0]*m[3]-m[1]*m[2])/sx,[lx,ly]=prim.anchor;
      return {ax:m[0]*lx+m[2]*ly+m[4],ay:m[1]*lx+m[3]*ly+m[5],rot:Math.atan2(m[1],m[0])*180/Math.PI,w:prim.refW*sx,h:prim.refH*sy};
    }
    const [a,b,c,d]=s.l,sx=Math.hypot(a,b)||1e-9,sy=(a*d-b*c)/sx,rot=prim.ignoreRotation?0:Math.atan2(b,a)*180/Math.PI;
    if(prim.full)return {ax:s.cx,ay:s.cy,rot,w:s.w*sx,h:s.h*sy};
    const lx=prim.local.x+prim.local.w/2-s.w/2,ly=prim.local.y+prim.local.h/2-s.h/2;
    return {ax:s.cx+a*lx+c*ly,ay:s.cy+b*lx+d*ly,rot,w:prim.local.w*sx,h:prim.local.h*sy};
  }

  // ---- Primitives: what becomes a PowerPoint shape -------------------------------------------
  const passThrough=el=>el.matches('.mo-line,.mo-line-i,.mo-char,.editable-fragment')||/^inline/.test(getComputedStyle(el).display);
  function textOwners(article){
    const owners=new Map(),walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      // Whitespace between split letters is a node of its own; keep it so words stay apart.
      let el=node.parentElement;
      if(!el||el.closest(SKIP)||el.closest('svg')||el.closest('.loader-orbit'))continue;
      while(el!==article&&passThrough(el))el=el.parentElement;
      if(el===article)continue;
      if(!owners.has(el))owners.set(el,[]);
      owners.get(el).push(node);
    }
    for(const [el,nodes] of owners)if(!nodes.some(n=>n.textContent.trim()))owners.delete(el);
    return owners;
  }
  // Stacking: each positioned z-index nests inside the one around it (the phone at 3, its screen at 3.02, its fade at 3.01).
  function zChain(el,article){
    const chain=[];
    for(let n=el;n&&n!==article;n=n.parentElement){
      const cs=getComputedStyle(n);
      if(cs.position!=='static'&&cs.zIndex!=='auto')chain.unshift(parseInt(cs.zIndex,10)||0);
    }
    return chain;
  }
  const zFold=chain=>chain.reduce((z,v,i)=>z+v/100**i,0);
  function zOf(el,article){return zFold(zChain(el,article));}
  function collect(article,frame){
    const prims=[],owners=textOwners(article);
    let order=0;
    const add=p=>{p.order=order++;p.z??=zOf(p.el,article);p.lineage=[];for(let n=p.el;n&&n!==frame.article.parentElement;n=n.parentElement)p.lineage.push(n);prims.push(p);return p;};
    const visit=el=>{
      if(el.matches(SKIP))return;
      const cs=getComputedStyle(el);
      if(cs.display==='none')return;
      if(el instanceof SVGElement){
        if(el.tagName.toLowerCase()!=='svg')svgPrim(el,cs,add);
        for(const child of el.children)visit(child);
        return;
      }
      if(el.matches('.loader-orbit')){spinnerPrims(el,cs,add);return;}
      if(el.matches('.orbit-fragments i')){fragmentPrim(el,cs,add);return;}
      if(el.tagName==='IMG'){add({kind:'picture',el,full:true,src:el.currentSrc||el.src,descr:el.alt||''});return;}
      boxPrims(el,cs,add);
      pseudoPrim(el,'::before',add);
      if(owners.has(el))add({kind:'text',el,nodes:owners.get(el)});
      for(const child of el.children)visit(child);
      pseudoPrim(el,'::after',add);
    };
    for(const child of article.children)visit(child);
    return prims;
  }
  function boxPrims(el,cs,add){
    const w=el.offsetWidth,h=el.offsetHeight;
    if(!w||!h)return;
    const bg=color(cs.backgroundColor),grad=gradient(cs.backgroundImage);
    const sides=['Top','Right','Bottom','Left'].map(s=>{const c=color(cs['border'+s+'Color']),width=number(cs['border'+s+'Width']);return {width,c,on:width>0&&!/none|hidden/.test(cs['border'+s+'Style'])&&c.a>0};});
    const sh=shadow(cs.boxShadow),blur=/blur\(([\d.]+)px\)/.exec(cs.filter||'');
    const fill=grad?{gradient:grad}:bg.a>.004?{color:bg.hex,alpha:bg.a}:null;
    const uniform=sides.every(s=>s.on&&Math.abs(s.width-sides[0].width)<.1&&s.c.hex===sides[0].c.hex);
    if(!fill&&!sides.some(s=>s.on)&&!sh&&!(cs.outlineStyle!=='none'&&number(cs.outlineWidth)>0))return;
    const parent=el.parentElement,pcs=parent&&getComputedStyle(parent);
    let clip=0;
    if(pcs&&/hidden|clip/.test(pcs.overflow)&&el.offsetTop<=number(pcs.borderTopWidth)+1&&Math.abs(el.offsetWidth-parent.clientWidth)<=2)clip=Math.max(0,radii(pcs,parent.offsetWidth,parent.offsetHeight)[0]-number(pcs.borderTopWidth));
    if(fill||uniform||sh){
      const bw=uniform?sides[0].width:0;
      add({kind:'box',el,full:!bw,local:{x:bw/2,y:bw/2,w:w-bw,h:h-bw},...geometry(radii(cs,w,h),w,h,clip),fill,
        line:uniform?{color:sides[0].c.hex,alpha:sides[0].c.a,width:bw}:null,shadow:sh,softEdge:blur?number(blur[1]):0,
        probe:fill&&!grad?'backgroundColor':uniform?'borderTopColor':null,probeMax:fill&&!grad?bg.a:uniform?sides[0].c.a:1,role:'box'});
    }
    // CSS outline: a stroke just outside the border box (the selected product row).
    const ow=number(cs.outlineWidth),oc=color(cs.outlineColor);
    if(cs.outlineStyle!=='none'&&ow>0&&oc.a>0){
      const o=number(cs.outlineOffset)+ow/2,r=radii(cs,w,h).map(v=>v>0?v+o:0);
      add({kind:'box',el,local:{x:-o,y:-o,w:w+2*o,h:h+2*o},...geometry(r,w+2*o,h+2*o),fill:null,line:{color:oc.hex,alpha:oc.a,width:ow},probe:'outlineColor',probeMax:oc.a,role:'outline'});
    }
    if(!uniform)sides.forEach((s,i)=>{
      if(!s.on)return;
      const r=[{x:0,y:0,w,h:s.width},{x:w-s.width,y:0,w:s.width,h},{x:0,y:h-s.width,w,h:s.width},{x:0,y:0,w:s.width,h}][i];
      add({kind:'box',el,local:r,geom:'rect',fill:{color:s.c.hex,alpha:s.c.a},line:null,role:'border'});
    });
  }
  function pseudoPrim(el,which,add){
    const cs=getComputedStyle(el,which),content=cs.content;
    if(!content||content==='none'||content==='normal')return;
    const text=content.replace(/^["']|["']$/g,'');
    if(cs.position==='absolute'){
      // A drawn pseudo-element (the phone's bezel, its fade, the camera lens): fill or gradient, rounded corners, one border.
      const bg=color(cs.backgroundColor),grad=gradient(cs.backgroundImage),bw=number(cs.borderTopWidth),bc=color(cs.borderTopColor);
      const border=bw>0&&!/none|hidden/.test(cs.borderTopStyle)&&bc.a>0;
      if(bg.a<=.004&&!grad&&!border)return;
      const host=getComputedStyle(el),x=number(cs.left)+number(host.borderLeftWidth),y=number(cs.top)+number(host.borderTopWidth);
      const w=number(cs.width)+number(cs.paddingLeft)+number(cs.paddingRight)+(border?2*bw:0),h=number(cs.height)+number(cs.paddingTop)+number(cs.paddingBottom)+(border?2*bw:0);
      const inset=border?bw/2:0;
      add({kind:'box',el,pseudoBox:which,local:{x:x+inset,y:y+inset,w:w-2*inset,h:h-2*inset},...geometry(radii(cs,w,h),w,h),fill:grad?{gradient:grad}:bg.a>.004?{color:bg.hex,alpha:bg.a}:null,
        line:border?{color:bc.hex,alpha:bc.a,width:bw}:null,z:cs.zIndex==='auto'?undefined:zFold([...zChain(el,el.closest('.slide')),parseInt(cs.zIndex,10)||0]),role:'pseudo'});
    }else if(text.trim())add({kind:'text',el,pseudo:which,pseudoText:text});
  }
  function svgPrim(el,cs,add){
    const tag=el.tagName.toLowerCase();
    if(!/^(polygon|path|circle)$/.test(tag))return;
    const f=color(cs.fill),s=color(cs.stroke),sw=number(cs.strokeWidth);
    const fill=cs.fill!=='none'&&f.a>0?{color:f.hex,alpha:f.a*number(cs.fillOpacity,1)}:null;
    const line=cs.stroke!=='none'&&sw>0&&s.a>0?{color:s.hex,alpha:s.a*number(cs.strokeOpacity,1),width:sw,cap:cs.strokeLinecap==='round'?'rnd':undefined,join:'round'}:null;
    if(!fill&&!line)return;
    if(tag==='circle'){
      const r=number(el.getAttribute('r')),cx=number(el.getAttribute('cx')),cy=number(el.getAttribute('cy'));
      let arc=null;
      const dash=cs.strokeDasharray;
      if(line&&dash&&dash!=='none'){const len=number(el.getAttribute('pathLength'),2*Math.PI*r);arc=Math.max(0,Math.min(1,parseFloat(dash)/len));}
      add({kind:'circle',el,svg:true,local:{x:cx-r,y:cy-r,w:2*r,h:2*r},fill:arc==null?fill:null,line,arc,dashLength:number(el.getAttribute('pathLength'),2*Math.PI*r)});
      return;
    }
    const points=tag==='polygon'?parsePoints(el.getAttribute('points')):parsePath(cs.d&&cs.d!=='none'?cs.d:el.getAttribute('d'));
    if(points.length>=3)add({kind:'poly',el,svg:true,points,fill,line,feature:el.dataset?.feature||null});
  }
  function spinnerPrims(el,cs,add){
    const w=el.offsetWidth,bw=number(cs.borderTopWidth,4),track=color(cs.borderRightColor),head=color(cs.borderTopColor);
    const local={x:bw/2,y:bw/2,w:w-bw,h:w-bw};
    add({kind:'box',el,local,geom:'ellipse',fill:null,line:{color:track.hex,alpha:track.a,width:bw},ignoreRotation:true,role:'spinner-track'});
    add({kind:'arc',el,local:{...local},from:225,to:315,fill:null,line:{color:head.hex,alpha:head.a,width:bw},ignoreRotation:true,role:'spinner'});
  }
  function fragmentPrim(el,cs,add){
    const w=el.offsetWidth,bw=number(cs.borderTopWidth),c=color(cs.borderTopColor);
    add({kind:'arc',el,local:{x:bw/2,y:bw/2,w:w-bw,h:el.offsetHeight-bw},from:270,to:360,fill:null,line:{color:c.hex,alpha:c.a,width:bw},role:'fragment'});
  }

  // ---- Text: lines, runs and PowerPoint placement --------------------------------------------
  const ASCENT=.987,DESCENT=.213;
  function runStyle(cs){
    const weight=number(cs.fontWeight,400),c=color(cs.color);
    return {font:weight>=800?'Lato Black':'Lato',bold:weight>=600&&weight<800,size:number(cs.fontSize),color:c.hex,alpha:c.a,
      spacing:cs.letterSpacing==='normal'?0:number(cs.letterSpacing),caps:cs.textTransform==='uppercase'};
  }
  function neutralize(owner,article){
    const touched=[];
    const flat=n=>{touched.push([n,n.style.cssText]);for(const p of ['transform','rotate','scale','translate'])n.style.setProperty(p,'none','important');};
    for(let n=owner;n&&n!==article;n=n.parentElement)flat(n);
    owner.querySelectorAll('.mo-char,.mo-line-i').forEach(flat);
    return ()=>touched.reverse().forEach(([n,css])=>{n.style.cssText=css;});
  }
  function textLayout(prim,frame,glyphs){
    const owner=prim.el,restore=neutralize(owner,frame.article);
    try{
      const box=owner.getBoundingClientRect(),k=frame.k,ocs=getComputedStyle(owner),chars=[],range=document.createRange();
      const ox=box.left,oy=box.top,ow=owner.offsetWidth,oh=owner.offsetHeight;
      const align={center:'ctr',right:'r',end:'r',justify:'just'}[ocs.textAlign]||'l';
      const contentLeft=number(ocs.borderLeftWidth)+number(ocs.paddingLeft),contentRight=ow-number(ocs.borderRightWidth)-number(ocs.paddingRight);
      if(prim.pseudo){
        const pcs=getComputedStyle(owner,prim.pseudo),style=runStyle(pcs),L=pcs.lineHeight==='normal'?1.2*style.size:number(pcs.lineHeight);
        return {local:{x:0,y:0,w:ow,h:oh},anchor:'ctr',wrap:'none',paragraphs:[{align:'ctr',lineHeight:L,runs:splitRuns([{...style,text:prim.pseudoText}],glyphs)}]};
      }
      for(const node of prim.nodes){
        const el=node.parentElement,cs=getComputedStyle(el),style=runStyle(cs);
        if(!(style.size>0))continue;
        const text=node.textContent,lh=cs.lineHeight==='normal'?1.2*style.size:number(cs.lineHeight);
        for(let i=0;i<text.length;i++){
          range.setStart(node,i);range.setEnd(node,i+1);
          const r=range.getBoundingClientRect();
          if(!r.width&&!r.height)continue;
          chars.push({ch:text[i],node,style,lh,x:(r.left-ox)/k,y:(r.top-oy)/k,w:r.width/k,base:(r.top-oy)/k+ASCENT*style.size,key:JSON.stringify(style)});
        }
      }
      // Group characters into visual lines (reading order is DOM order).
      const lines=[];
      for(const c of chars){
        const line=lines.at(-1);
        if(line&&Math.abs(c.base-line.base)<.35*Math.max(c.style.size,line.size)&&c.x>=line.right-c.style.size)line.chars.push(c),line.right=Math.max(line.right,c.x+c.w),line.size=Math.max(line.size,c.style.size),line.lh=Math.max(line.lh,c.lh);
        else lines.push({chars:[c],base:c.base,right:c.x+c.w,size:c.style.size,lh:c.lh,left:c.x});
      }
      const paragraphs=[],hosts=[...owner.querySelectorAll(':scope > .mo-line')];let top=null,prevBottom=null,maxWidth=0;
      for(const line of lines){
        const visible=line.chars.filter(c=>c.ch.trim());
        if(!visible.length)continue;
        line.base=visible.reduce((n,c)=>n+c.base,0)/visible.length;
        const runs=[];
        for(const c of line.chars){
          const ch=/\s/.test(c.ch)?' ':c.ch,last=runs.at(-1);
          if(last&&last.key===c.key)last.text+=ch;else runs.push({...c.style,key:c.key,text:ch});
        }
        runs.forEach(r=>{r.text=r.text.replace(/\s+/g,' ');});
        if(runs.length){runs[0].text=runs[0].text.replace(/^\s+/,'');runs.at(-1).text=runs.at(-1).text.replace(/\s+$/,'');}
        const lineTop=line.base-(line.lh-DESCENT*line.size);
        if(top==null)top=lineTop;
        const before=prevBottom==null?0:Math.max(0,lineTop-prevBottom);
        prevBottom=(prevBottom==null?lineTop:prevBottom+before)+line.lh;
        maxWidth=Math.max(maxWidth,line.right-Math.min(...visible.map(c=>c.x)));
        const host=visible[0].node.parentElement.closest('.mo-line');
        paragraphs.push({align,lineHeight:line.lh,before,runs:splitRuns(runs.filter(r=>r.text),glyphs),lineHost:hosts.indexOf(host)});
      }
      if(!paragraphs.length)return null;
      // PowerPoint, Keynote and font substitutes measure text a little wider than the browser (tracking, kerning).
      // Every line is already its own paragraph, so boxes never wrap and leave room around the text.
      let x=contentLeft,w=Math.max(1,contentRight-contentLeft);
      const need=maxWidth*1.2+24;
      if(w<need){if(align==='ctr')x-=(need-w)/2;else if(align==='r')x-=need-w;w=need;}
      return {local:{x,y:top,w,h:Math.max(1,prevBottom-top)},anchor:'t',wrap:'none',paragraphs};
    }finally{restore();}
  }
  function splitRuns(runs,glyphs){
    const out=[];
    for(const r of runs){
      let cur=null;
      for(const ch of Array.from(r.text)){
        const symbol=glyphs&&!glyphs.has(ch.codePointAt(0))&&ch.trim()!=='';
        const font=symbol?(/\p{Extended_Pictographic}/u.test(ch)?EMOJI_FONT:SYMBOL_FONT):r.font;
        if(cur&&cur.font===font)cur.text+=ch;else{cur={...r,font,bold:symbol?false:r.bold,text:ch};delete cur.key;out.push(cur);}
      }
    }
    return out;
  }

  // ---- Compiling sampled motion into PowerPoint effects --------------------------------------
  function simplify(points,tolerance){
    if(points.length<=2)return points;
    const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
    const stack=[[0,points.length-1]];
    while(stack.length){
      const [a,b]=stack.pop(),[t0,v0]=points[a],[t1,v1]=points[b];
      let max=0,idx=-1;
      for(let i=a+1;i<b;i++){const [t,v]=points[i],d=Math.abs(v-(v0+(v1-v0)*(t-t0)/((t1-t0)||1)));if(d>max){max=d;idx=i;}}
      if(max>tolerance&&idx>0){keep[idx]=1;stack.push([a,idx],[idx,b]);}
    }
    return points.filter((_,i)=>keep[i]);
  }
  const TOL={x:.6,y:.6,w:.004,h:.004,r:.3};
  function channels(prim,samples,base,rest){
    const ch={x:[],y:[],w:[],h:[],r:[]},off=prim.transient?OFF:0;
    for(const s of samples){
      if(!s.alive)continue;
      const q=pose(prim,s);
      ch.x.push([s.t,q.ax-base.ax-off]);ch.y.push([s.t,q.ay-base.ay]);
      ch.w.push([s.t,q.w/(base.w||1)]);ch.h.push([s.t,q.h/(base.h||1)]);ch.r.push([s.t,q.rot-base.rot]);
    }
    // Angles come from atan2 (±180°); unwrap them so a full turn is a turn, not a jump back.
    for(let i=1;i<ch.r.length;i++){let d=ch.r[i][1]-ch.r[i-1][1];while(d>180){ch.r[i][1]-=360;d-=360;}while(d<-180){ch.r[i][1]+=360;d+=360;}}
    const out={};
    for(const key of Object.keys(ch)){
      const pts=ch[key];
      if(pts.length<1)continue;
      const restValue=key==='w'||key==='h'?1:0;
      const moving=pts.some(([,v])=>Math.abs(v-pts[0][1])>TOL[key]);
      const away=Math.abs(pts[0][1]-restValue)>TOL[key];
      if(!moving&&!(away&&(rest||prim.transient)))continue;
      // Scale keys err by at most half a pixel of the shape's size (seams between big facets); past 60 keys the tolerance grows
      // instead of cutting the end off.
      let tol=key==='w'||key==='h'?Math.min(TOL[key],.5/Math.max(1,key==='w'?base.w:base.h)):TOL[key],kept=simplify(pts,tol);
      while(kept.length>60){tol*=1.5;kept=simplify(pts,tol);}
      out[key]=kept;
    }
    return out;
  }
  function animBehaviors(ch,from,dur,rotateMode){
    const out=[],frac=t=>dur>0?Math.min(1,Math.max(0,(t-from)/dur)):0,keys=(pts,f)=>{const k=pts.map(([t,v])=>[frac(t),f(v)]);if(k.length===1)k.push([1,k[0][1]]);return k;};
    if(ch.x)out.push({type:'anim',attr:'ppt_x',dur,keys:keys(ch.x,v=>offset('ppt_x',v,W))});
    if(ch.y)out.push({type:'anim',attr:'ppt_y',dur,keys:keys(ch.y,v=>offset('ppt_y',v,H))});
    if(ch.w)out.push({type:'anim',attr:'ppt_w',dur,keys:keys(ch.w,v=>'#ppt_w*'+fmt(Math.max(0,v)))});
    if(ch.h)out.push({type:'anim',attr:'ppt_h',dur,keys:keys(ch.h,v=>'#ppt_h*'+fmt(Math.max(0,v)))});
    if(ch.r){
      if(rotateMode==='abs')out.push({type:'anim',attr:'style.rotation',dur,keys:keys(ch.r,v=>Math.round(v*100)/100)});
      else{
        let prev=0;
        ch.r.forEach(([t,v],i)=>{
          const at=i?ch.r[i-1][0]-from:0,span=i?t-ch.r[i-1][0]:1;
          if(Math.abs(v-prev)>.01)out.push({type:'rotate',by:v-prev,at:Math.max(0,at),dur:Math.max(1,span)});
          prev=v;
        });
      }
    }
    return out;
  }
  const kindPreset=b=>b.some(x=>x.attr==='ppt_x'||x.attr==='ppt_y')?['path',[0,0]]:b.some(x=>x.attr==='ppt_w'||x.attr==='ppt_h')?['emph',[6,0]]:b.some(x=>x.type==='rotate'||x.attr==='style.rotation')?['emph',[8,0]]:b.some(x=>x.type==='color')?['emph',[1,0]]:['emph',[9,0]];

  // Finite window of one group: entrance, motion, plateaus of opacity, exit.
  function finiteEffect(prim,g,samples,win,shape,previous){
    const [from,to]=win,inWin=samples.filter(s=>s.t>=from-1e-6&&s.t<=to+1e-6);
    if(!inWin.length)return null;
    const ratio=s=>s&&s.alive?Math.min(1,(s.presence||0)/(prim.maxPresence||1)):0,vis=s=>ratio(s)>.02;
    const before=samples.filter(s=>s.t<from-1e-6).at(-1)??previous??(g.index===0?inWin[0]:null);
    const startVisible=!prim.transient&&vis(before);
    const first=inWin.find(vis);
    if(!first&&!startVisible)return null;
    const behaviors=[];
    let cls='emph',entryEnd=from;
    if(!startVisible){
      cls='entr';
      behaviors.push({type:'visibility',value:'visible',at:first.t-from});
      const full=inWin.find(s=>s.t>=first.t&&ratio(s)>=.97);
      if(full){if(full.t-first.t>STEP*1.5)behaviors.push({type:'fade',dir:'in',at:first.t-from,dur:full.t-first.t});entryEnd=full.t;}
      else{
        let j=inWin.indexOf(first);while(j+1<inWin.length&&ratio(inWin[j+1])>ratio(inWin[j])+.005)j++;
        behaviors.push({type:'opacity',value:Math.round(ratio(inWin[j])*100)/100,at:first.t-from,dur:Math.max(1,inWin[j].t-first.t)});
        entryEnd=inWin[j].t;
      }
    }
    // Exit: the shape is gone at the end of the window.
    let exitStart=Infinity;
    if(!vis(inWin.at(-1))){
      const lastVisible=[...inWin].reverse().find(vis);
      if(lastVisible){
        const gone=inWin.find(s=>s.t>lastVisible.t)??inWin.at(-1);
        let k=inWin.indexOf(lastVisible);while(k>0&&ratio(inWin[k-1])>ratio(inWin[k])+.005)k--;
        exitStart=inWin[k].t;
        if(gone.t-exitStart>STEP*1.5)behaviors.push({type:'fade',dir:'out',at:exitStart-from,dur:gone.t-exitStart});
        behaviors.push({type:'visibility',value:'hidden',at:gone.t-from});
        if(cls!=='entr')cls='exit';
      }
    }
    // A class switch at the click (dimming, shrinking) happens between the previous sample and this window.
    let series=inWin;
    if(startVisible&&before&&before!==inWin[0]){
      const r0=ratio(before),r1=ratio(inWin[0]),q0=pose(prim,before),q1=pose(prim,inWin[0]);
      if(Math.abs(r1-r0)>=.05)behaviors.push({type:'opacity',value:Math.round(r1*100)/100,at:0,dur:400});
      if(Math.hypot(q1.ax-q0.ax,q1.ay-q0.ay)>.6||Math.abs(q1.w/q0.w-1)>.004||Math.abs(q1.rot-q0.rot)>.3)
        series=[{...before,t:from},{...inWin[0],t:from+Math.min(400,Math.max(STEP,to-from))},...inWin.filter(s=>s.t>from+400)];
    }
    // Plateaus of opacity between entry and exit (dimming, blush).
    let level=null;
    const middle=inWin.filter(s=>s.t>=entryEnd&&s.t<exitStart&&vis(s));
    for(let i=0;i<middle.length;i++){
      const r=ratio(middle[i]);
      if(level==null){level=startVisible&&before?ratio(inWin[0]):r;if(Math.abs(r-level)<.05)continue;}
      if(Math.abs(r-level)>=.05){
        let j=i;while(j+1<middle.length&&Math.abs(ratio(middle[j+1])-ratio(middle[j]))>.004)j++;
        const target=ratio(middle[j]);
        behaviors.push({type:'opacity',value:Math.round(target*100)/100,at:Math.max(0,middle[i].t-from-STEP),dur:Math.max(1,middle[j].t-middle[i].t+STEP)});
        level=target;i=j;
      }
    }
    // Colour changes (facets taking on a new palette) become colour emphases of the fill and the outline.
    for(const key of ['fill','stroke']){
      const tinted=series.filter(s=>s.alive&&s[key]);
      for(let i=1,current=tinted[0]?.[key];i<tinted.length;i++){
        if(tinted[i][key]===current)continue;
        let j=i;while(j+1<tinted.length&&tinted[j+1][key]!==tinted[j][key])j++;
        behaviors.push({type:'color',attr:key,to:tinted[j][key],at:Math.max(0,tinted[i-1].t-from),dur:Math.max(1,tinted[j].t-tinted[i-1].t)});
        current=tinted[j][key];i=j;
      }
    }
    if(level==null&&startVisible&&!first&&!behaviors.length)return null;
    const ch=channels(prim,series,prim.base,true);
    behaviors.push(...animBehaviors(ch,from,Math.max(1,Math.max(to,series.at(-1).t)-from),shape.rot?'chain':'abs'));
    if(!behaviors.length)return null;
    const [kind,preset]=cls==='emph'?kindPreset(behaviors):[cls,[10,0]];
    return {shape,cls:kind,preset,delay:Math.max(0,from-g.start),behaviors};
  }

  // ---- One slide --------------------------------------------------------------------------
  const GROUP_GAP=400;
  function captureSlide(session,index){
    const slide=window.HOMO_DECK.slides[index];
    // Nothing comes before the first slide: the slide on screen when exporting must not become its transition.
    if(!index)document.querySelector('#stage').replaceChildren();
    const state=session.begin();
    const article=window.DECK_NAV.capture(index);
    session.run();
    const groups=[{index:0,trigger:'auto',start:0}];
    groups[0].end=groupEnd(state,0,0,slide);
    for(let step=1;step<=(slide.reveals||0);step++){
      const start=groups.at(-1).end+GROUP_GAP;
      session.setGroup(step,start);
      window.DECK_NAV.captureStep(step);
      session.run();
      groups.push({index:step,trigger:'click',start,end:groupEnd(state,step,start,slide)});
    }
    session.end();
    return {slide,article,groups,state};
  }
  function affects(record,prim){return !record.el.classList?.contains('slide')&&prim.lineage.includes(record.el);}
  function windowsFor(prim,groups,state,slide){
    return groups.map(g=>{
      let from=Infinity,to=-Infinity;
      for(const r of state.records){
        if(recordEnd(r)===Infinity||!affects(r,prim))continue;
        const s=r.start+(r.timing.delay||0),e=recordEnd(r);
        if(e<g.start||s>g.end)continue;
        // One sample past the end: a shape held hidden until e only shows in the sample after it.
        from=Math.min(from,Math.max(g.start,r.start));to=Math.max(to,Math.min(g.end,e+STEP));
      }
      for(const n of prim.lineage){
        const b=state.born.get(n),rm=state.removed.get(n);
        if(b!=null&&b>g.start&&b<=g.end){from=Math.min(from,b);to=Math.max(to,b+STEP);}
        if(rm!=null&&rm>=g.start&&rm<=g.end){from=Math.min(from,rm-STEP);to=Math.max(to,rm+STEP);}
      }
      if(slide.loader&&g.index===0&&prim.el.closest?.('.loading-track')){from=0;to=Math.max(to,slide.loader.duration);}
      return from<=to?[Math.max(g.start,from),Math.min(g.end,to)]:null;
    });
  }
  function loopIntervals(prim,state,groups){
    const loops=state.records.filter(r=>r.timing.iterations===Infinity&&affects(r,prim)).map(r=>{
      const t=r.timing,period=(Number(t.duration)||0)*(/alternate/.test(t.direction)?2:1);
      return {from:r.start+(t.delay||0),until:r.canceledAt??Infinity,period:Math.max(STEP,Math.round(period/10)*10)};
    }).filter(l=>l.until>l.from);
    if(!loops.length)return [];
    const cuts=[...new Set(loops.flatMap(l=>[l.from,l.until]).filter(Number.isFinite))].sort((a,b)=>a-b);
    const out=[];
    for(let i=0;i<cuts.length;i++){
      const u=cuts[i],v=cuts[i+1]??Infinity,active=loops.filter(l=>l.from<=u&&l.until>=v);
      if(!active.length||v-u<STEP)continue;
      const gcd=(a,b)=>b?gcd(b,a%b):a;
      let period=active.reduce((p,l)=>p*l.period/gcd(p,l.period),active[0].period);
      if(period>LOOP_CAP)period=Math.max(...active.map(l=>l.period));
      const group=[...groups].reverse().find(g=>g.start<=u)||groups[0];
      out.push({u,v,period,group,untilClick:Number.isFinite(v)&&groups.some(g=>Math.abs(g.start-v)<1)});
    }
    return out;
  }
  // Facial features morph their outline; PowerPoint gets one shape per expression and swaps them.
  function expressionVariants(prims){
    for(const p of [...prims]){
      if(!p.feature)continue;
      const all=p.samples.flat().filter(s=>s.alive&&s.d);
      const counts=new Map();all.forEach(s=>counts.set(s.d,(counts.get(s.d)||0)+1));
      const plateaus=[...counts].filter(([,n])=>n>=3).map(([d])=>d);
      if(plateaus.length<2)continue;
      // Samples caught mid-morph belong to the nearer plateau in time.
      const flat=p.samples.flatMap((list,gi)=>list.map((s,i)=>({gi,i,s})));
      flat.forEach((x,i)=>{
        if(!x.s.alive||plateaus.includes(x.s.d))return;
        let a=i,b=i;while(a>0&&!plateaus.includes(flat[a].s.d))a--;while(b<flat.length-1&&!plateaus.includes(flat[b].s.d))b++;
        x.s.snap=(i-a<=b-i?flat[a]:flat[b]).s.d;
      });
      prims.splice(prims.indexOf(p),1);
      plateaus.forEach(d=>prims.push({...p,variantOf:p,points:parsePath(d),samples:p.samples.map(list=>list.map(s=>((s.snap??s.d)===d?s:{...s,presence:0})))}));
    }
  }
  function exportSlide(session,index,assets){
    const slides=window.HOMO_DECK.slides,slide=slides[index];
    const link=index?window.DECK_MOTION.transitionFor(slides[index-1],slide):{type:'none'};
    const {article,groups,state}=captureSlide(session,index);
    const end=groups.at(-1).end;
    session.setTime(end);
    let frame=frameOf(article);
    const background=backgroundOf(article,slide);
    const prims=collect(article,frame);
    const track=article.querySelector('.loading-track'),loader=slide.loader;
    const loaderAt=t=>loader?window.DECK_MOTION.loaderValue(Math.min(1,Math.max(0,t/loader.duration)),loader.from,loader.to):0;
    const setTime=t=>{session.setTime(t);if(loader&&track)track.style.setProperty('--load',loaderAt(t)+'%');frame=frameOf(article);};
    // Sample every primitive across every group window (densely where something moves).
    for(const p of prims){
      p.samples=groups.map(()=>[]);p.finite=windowsFor(p,groups,state,slide);
      p.loops=state.records.some(r=>r.timing.iterations===Infinity&&affects(r,p));
    }
    groups.forEach((g,gi)=>{
      const times=[];for(let t=g.start;t<g.end;t+=STEP)times.push(t);times.push(g.end);
      for(const t of times){
        setTime(t);
        for(const p of prims){
          if(!(p.finite[gi]||p.loops)&&t!==g.start&&t!==g.end)continue;
          p.samples[gi].push(measure(p,frame,t,state));
        }
      }
    });
    // Class switches at a click (dimming, a sign that changes) show up between group boundaries.
    for(const p of prims)groups.forEach((g,gi)=>{
      if(p.finite[gi]||!gi)return;
      const a=p.samples[gi-1].at(-1),b=p.samples[gi][0],c=p.samples[gi].at(-1),level=s=>s&&s.alive?Math.round((s.presence||0)*20):0;
      if(level(a)!==level(b)||level(b)!==level(c))p.finite[gi]=[g.start,g.end];
    });
    expressionVariants(prims);
    // Static state: start of the slide after a Morph, otherwise the end; never-visible shapes are dropped.
    const kept=[];
    // A shape squashed to nothing (a line that has not grown yet) is not a usable resting state.
    const sized=s=>s.m?Math.hypot(s.m[0],s.m[1])*Math.hypot(s.m[2],s.m[3])>1e-6:s.w*Math.hypot(s.l[0],s.l[1])>.5&&s.h*Math.hypot(s.l[2],s.l[3])>.5;
    for(const p of prims){
      const all=p.samples.flat(),vis=s=>s.alive&&s.presence>.01&&sized(s);
      p.maxPresence=Math.max(0,...all.filter(s=>s.alive).map(s=>s.presence));
      if(p.maxPresence<=.01)continue;
      let s=link.type==='morph'&&vis(all[0])?all[0]:vis(all.at(-1))?all.at(-1):null;
      if(p.el.closest('.m-steam'))s=null;
      if(!s){s=[...all].reverse().find(vis);p.transient=true;}
      if(!s)continue;
      // A shape whose fill changes starts in its first colour; colour emphases take it from there.
      const first=all.find(vis);
      if(first?.fill&&p.fill&&first.fill!==p.fill.color)p.fill={...p.fill,color:first.fill};
      if(first?.stroke&&p.line&&first.stroke!==p.line.color)p.line={...p.line,color:first.stroke};
      p.staticSample=s;kept.push(p);
    }
    // Of the expressions of one feature only one stays on the slide; the others wait off-slide.
    const families=new Map();
    kept.filter(p=>p.variantOf).forEach(p=>{if(!families.has(p.variantOf))families.set(p.variantOf,[]);families.get(p.variantOf).push(p);});
    for(const list of families.values()){
      const at=s=>s&&s.alive&&s.presence>.01;
      const pick=list.find(p=>at(link.type==='morph'?p.samples.flat()[0]:p.samples.flat().at(-1)))??list.reduce((a,b)=>(b.staticSample.t>a.staticSample.t?b:a));
      list.forEach(p=>{if(p!==pick){p.transient=true;p.staticSample=[...p.samples.flat()].reverse().find(at);}});
      pick.transient=false;
    }
    // Geometry at the static moment (text needs the layout at that time).
    const byTime=new Map();
    kept.forEach(p=>{const t=p.staticSample.t;if(!byTime.has(t))byTime.set(t,[]);byTime.get(t).push(p);});
    for(const [t,list] of byTime){
      setTime(t);
      for(const p of list){
        if(p.kind==='text'){const layout=textLayout(p,frame,assets.glyphs);if(!layout){p.drop=true;continue;}Object.assign(p,{local:layout.local,body:layout});}
        if(p.svg)prepareSvg(p);
        p.base=pose(p,p.staticSample);
      }
    }
    const model={shapes:[],effects:groups.map(()=>[]),background};
    const live=kept.filter(p=>!p.drop);
    live.sort((a,b)=>a.z-b.z||a.order-b.order);
    const names=new Set();
    for(const p of live){
      const shape=shapeOf(p,names,index);
      if(!shape)continue;
      p.shape=shape;model.shapes.push(shape);
      groups.forEach((g,gi)=>{
        const shown=p.samples[gi].find(s=>s.alive&&s.presence>.01);
        let win=p.finite[gi]??(p.transient&&shown?[g.start,g.end]:null);
        // A transient that is on screen before its window (a still layer removed later) enters when it first shows.
        if(win&&p.transient&&shown&&shown.t<win[0])win=[shown.t,win[1]];
        if(!win)return;
        const e=finiteEffect(p,g,p.samples[gi],win,shape,gi?p.samples[gi-1].at(-1):null);
        if(e)model.effects[gi].push(e);
      });
    }
    loops(live,state,groups,model,setTime,()=>frame);
    specials({slide,article,groups,state,link,live,model,setTime,assets,index});
    setTime(end);
    if(loader&&track)track.style.setProperty('--load',loader.to+'%');
    return {model,groups,link};
  }
  function prepareSvg(p){
    const m=p.staticSample.m,M=new DOMMatrix(m);
    if(p.kind==='poly'){
      const world=p.points.map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);
      const xs=world.map(q=>q[0]),ys=world.map(q=>q[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys);
      p.world={x:x0,y:y0,w:Math.max(.5,x1-x0),h:Math.max(.5,y1-y0),points:world.map(([x,y])=>[x-x0,y-y0])};
      const c=new DOMPoint((x0+x1)/2,(y0+y1)/2).matrixTransform(M.inverse());
      const sx=Math.hypot(m[0],m[1])||1,sy=Math.abs((m[0]*m[3]-m[1]*m[2])/sx)||1;
      p.anchor=[c.x,c.y];p.refW=p.world.w/sx;p.refH=p.world.h/sy;
    }else{
      p.anchor=[p.local.x+p.local.w/2,p.local.y+p.local.h/2];p.refW=p.local.w;p.refH=p.local.h;
    }
  }
  function nameFor(p,index){
    const el=p.el;
    if(el.closest('.mo-ghost'))return null;
    if(el.matches('.brand-top'))return 'Logo';
    if(el.matches('.corner-heart'))return 'Serce w rogu';
    if(el.matches('.deck-progress'))return 'Postęp';
    if(el.matches('.slide-number'))return 'Numer slajdu';
    if(el.matches('.source-note'))return 'Źródło';
    if(p.role==='spinner')return 'Spinner – łuk';
    if(p.role==='spinner-track')return 'Spinner – pierścień';
    if(el.matches('.loading-track'))return 'Loader – tor';
    if(el.matches('.loading-track i'))return 'Loader – pasek';
    if(el.matches('.loader-percent'))return 'Loader – procent';
    if(el.matches('.waiting-content h1'))return 'Proszę czekać';
    if(el.closest('.mo-mascot')&&p.kind==='poly')return 'Postać '+(el.dataset.feature||el.dataset.part);
    if(el.closest('.mo-backdrop')){const list=[...el.closest('.mo-backdrop').querySelectorAll('polygon')];return 'Tło '+(list.indexOf(el)+1);}
    // The story clock keeps its parts' names, so Morph carries the hand from slide to slide.
    const clock=el.closest('.story-clock');
    if(clock){
      if(el.matches('.clock-face'))return 'Zegar – tarcza';
      if(el.matches('.clock-hand'))return 'Zegar – wskazówka';
      if(el.matches('.clock-pin'))return 'Zegar – oś';
      if(el.matches('.clock-wedge'))return 'Zegar – wycinek '+el.dataset.k;
      if(el.matches('.clock-tick'))return 'Zegar – kreska '+([...clock.querySelectorAll('.clock-tick')].indexOf(el)+1);
      if(el.matches('.clock-label'))return 'Zegar – napis';
    }
    const frameRoles=[['.shopping-frame','Telefon'],['.phone-screen','Telefon – ekran'],['.phone-island','Telefon – wyspa'],['.key-action','Telefon – przycisk akcji'],['.key-up','Telefon – głośniej'],['.key-down','Telefon – ciszej'],['.key-power','Telefon – zasilanie'],['.shop-header','Telefon – nagłówek'],['.shop-wordmark','Telefon – aplikacja'],['.shop-cart-icon','Telefon – koszyk'],['.shop-context','Telefon – kontekst'],['.shop-body > h2','Telefon – tytuł'],['.shop-search','Telefon – wyszukiwarka']];
    for(const [selector,name] of frameRoles)if(el.matches(selector))return name+(p.kind==='text'?' (tekst)':'')+(p.pseudoBox?' '+p.pseudoBox.replace(/:/g,''):'');
    void index;
    return null;
  }
  function describe(p){
    if(p.kind==='text'){const t=(p.pseudoText||p.nodes.map(n=>n.textContent).join(' ')).replace(/\s+/g,' ').trim();return 'Tekst: '+t.slice(0,40);}
    if(p.kind==='picture')return 'Obraz';
    if(p.el.closest('.mo-ghost'))return 'Echo slajdu 2';
    if(p.el.closest('.mo-fx'))return 'Iskra';
    if(p.el.closest('.mo-heart'))return 'Serce – fasetka';
    if(p.el.closest('.mo-cursor'))return 'Kursor';
    if(p.role==='fragment')return 'Orbita – ćwiartka';
    return p.role==='border'?'Linia':'Kształt';
  }
  function shapeOf(p,names,index){
    const off=p.transient?OFF:0,b=p.base;
    let name=nameFor(p,index);
    if(name&&!p.transient&&!names.has('!!'+name))name='!!'+name;
    else{const label=name?name+' (wariant)':describe(p);let n=1;name=label;while(names.has(name))name=label+' '+(++n);}
    names.add(name);
    const alpha=p.maxPresence;
    const scaleFill=f=>f?(f.gradient?{gradient:{...f.gradient,stops:f.gradient.stops.map(s=>({...s,alpha:(s.alpha??1)*alpha}))}}:{...f,alpha:(f.alpha??1)*alpha}):null;
    const lineOf=l=>l?{...l,alpha:(l.alpha??1)*alpha,width:l.width*(p.svg?Math.hypot(p.staticSample.m[0],p.staticSample.m[1]):1)}:null;
    if(p.kind==='poly')return {name,x:p.world.x+off,y:p.world.y,w:p.world.w,h:p.world.h,points:p.world.points,fill:scaleFill(p.fill),line:lineOf(p.line)};
    const shape={name,x:b.ax+off-b.w/2,y:b.ay-b.h/2,w:b.w,h:b.h,rot:Math.round(b.rot*100)/100};
    if(Math.abs(shape.rot)<.05)shape.rot=0;
    if(p.kind==='picture')return {...shape,kind:'picture',src:p.src,descr:p.descr};
    if(p.kind==='text'){
      const body=p.body;
      const scale=b.w/(p.local.w||1);
      return {...shape,fill:null,line:null,textBox:true,text:{wrap:body.wrap,anchor:body.anchor,paragraphs:body.paragraphs.map(par=>({...par,lineHeight:par.lineHeight*scale,before:par.before*scale,runs:par.runs.map(r=>({...r,size:r.size*scale,spacing:r.spacing*scale,alpha:(r.alpha??1)*alpha}))}))}};
    }
    if(p.kind==='circle'||p.kind==='arc'){
      const arc=p.kind==='arc'?[p.from,p.to]:p.arc!=null?[0,360*p.arc]:null;
      if(arc&&arc[1]-arc[0]<359.5)return {...shape,geom:'arc',adj:{adj1:((arc[0]%360)+360)%360*60000,adj2:((arc[1]%360)+360)%360*60000},fill:null,line:lineOf(p.line)};
      return {...shape,geom:'ellipse',fill:scaleFill(p.fill),line:lineOf(p.line)};
    }
    return {...shape,geom:p.geom,adj:p.adj,fill:scaleFill(p.fill),line:lineOf(p.line),shadow:p.shadow,softEdge:p.softEdge};
  }
  function loops(prims,state,groups,model,setTime,frameNow){
    for(const p of prims){
      if(!p.shape)continue;
      const intervals=loopIntervals(p,state,groups);
      for(const iv of intervals){
        const fin=p.finite[iv.group.index];
        const u=Math.max(iv.u,fin?fin[1]:iv.u);
        if(Number.isFinite(iv.v)&&iv.v-u<STEP)continue;
        const samples=[];
        for(let t=u;t<=u+iv.period+1e-6;t+=STEP){setTime(t);samples.push(measure(p,frameNow(),t,state));}
        const ch=channels(p,samples,p.base,false);
        const behaviors=animBehaviors(ch,u,iv.period,p.shape.rot?'chain':'abs');
        const ratio=s=>s.alive?Math.min(1,(s.presence||0)/(p.maxPresence||1)):0;
        if(samples.some(s=>ratio(s)<.5)&&samples.some(s=>ratio(s)>.5)){
          const on=samples.find(s=>ratio(s)>.02),peak=samples.reduce((a,s)=>ratio(s)>ratio(a)?s:a,samples[0]),off=[...samples].reverse().find(s=>ratio(s)>.02);
          if(on){
            behaviors.unshift({type:'visibility',value:'visible',at:on.t-u});
            behaviors.push({type:'fade',dir:'in',at:on.t-u,dur:Math.max(1,peak.t-on.t)},{type:'fade',dir:'out',at:peak.t-u,dur:Math.max(1,off.t-peak.t)},{type:'visibility',value:'hidden',at:Math.min(iv.period-1,off.t-u+STEP)});
          }
        }
        if(!behaviors.length)continue;
        const repeat=Number.isFinite(iv.v)&&!iv.untilClick?Math.max(.01,(iv.v-u)/iv.period):'indefinite';
        const [cls,preset]=kindPreset(behaviors);
        model.effects[iv.group.index].push({shape:p.shape,cls,preset,delay:Math.max(0,u-iv.group.start),repeat,untilNextClick:iv.untilClick,behaviors});
      }
    }
  }

  // ---- Effects that do not come from sampling ------------------------------------------------
  function specials(ctx){
    const {slide,groups,state,live,model,link}=ctx;
    const byEl=new Map();live.forEach(p=>{if(!p.shape)return;if(!byEl.has(p.el))byEl.set(p.el,[]);byEl.get(p.el).push(p);});
    const g0=groups[0];
    const effectsOf=(shape,gi)=>model.effects[gi].filter(e=>e.shape===shape);
    const dropGeneric=(shape,gi)=>{model.effects[gi]=model.effects[gi].filter(e=>e.shape!==shape||e.repeat);};
    // Text that rises line by line, letters that fall, typing.
    for(const e of state.events){
      const g=groups[e.group],gi=e.group;
      if(e.type==='lines'){
        const p=(byEl.get(e.el)||[]).find(q=>q.kind==='text');
        if(!p)continue;
        dropGeneric(p.shape,gi);
        const lineEls=[...e.el.querySelectorAll(':scope > .mo-line')];
        p.body.paragraphs.forEach((par,i)=>{
          const idx=par.lineHost>=0?par.lineHost:Math.min(i,Math.max(0,lineEls.length-1));
          model.effects[gi].push({shape:p.shape,paragraphs:[i,i],cls:'entr',preset:[12,4],delay:Math.max(0,e.at+idx*e.stagger-g.start),behaviors:[
            {type:'visibility',value:'visible'},
            {type:'anim',attr:'ppt_y',dur:e.duration,decel:1,keys:[[0,'#ppt_y+#ppt_h'],[1,'#ppt_y']]},
            {type:'filter',filter:'wipe(down)',dir:'in',dur:e.duration,decel:1}]});
        });
      }
      if(e.type==='type'){
        const p=(byEl.get(e.el)||[]).find(q=>q.kind==='text');
        if(!p||!e.length)continue;
        dropGeneric(p.shape,gi);
        model.effects[gi].push({shape:p.shape,cls:'entr',preset:[1,0],delay:Math.max(0,e.at-g.start),iterate:{type:'lt',ms:Math.max(10,e.duration/e.length)},behaviors:[{type:'visibility',value:'visible'}]});
      }
      if(e.type==='ring'){
        const arc=[...e.el.querySelectorAll('.ring-value')].flatMap(el=>byEl.get(el)||[])[0];
        if(!arc)continue;
        const own=effectsOf(arc.shape,gi).find(x=>x.cls==='entr');
        const wheel={type:'filter',filter:'wheel(1)',dir:'in',dur:1200,decel:1};
        if(own){own.behaviors=own.behaviors.filter(b=>b.type!=='fade');wheel.at=Math.max(0,e.at-g.start-own.delay);own.behaviors.push(wheel);own.preset=[21,1];}
        else model.effects[gi].push({shape:arc.shape,cls:'entr',preset:[21,1],delay:Math.max(0,e.at-g.start),behaviors:[{type:'visibility',value:'visible'},wheel]});
      }
    }
    charsEffects(ctx,byEl,dropGeneric);
    // Arcs drawn by a stroke-dash animation (the closing meter): wheel in, as far as the first stop.
    for(const r of state.records){
      if(!r.keyframes.some(k=>k.strokeDasharray))continue;
      const p=(byEl.get(r.el)||[])[0];
      if(!p||p.dashDone)continue;
      p.dashDone=true;
      const last=parseFloat(r.keyframes.at(-1).strokeDasharray)/(p.dashLength||100);
      const shape=p.shape;
      if(last<.999){shape.geom='arc';shape.adj={adj1:0,adj2:360*last*60000};shape.fill=null;}
      // The stroke draws itself: a Wheel entrance; the arc keeps its own motion and exit.
      model.effects[r.group]=model.effects[r.group].filter(e=>e.shape!==shape||e.cls!=='entr');
      model.effects[r.group].push({shape,cls:'entr',preset:[21,1],delay:Math.max(0,r.start+(r.timing.delay||0)-groups[r.group].start),behaviors:[{type:'visibility',value:'visible'},{type:'filter',filter:'wheel(1)',dir:'in',dur:Number(r.timing.duration)||1000,decel:1}]});
    }
    // clip-path reveals: a Wipe from the side an inset opens from, a Split from the middle, or Strips from the corner
    // a collapsed polygon unfolds from. The clip hides the element's content too, so it takes the same entrance,
    // unless it has an entrance of its own later on (a caption rising after the card).
    for(const r of state.records){
      const k0=r.keyframes[0]?.clipPath;
      if(!k0)continue;
      const inset=/inset\(([^)]*)\)/.exec(k0),poly=/polygon\(([^)]*)\)/.exec(k0);
      let filter,preset;
      if(inset){
        const [t,ri,b,l]=inset[1].split(/\s+/).map(parseFloat);
        filter=l>=50&&ri>=50?'barn(outVertical)':ri>=99?'wipe(left)':l>=99?'wipe(right)':b>=99?'wipe(up)':t>=99?'wipe(down)':'wipe(left)';
        preset=filter.startsWith('barn')?[16,26]:[22,8];
      }else if(poly){
        const corners=poly[1].split(',').map(q=>q.trim().split(/\s+/).map(parseFloat));
        if(!corners.every(q=>q[0]===corners[0][0]&&q[1]===corners[0][1]))continue;
        const [x,y]=corners[0],down=y<50,right=x<50;
        filter='strips('+(down?'down':'up')+(right?'Right':'Left')+')';preset=[18,(down?4:1)+(right?2:8)];
      }else continue;
      const g=groups[r.group],at=r.start+(r.timing.delay||0)-g.start,dur=Number(r.timing.duration)||500;
      for(const p of live.filter(q=>q.shape&&q.lineage.includes(r.el))){
        const e=model.effects[r.group].find(x=>x.shape===p.shape&&x.cls==='entr');
        if(e&&p.el!==r.el&&e.delay>at+100)continue;
        const wipe={type:'filter',filter,dir:'in',dur};
        if(e){e.behaviors=e.behaviors.filter(x=>x.type!=='fade');wipe.at=Math.max(0,at-e.delay);e.behaviors.push(wipe);e.preset=preset;}
        else model.effects[r.group].push({shape:p.shape,cls:'entr',preset,delay:Math.max(0,at),behaviors:[{type:'visibility',value:'visible'},wipe]});
      }
    }
    // Bars growing from their left edge (scaleX from 0 to rest): a Wipe from the left instead of a stretch.
    for(const r of state.records){
      const [k0,k1]=r.keyframes;
      if(r.keyframes.length!==2||k0?.transform!=='scaleX(0)'||k1?.transform!=='none'||'opacity' in k0||r.timing.iterations===Infinity)continue;
      if(!/^0(px)?\s/.test(getComputedStyle(r.el).transformOrigin))continue;
      const at=r.start+(r.timing.delay||0)-groups[r.group].start,dur=Number(r.timing.duration)||500;
      for(const p of byEl.get(r.el)||[]){
        model.effects[r.group]=model.effects[r.group].filter(e=>e.shape!==p.shape);
        model.effects[r.group].push({shape:p.shape,cls:'entr',preset:[22,8],delay:Math.max(0,at),behaviors:[{type:'visibility',value:'visible'},{type:'filter',filter:'wipe(left)',dir:'in',dur,decel:1}]});
      }
    }
    // Spinner keeps turning.
    live.filter(p=>p.role==='spinner'&&p.shape).forEach(p=>model.effects[0].push({shape:p.shape,cls:'emph',preset:[8,0],delay:0,repeat:'indefinite',behaviors:[{type:'rotate',by:360,dur:1400}]}));
    counters(ctx,byEl);
    waves(ctx,link,g0);
  }
  function charsEffects(ctx,byEl,dropGeneric){
    const {state,groups,model}=ctx,owners=new Map();
    for(const r of state.records){
      if(!r.el.classList?.contains('mo-char'))continue;
      let owner=r.el.parentElement;while(owner&&owner.matches('.mo-line,.mo-line-i,.mo-char'))owner=owner.parentElement;
      const key=owner;if(!owners.has(key))owners.set(key,[]);owners.get(key).push(r);
    }
    for(const [owner,recs] of owners){
      const p=(byEl.get(owner)||[]).find(q=>q.kind==='text');
      if(!p)continue;
      const gi=recs[0].group,g=groups[gi];
      dropGeneric(p.shape,gi);
      const starts=recs.map(r=>r.start+(r.timing.delay||0)).sort((a,b)=>a-b);
      const stagger=starts.length>1?(starts.at(-1)-starts[0])/(starts.length-1):0;
      const dur=Number(recs[0].timing.duration)||600,frames=recs[0].keyframes;
      const masked=/translateY\(1\d\d%\)/.test(frames[0].transform||'')&&!recs[0].el.closest('.mo-open');
      const behaviors=[{type:'visibility',value:'visible'}];
      if(masked){
        behaviors.push({type:'anim',attr:'ppt_y',dur,decel:1,keys:[[0,'#ppt_y+#ppt_h'],[1,'#ppt_y']]},{type:'filter',filter:'wipe(down)',dir:'in',dur,decel:1});
      }else{
        const parsed=frames.map((k,i)=>({o:k.offset??i/(frames.length-1),op:k.opacity,...parseTransform(k.transform)}));
        const fadeEnd=parsed.find(k=>k.op!=null&&k.op>=1);
        if(parsed[0].op!=null&&parsed[0].op<1)behaviors.push({type:'fade',dir:'in',dur:Math.max(1,(fadeEnd?.o??.3)*dur)});
        if(parsed.some(k=>k.ty))behaviors.push({type:'anim',attr:'ppt_y',dur,keys:parsed.map(k=>[k.o,offset('ppt_y',k.ty||0,H)])});
        if(parsed.some(k=>k.sx!==1||k.sy!==1)){
          behaviors.push({type:'anim',attr:'ppt_w',dur,keys:parsed.map(k=>[k.o,'#ppt_w*'+fmt(k.sx)])},{type:'anim',attr:'ppt_h',dur,keys:parsed.map(k=>[k.o,'#ppt_h*'+fmt(k.sy)])});
        }
        if(parsed.some(k=>k.r))behaviors.push({type:'anim',attr:'style.rotation',dur,keys:parsed.map(k=>[k.o,k.r||0])});
      }
      model.effects[gi].push({shape:p.shape,cls:'entr',preset:masked?[12,4]:[31,0],delay:Math.max(0,starts[0]-g.start),iterate:{type:'lt',ms:Math.max(1,stagger)},behaviors});
    }
  }
  function parseTransform(value){
    const out={tx:0,ty:0,sx:1,sy:1,r:0};
    for(const m of String(value||'').matchAll(/(translate[XY]?|scale[XY]?|rotate)\(([^)]*)\)/g)){
      const args=m[2].split(/[\s,]+/).map(parseFloat);
      if(m[1]==='translate'){out.tx=args[0]||0;out.ty=args[1]||0;}
      if(m[1]==='translateX')out.tx=args[0]||0;
      if(m[1]==='translateY')out.ty=args[0]||0;
      if(m[1]==='scale'){out.sx=args[0];out.sy=args[1]??args[0];}
      if(m[1]==='scaleX')out.sx=args[0];
      if(m[1]==='scaleY')out.sy=args[0];
      if(m[1]==='rotate')out.r=args[0]||0;
    }
    return out;
  }
  // Loader percent and the closing meter count with a handful of fields; the last one stays.
  function counters(ctx,byEl){
    const {slide,state,groups,model,live,index}=ctx;
    const clones=(p,values)=>{
      const base=p.shape,i=ctx.model.shapes.indexOf(base);
      return values.map(v=>{
        const shape=JSON.parse(JSON.stringify(base));
        shape.text.paragraphs.forEach(par=>par.runs.forEach(r=>{r.text=r.text.replace(/\d+/,String(v));}));
        shape.name=(base.name.replace(/^!!/,'')+' '+v).trim();
        shape.x+=OFF;
        ctx.model.shapes.splice(i,0,shape);
        return shape;
      });
    };
    // Extra values wait off-slide (clean edit view) and step in only for their moment.
    const windowed=(shape,from,until,g,parked)=>{
      const b=[{type:'visibility',value:'visible',at:0}];
      if(parked)b.push({type:'anim',attr:'ppt_x',dur:1,keys:[[0,offset('ppt_x',-OFF,W)],[1,offset('ppt_x',-OFF,W)]]});
      if(Number.isFinite(until))b.push({type:'visibility',value:'hidden',at:Math.max(1,until-from)});
      model.effects[g.index].push({shape,cls:'entr',preset:[1,0],delay:Math.max(0,from-g.start),behaviors:b});
    };
    if(slide.loader){
      const p=live.find(q=>q.kind==='text'&&q.el.matches('.loader-percent'));
      if(p&&p.shape){
        const {from,to,duration}=slide.loader,points=window.DECK_MOTION.loaderPoints;
        const marks=points.map(([t])=>[t*duration,Math.round(window.DECK_MOTION.loaderValue(t,from,to))]).filter((m,i,a)=>!i||m[1]!==a[i-1][1]);
        const values=marks.map(m=>m[1]),finalValue=values.at(-1);
        const isMorphTarget=ctx.link.type==='morph';
        // On a Morph slide the first value is the static one (it continues the previous slide).
        const staticValue=isMorphTarget?values[0]:finalValue;
        const extra=clones(p,values.filter(v=>v!==staticValue));
        const staticShape=p.shape;
        staticShape.text.paragraphs.forEach(par=>par.runs.forEach(r=>{r.text=r.text.replace(/\d+/,String(staticValue));}));
        model.effects.forEach((list,gi)=>{model.effects[gi]=list.filter(e=>e.shape!==staticShape||e.repeat);});
        let k=0;
        marks.forEach(([t,v],i)=>{
          const until=marks[i+1]?.[0]??Infinity;
          if(v===staticValue){
            if(isMorphTarget&&i===0&&Number.isFinite(until))model.effects[0].push({shape:staticShape,cls:'exit',preset:[1,0],delay:until,behaviors:[{type:'visibility',value:'hidden',at:0}]});
            else if(!isMorphTarget)windowed(staticShape,t,Infinity,groups[0]);
            return;
          }
          windowed(extra[k++],t,until,groups[0],true);
        });
      }
    }
    const count=state.events.find(e=>e.type==='count'&&e.el.closest('.closing-meter'));
    if(count){
      const p=(byEl.get(count.el)||[]).find(q=>q.kind==='text');
      const snap=state.events.find(e=>e.type==='snap');
      if(p&&p.shape){
        const ease=window.DECK_MOTION.easing.bezier(.16,1,.3,1);
        const marks=[0,.06,.12,.2,.3,.45,.65,1].map(f=>[count.at+f*count.duration,Math.round(count.from+(count.to-count.from)*ease(f))]).filter((m,i,a)=>!i||m[1]!==a[i-1][1]);
        const shapes=clones(p,marks.map(m=>m[1]));
        const g=groups[count.group];
        marks.forEach(([t],i)=>windowed(shapes[i],t,marks[i+1]?.[0]??snap?.at??Infinity,g,true));
        model.effects[count.group]=model.effects[count.group].filter(e=>e.shape!==p.shape||e.repeat);
        if(snap)windowed(p.shape,snap.at,Infinity,g);
      }
    }
    void index;
  }
  // Facet waves: the previous colour is the background, the new one tiles in.
  function waves(ctx,link,g0){
    const {model,slide}=ctx,wave=ctx.state.events.find(e=>e.type==='wave');
    const W2=W/2;
    if(!wave)return;
    const shapes=[],effects=[],dur=wave.duration;
    if(wave.base==='split'){model.background='111111';shapes.push({name:'Tło – poprzedni slajd',x:W2,y:0,w:W2,h:H,fill:{color:'FAF8F5'},line:null});}
    else model.background=String(wave.base).replace('#','');
    wave.tris.forEach((t,i)=>{
      const xs=t.map(p=>p[0]),ys=t.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys);
      const fill=String(wave.colors[i]).replace('#','');
      const shape={name:'Tło – fasetka '+(i+1),x:x0,y:y0,w:Math.max(...xs)-x0,h:Math.max(...ys)-y0,points:t.map(([x,y])=>[x-x0,y-y0]),fill:{color:fill},line:{color:fill,width:1.6,join:'round'}};
      const behaviors=[{type:'visibility',value:'visible'}];
      if(wave.flash)behaviors.push({type:'color',to:String(wave.flash[i]).replace('#',''),dur:1},{type:'color',to:fill,at:dur*.22,dur:dur*.4});
      behaviors.push({type:'anim',attr:'ppt_w',dur:dur*.8,decel:1,keys:[[0,0],[1,'#ppt_w']]},{type:'anim',attr:'ppt_h',dur:dur*.8,decel:1,keys:[[0,0],[1,'#ppt_h']]},{type:'anim',attr:'style.rotation',dur:dur*.8,decel:1,keys:[[0,wave.turns[i]],[1,0]]});
      shapes.push(shape);
      effects.push({shape,cls:'entr',preset:[31,0],delay:Math.max(0,wave.at+wave.delays[i]+dur*.2-g0.start),behaviors});
    });
    const finish=Math.max(...wave.delays)+dur+wave.at;
    if(slide.layout.includes('worlds')){
      // The split background ends clean, without the triangles' jagged middle seam.
      [['111111',0],['FAF8F5',W2]].forEach(([c,x])=>{const s={name:'Tło – połowa',x,y:0,w:W2,h:H,fill:{color:c},line:null};shapes.push(s);effects.push({shape:s,cls:'entr',preset:[10,0],delay:finish,behaviors:[{type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:200}]});});
    }
    // Anything already on screen when the slide starts appears with the wave instead of before it.
    const mid=wave.at+Math.max(...wave.delays)*.5+dur*.5;
    const entering=new Set(model.effects.flat().filter(e=>e.cls==='entr').map(e=>e.shape));
    for(const shape of model.shapes){
      if(entering.has(shape)||shape.x>=W)continue;
      model.effects[0].push({shape,cls:'entr',preset:[10,0],delay:mid,behaviors:[{type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:300}]});
    }
    model.shapes.unshift(...shapes);
    model.effects[0].push(...effects);
  }

  // ---- Google Slides: the resting state of every step, simple fades ---------------------------
  // Google Slides keeps fade and appear effects but drops motion paths, emphasis, Morph, delays,
  // letter spacing and exact line spacing. Each slide shows its resting state; a click fades in what
  // appears at that step and fades out what disappears. Every text line is a box of its own.
  const FADE_IN=400,FADE_OUT=300;
  const fadeIn=shape=>({shape,cls:'entr',preset:[10,0],delay:0,behaviors:[{type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:FADE_IN}]});
  const fadeOut=shape=>({shape,cls:'exit',preset:[10,0],delay:0,behaviors:[{type:'fade',dir:'out',dur:FADE_OUT},{type:'visibility',value:'hidden',at:FADE_OUT-1}]});
  function lineBoxes(shape){
    const ps=shape.text.paragraphs;
    if(shape.text.anchor!=='t'||ps.length<2)return [{...shape,text:{...shape.text,paragraphs:ps.map(p=>({...p,lineHeight:0}))}}];
    const rot=(shape.rot||0)*Math.PI/180,cx=shape.x+shape.w/2,cy=shape.y+shape.h/2;
    let y=shape.y;
    return ps.map((par,i)=>{
      y+=par.before||0;
      const h=par.lineHeight||shape.h/ps.length,dy=y+h/2-cy,lcx=cx-dy*Math.sin(rot),lcy=cy+dy*Math.cos(rot);
      y+=h;
      return {...shape,name:shape.name+' · '+(i+1),x:lcx-shape.w/2,y:lcy-h/2,h,text:{...shape.text,anchor:'ctr',paragraphs:[{...par,before:0,lineHeight:0}]}};
    });
  }
  // Colours that change at a click (a button turning red, a highlighted card) split a shape into states.
  function paintOf(p){
    const cs=getComputedStyle(p.el);
    if(p.kind==='text')return cs.color+'|'+(p.pseudoText??p.nodes.map(n=>n.textContent).join(''));
    if(p.svg)return cs.fill+'|'+cs.stroke;
    return cs.backgroundColor+'|'+cs.borderTopColor+'|'+cs.outlineColor;
  }
  function repaint(p){
    const cs=getComputedStyle(p.el);
    if(p.svg){
      const f=color(cs.fill),k=color(cs.stroke);
      if(p.fill&&cs.fill!=='none')p.fill={color:f.hex,alpha:f.a*number(cs.fillOpacity,1)};
      if(p.line&&cs.stroke!=='none')p.line={...p.line,color:k.hex,alpha:k.a*number(cs.strokeOpacity,1)};
    }else if(p.role==='box'){
      if(p.fill&&!p.fill.gradient){const c=color(cs.backgroundColor);p.fill={color:c.hex,alpha:c.a};}
      if(p.line){const c=color(cs.borderTopColor);p.line={...p.line,color:c.hex,alpha:c.a};}
    }else if(p.role==='outline'){const c=color(cs.outlineColor);p.line={...p.line,color:c.hex,alpha:c.a};}
  }
  function exportSlideSimple(session,index,assets){
    const slide=window.HOMO_DECK.slides[index];
    const {article,groups,state}=captureSlide(session,index);
    const ends=groups.map(g=>g.end);
    let frame=frameOf(article);
    // Looping motion (blinking, tapping, drifting) rests at its first frame.
    const setTime=t=>{
      session.setTime(t);
      for(const r of state.records)if(r.timing.iterations===Infinity&&r.anim.playState!=='idle')r.anim.currentTime=0;
      frame=frameOf(article);
    };
    setTime(ends.at(-1));
    const background=backgroundOf(article,slide);
    // Sparks, the cursor, cut overlays and blurred glows only exist in motion.
    const prims=collect(article,frame).filter(p=>!p.softEdge&&!p.el.closest('.mo-fx,.mo-cursor,.mo-overlay,.mo-typing,.mo-rule'));
    prims.sort((a,b)=>a.z-b.z||a.order-b.order);
    const sized=s=>s.m?Math.hypot(s.m[0],s.m[1])*Math.hypot(s.m[2],s.m[3])>1e-6:s.w*Math.hypot(s.l[0],s.l[1])>.5&&s.h*Math.hypot(s.l[2],s.l[3])>.5;
    const samples=prims.map(()=>[]);
    ends.forEach(t=>{setTime(t);prims.forEach((p,i)=>{const s=measure(p,frame,t,state);if(s.alive)s.paint=paintOf(p);samples[i].push(s.alive&&s.presence>.01&&sized(s)?s:null);});});
    const same=(a,b)=>{
      if(!a||!b)return a===b;
      if(Math.abs(a.presence-b.presence)>.05||a.paint!==b.paint)return false;
      if(a.m)return a.m.every((v,i)=>Math.abs(v-b.m[i])<(i>3?.75:.005))&&a.d===b.d;
      return Math.abs(a.cx-b.cx)<.75&&Math.abs(a.cy-b.cy)<.75&&Math.abs(a.w-b.w)<.75&&Math.abs(a.h-b.h)<.75&&a.l.every((v,i)=>Math.abs(v-b.l[i])<.005);
    };
    const model={shapes:[],effects:groups.map(()=>[]),background},names=new Set();
    // The split background of the two-plans slide is the slide's own gradient.
    if(slide.layout.includes('worlds')){model.background='111111';model.shapes.push({name:'Tło – jasna połowa',x:W/2,y:0,w:W/2,h:H,fill:{color:'FAF8F5'},line:null});}
    prims.forEach((p,i)=>{
      const list=samples[i];
      for(let a=0;a<list.length;a++){
        if(!list[a])continue;
        let b=a;while(b+1<list.length&&same(list[a],list[b+1]))b++;
        const s=list[a];
        setTime(ends[a]);
        Object.assign(p,{staticSample:s,transient:false,maxPresence:s.presence});
        repaint(p);
        if(p.kind==='text'){const layout=textLayout(p,frame,assets.glyphs);if(!layout){a=b;continue;}Object.assign(p,{local:layout.local,body:layout});}
        if(p.svg){if(p.feature&&s.d)p.points=parsePath(s.d);prepareSvg(p);}
        p.base=pose(p,s);
        const shape=shapeOf(p,names,index);
        const shapes=shape.textBox?lineBoxes(shape):[shape];
        model.shapes.push(...shapes);
        if(a>0)shapes.forEach(x=>model.effects[a].push(fadeIn(x)));
        if(b<list.length-1)shapes.forEach(x=>model.effects[b+1].push(fadeOut(x)));
        a=b;
      }
    });
    setTime(ends.at(-1));
    return {model,groups,link:{type:index?'plain':'none'}};
  }

  // ---- Deck ---------------------------------------------------------------------------------
  async function bytesOf(url){const r=await fetch(url);if(!r.ok)throw new Error('Nie można wczytać '+url);return new Uint8Array(await r.arrayBuffer());}
  // Speaker notes are the presenter's script only, one paragraph per line.
  function notesOf(slide){return slide.notes;}
  function backgroundOf(article,slide){
    if(slide.layout.includes('worlds'))return '111111';
    return color(getComputedStyle(article).backgroundColor).hex;
  }
  async function exportDeck({onProgress=()=>{},target='powerpoint'}={}){
    const simple=target==='google';
    const writer=window.DECK_PPTX_WRITER,slides=window.HOMO_DECK.slides;
    const stage=document.querySelector('#stage');
    onProgress('Wczytuję fonty i obrazy…',0);
    const fonts={regular:await bytesOf('assets/fonts/Lato-Regular.ttf'),bold:await bytesOf('assets/fonts/Lato-Bold.ttf'),black:await bytesOf('assets/fonts/Lato-Black.ttf')};
    const assets={glyphs:coverage(fonts.regular)};
    const deck=writer.createPresentation({title:document.title,author:'Uliana Jelonek i Joanna Wysocka'});
    deck.addFont({typeface:'Lato',style:'regular',ttf:fonts.regular});
    deck.addFont({typeface:'Lato',style:'bold',ttf:fonts.bold});
    deck.addFont({typeface:'Lato Black',style:'regular',ttf:fonts.black});
    // Images sized by CSS width alone (logos) measure zero until decoded; the capture runs on a virtual clock, so decode them first.
    const preloaded=[...new Set(slides.flatMap(s=>[...s.html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1])))].map(src=>{const img=new Image();img.src=src;return img;});
    await Promise.all(preloaded.map(img=>img.decode().catch(()=>{})));
    const media=new Map();
    const session=createSession(stage,{simple});
    const results=[];
    session.install();
    try{
      for(let i=0;i<slides.length;i++){
        onProgress('Slajd '+(i+1)+' z '+slides.length,i/slides.length);
        await breathe();
        results.push(simple?exportSlideSimple(session,i,assets):exportSlide(session,i,assets));
      }
    }finally{session.uninstall();}
    onProgress('Składam plik…',1);
    for(let i=0;i<results.length;i++){
      const {model,groups,link}=results[i],slide=slides[i];
      for(const shape of model.shapes)if(shape.kind==='picture'){
        if(!media.has(shape.src))media.set(shape.src,deck.addMedia(await bytesOf(shape.src),/\.jpe?g$/i.test(shape.src)?'jpeg':'png'));
        shape.media=media.get(shape.src);
      }
      const transition=link.type==='plain'?{type:'plain',duration:600}:link.type==='morph'?{type:'morph',duration:550}:link.type==='wave'?{type:'fade',duration:200}:null;
      const timing={groups:groups.map((g,gi)=>({trigger:g.trigger,effects:model.effects[gi].sort((a,b)=>a.delay-b.delay)}))};
      deck.addSlide({name:slide.title,background:model.background,shapes:model.shapes,notes:notesOf(slide),transition,timing});
    }
    return deck.build();
  }
  let busy=false;
  async function exportAndDownload({target='powerpoint'}={}){
    const filename=target==='google'?'Homo-Urgens-Google.pptx':'Homo-Urgens.pptx';
    if(busy)return;busy=true;
    const ui=document.createElement('div');
    ui.className='pptx-progress';ui.setAttribute('role','status');
    ui.innerHTML='<strong>Eksport PPTX</strong><span>Przygotowuję…</span><i><b></b></i>';
    document.body.append(ui);
    const wasEditing=Boolean(window.DECK_EDITOR?.isEditing());
    if(wasEditing)window.DECK_EDITOR.toggle();
    const before=window.DECK_NAV.getState();
    try{
      const bytes=await exportDeck({target,onProgress:(text,f)=>{ui.querySelector('span').textContent=text;ui.querySelector('b').style.width=Math.round(f*100)+'%';}});
      const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}));
      const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
      realTimeout(()=>URL.revokeObjectURL(url),4000);
      ui.querySelector('span').textContent='Gotowe: '+filename;
      return bytes;
    }catch(error){
      console.error(error);ui.querySelector('span').textContent='Eksport się nie udał: '+error.message;
      throw error;
    }finally{
      window.DECK_NAV.show(before.index,before.step,'refresh');
      if(wasEditing)window.DECK_EDITOR.toggle();
      realTimeout(()=>ui.remove(),2600);busy=false;
    }
  }
  window.DECK_PPTX={export:exportAndDownload,build:exportDeck};
})();
