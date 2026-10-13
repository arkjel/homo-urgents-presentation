/* "Homo Urgens": an authored low-poly girl in the conference heart's facet style.
 * Every facet is its own path, so she can assemble, shatter and change expression.
 * Coordinates use a 200 × 340 box; the feet stand on y = 330.
 */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const RED='#ee312f',MID='#cf1723',DARK='#95161d',INK='#151515',LIPS='#8e1219';
  const HAIR=['#c07c49','#9c6037','#7a4627','#5d331c'];
  const P=points=>'M'+points.map(p=>p.join(' ')).join('L')+'Z';
  const mirror=points=>points.map(([x,y])=>[200-x,y]);
  const headCenter=[94,72];
  const hex=[[100,20],[150,42],[152,106],[100,134],[48,106],[50,42]];
  // Expressions keep a fixed vertex count per feature, so every change is a true morph.
  // Eyes carry a lash at the outer corner.
  const EYE={
    rest:[[75,67],[80,67],[85,67],[85,85],[80,85],[75,85],[75,71],[69,63]],
    bored:[[75,74],[80,74],[85,74],[85,84],[80,84],[75,84],[75,76],[69,71]],
    annoyed:[[75,72],[80,73],[85,74],[85,84],[80,84],[75,84],[75,75],[69,69]],
    furious:[[75,72],[80,74.5],[85,77],[85,84],[80,84],[75,84],[75,75],[69,68]],
    happy:[[73,80],[80,72],[87,80],[84,83],[80,78],[76,83],[75,82],[68,77]]
  };
  const BROW={
    rest:[[70,56],[91,54],[91,58],[70,60]],
    bored:[[70,60],[91,60],[91,63],[70,63]],
    annoyed:[[70,53],[92,58],[92,62],[70,57]],
    furious:[[69,49],[93,60],[93,65],[69,54]],
    happy:[[70,50],[91,48],[91,52],[70,54]]
  };
  const MOUTH={
    rest:[[91,106],[100,107],[109,106],[109,110],[100,111],[91,110]],
    bored:[[89,110],[100,108],[111,110],[111,113],[100,111],[89,113]],
    annoyed:[[89,112],[100,106],[111,112],[111,115],[100,110],[89,115]],
    furious:[[87,104],[100,102],[113,104],[109,120],[100,123],[91,120]],
    happy:[[85,103],[100,105],[115,103],[111,113],[100,120],[89,113]]
  };
  const BLUSH={rest:0,bored:0,annoyed:.14,furious:.48,happy:0};
  // Joint rotations in degrees; body uses translate and scale for squash and stretch.
  const POSES={
    rest:{armL:{r:8},armR:{r:-8},foreL:{r:-6},foreR:{r:6}},
    watch:{armL:{r:20},foreL:{r:-147},armR:{r:-8},foreR:{r:6},head:{r:-7},look:{x:-3,y:4}},
    cross:{armL:{r:-15},foreL:{r:-75},armR:{r:15},foreR:{r:70},head:{r:3}},
    crouch:{body:{sx:1.12,sy:.84},armL:{r:34},armR:{r:-34},foreL:{r:-20},foreR:{r:20},head:{r:0}},
    jump:{body:{y:-80,sx:.9,sy:1.14},armL:{r:150},foreL:{r:25},armR:{r:-150},foreR:{r:-25}},
    up:{armL:{r:150},foreL:{r:25},armR:{r:-150},foreR:{r:-25},head:{r:-3}},
    thumb:{armL:{r:8},foreL:{r:-6},armR:{r:-24},foreR:{r:114},thumb:{s:1},head:{r:-5}}
  };
  // The long hair hangs behind the body but turns with the head, so it shares the head's joint.
  const JOINTS={body:[100,330],head:[100,134],hairBack:[100,134],armL:[64,152],foreL:[64,199],armR:[136,152],foreR:[136,199],legL:[89,258],legR:[111,258],footL:[64,330],footR:[104,330],look:[100,76]};
  const poseOf=(pose,joint)=>pose[joint==='hairBack'?'head':joint]||{};
  const transformOf=({x=0,y=0,r=0,s,sx=s??1,sy=s??1}={})=>'translate('+x+'px,'+y+'px) rotate('+r+'deg) scale('+sx+','+sy+')';
  function el(name,attrs={},parent){
    const node=document.createElementNS(NS,name);
    for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);
    parent?.append(node);return node;
  }
  // Facets are numbered in build order, so the same body part keeps its name on every slide (PPTX Morph).
  let partIndex=0;
  function facet(parent,points,fill,extra={}){return el('path',{d:P(points),fill,'data-part':String(++partIndex),...extra},parent);}
  function pivot(node,[x,y]){node.style.transformBox='view-box';node.style.transformOrigin=x+'px '+y+'px';return node;}
  function joint(parent,name){return pivot(el('g',{class:'m-'+name},parent),JOINTS[name]);}
  function hairBack(parent){
    const back=joint(parent,'hairBack'),sway=pivot(el('g',{class:'m-hairSway'},back),[100,30]);
    facet(sway,[[56,88],[144,88],[140,176],[60,176]],HAIR[3]);
    // Shoulder-length: outer contour and inner line of one side; the other is its mirror, one shade darker.
    const A=[100,4],B=[56,14],C=[35,50],D=[29,100],E=[32,142],F=[40,176],T=[51,186],I1=[78,30],I2=[55,80],I3=[57,124],I4=[66,176];
    const strand=[[A,B,I1,0],[B,C,I1,1],[C,I2,I1,0],[C,D,I2,1],[D,I3,I2,2],[D,E,I3,1],[E,I4,I3,2],[E,F,T,1],[E,T,I4,2]];
    for(const [a,b,c,shade] of strand)facet(sway,[a,b,c],HAIR[shade]);
    for(const [a,b,c,shade] of strand)facet(sway,mirror([a,b,c]),HAIR[Math.min(3,shade+1)]);
    facet(sway,[A,I1,mirror([I1])[0]],HAIR[1]);
    return back;
  }
  function arm(parent,side){
    const flip=side==='R'?mirror:p=>p;
    const a=joint(parent,'arm'+side);
    facet(a,flip([[54,148],[74,148],[73,177],[56,177]]),side==='L'?RED:MID);
    facet(a,flip([[57,176],[72,176],[71,200],[58,200]]),side==='L'?'#e8e8e8':'#d2d2d2');
    const fore=joint(a,'fore'+side);
    facet(fore,flip([[58,198],[71,198],[70,237],[59,237]]),side==='L'?'#f4f4f4':'#dedede');
    if(side==='L'){
      facet(fore,[[57,223],[72,223],[72,233],[57,233]],INK,{class:'m-watch'});
      facet(fore,[[61,225],[68,225],[68,231],[61,231]],'#fff');
    }
    facet(fore,flip([[56,235],[73,235],[74,247],[69,256],[60,256],[55,247]]),side==='L'?'#fafafa':'#e4e4e4');
    if(side==='R'){
      const thumb=facet(fore,[[111,239],[128,238],[128,247],[111,247]],'#e4e4e4',{class:'m-thumb'});
      thumb.style.transformBox='fill-box';thumb.style.transformOrigin='100% 50%';thumb.style.transform='scale(0)';
    }
    return a;
  }
  function build(){
    partIndex=0;
    const svg=el('svg',{viewBox:'0 0 200 340',class:'mascot-svg','aria-hidden':'true',focusable:'false'});
    const shake=el('g',{class:'m-shake'},svg);
    const breath=el('g',{class:'m-breath'},shake);
    const body=joint(breath,'body');
    hairBack(body);
    for(const side of ['L','R']){
      const leg=joint(body,'leg'+side);
      if(side==='L'){facet(leg,[[82,256],[97,256],[85,312]],'#e2e2e2');facet(leg,[[97,256],[95,312],[85,312]],'#cdcdcd');}
      else{facet(leg,[[103,256],[115,312],[105,312]],'#d2d2d2');facet(leg,[[103,256],[118,256],[115,312]],'#bababa');}
      const foot=joint(leg,'foot'+side),tap=pivot(el('g',{class:'m-tap'+side},foot),JOINTS['foot'+side]);
      if(side==='L'){facet(tap,[[74,310],[98,310],[100,322],[62,320]],'#f2f2f2');facet(tap,[[62,320],[100,322],[98,330],[60,330]],RED);}
      else{facet(tap,[[102,310],[126,310],[138,320],[100,322]],'#dcdcdc');facet(tap,[[100,322],[138,320],[140,330],[102,330]],MID);}
    }
    facet(body,[[92,128],[108,128],[108,146],[92,146]],'#c4c4c4');
    // A red A-line dress, shaded like the heart: light from the upper left.
    const dress=el('g',{class:'m-dress'},body);
    facet(dress,[[62,150],[100,140],[100,186]],RED);
    facet(dress,[[100,140],[138,150],[100,186]],MID);
    facet(dress,[[62,150],[100,186],[100,198],[72,198]],MID);
    facet(dress,[[138,150],[128,198],[100,198],[100,186]],DARK);
    facet(dress,[[72,196],[100,196],[76,262]],RED);
    facet(dress,[[72,196],[76,262],[46,262]],MID);
    facet(dress,[[100,196],[100,262],[76,262]],MID);
    facet(dress,[[100,196],[124,262],[100,262]],DARK);
    facet(dress,[[100,196],[128,196],[124,262]],MID);
    facet(dress,[[128,196],[154,262],[124,262]],DARK);
    const head=joint(body,'head');
    ['#ececec','#dadada','#cecece','#e2e2e2','#f3f3f3','#fbfbfb'].forEach((fill,i)=>facet(head,[hex[i],hex[(i+1)%6],headCenter],fill));
    const blush=facet(head,hex,RED,{class:'m-blush'});blush.style.opacity='0';
    // Fringe and the two locks that frame the face.
    const fringe=el('g',{class:'m-fringe'},head);
    facet(fringe,[[46,48],[100,12],[68,54]],HAIR[1]);
    facet(fringe,[[68,54],[100,12],[102,46]],HAIR[0]);
    facet(fringe,[[102,46],[100,12],[134,54]],HAIR[1]);
    facet(fringe,[[134,54],[100,12],[156,46]],HAIR[2]);
    facet(fringe,[[43,44],[60,54],[54,114],[40,128]],HAIR[0]);
    facet(fringe,mirror([[43,44],[60,54],[54,114],[40,128]]),HAIR[2]);
    const look=joint(head,'look');
    const blink=pivot(el('g',{class:'m-blink'},look),[100,76]);
    const eyeL=facet(blink,EYE.rest,INK,{'data-feature':'oko L'}),eyeR=facet(blink,mirror(EYE.rest),INK,{'data-feature':'oko P'});
    const browL=facet(head,BROW.rest,INK,{'data-feature':'brew L'}),browR=facet(head,mirror(BROW.rest),INK,{'data-feature':'brew P'});
    const mouth=facet(head,MOUTH.rest,LIPS,{'data-feature':'usta'});
    arm(body,'L');arm(body,'R');
    const steam=el('g',{class:'m-steam'},shake);
    [[48,2,DARK],[152,4,MID],[100,-28,DARK]].forEach(([x,y,fill])=>{
      const puff=facet(steam,[[x-9,y+8],[x,y-10],[x+9,y+8]],fill);
      puff.style.opacity='0';puff.style.transformBox='fill-box';puff.style.transformOrigin='center';
    });
    const parts={svg,shake,breath,body,head,blush,look,blink,eyeL,eyeR,browL,browR,mouth,steam,
      hairSway:svg.querySelector('.m-hairSway'),thumb:svg.querySelector('.m-thumb'),tapR:svg.querySelector('.m-tapR')};
    for(const name of Object.keys(JOINTS))parts[name]||=svg.querySelector('.m-'+name);
    return parts;
  }
  // Keep the newest animation per element: an older, longer move must not overwrite a newer pose.
  const latest=new WeakMap();
  const settle=animation=>{
    const target=animation.effect.target;latest.set(target,animation);
    return animation.finished.then(()=>{if(latest.get(target)===animation){try{animation.commitStyles();}catch{}}animation.cancel();},()=>{});
  };
  function create({width=260}={}){
    const root=document.createElement('div');
    root.className='mo-mascot';root.setAttribute('aria-hidden','true');root.style.width=width+'px';
    const parts=build();root.append(parts.svg);
    const state={pose:{},face:'rest'},loops=new Map();
    const featurePaths=name=>({eyeL:EYE[name],eyeR:mirror(EYE[name]),browL:BROW[name],browR:mirror(BROW[name]),mouth:MOUTH[name]});
    function setPose(name){
      const pose=POSES[name]||{};
      for(const joint of Object.keys(JOINTS)){state.pose[joint]=poseOf(pose,joint);parts[joint].style.transform=transformOf(state.pose[joint]);}
      parts.thumb.style.transform='scale('+(pose.thumb?.s??0)+')';
    }
    function setFace(name){
      state.face=name;
      for(const [k,points] of Object.entries(featurePaths(name))){parts[k].style.d='path("'+P(points)+'")';}
      parts.blush.style.opacity=String(BLUSH[name]);
    }
    function pose(name,{duration=420,easing='cubic-bezier(.2,.8,.2,1)',delay=0}={}){
      const target=POSES[name]||{},runs=[];
      for(const joint of Object.keys(JOINTS)){
        const from=transformOf(state.pose[joint]),to=transformOf(poseOf(target,joint));
        state.pose[joint]=poseOf(target,joint);
        if(from!==to)runs.push(settle(parts[joint].animate([{transform:from},{transform:to}],{duration,easing,delay,fill:'both'})));
      }
      const thumbTo='scale('+(target.thumb?.s??0)+')';
      if(parts.thumb.style.transform!==thumbTo)runs.push(settle(parts.thumb.animate([{transform:parts.thumb.style.transform},{transform:thumbTo}],{duration:duration*.8,delay:delay+duration*.4,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'both'})));
      return Promise.all(runs);
    }
    function face(name,{duration=240,delay=0}={}){
      const from=featurePaths(state.face),to=featurePaths(name),runs=[];
      for(const k of Object.keys(to))runs.push(settle(parts[k].animate([{d:'path("'+P(from[k])+'")'},{d:'path("'+P(to[k])+'")'}],{duration,delay,easing:'cubic-bezier(.3,.7,.2,1)',fill:'both'})));
      runs.push(settle(parts.blush.animate([{opacity:BLUSH[state.face]},{opacity:BLUSH[name]}],{duration:duration*2,delay,fill:'both'})));
      state.face=name;
      return Promise.all(runs);
    }
    function loop(name,options={}){
      stopLoop(name);
      const runs=[];
      if(name==='blink')runs.push(parts.blink.animate([{transform:'scaleY(1)'},{transform:'scaleY(1)',offset:.94},{transform:'scaleY(.08)',offset:.97},{transform:'scaleY(1)'}],{duration:3400,iterations:Infinity,delay:options.delay??600}));
      if(name==='breathe'){
        runs.push(parts.breath.animate([{transform:'translateY(0) scaleY(1)'},{transform:'translateY(-3px) scaleY(1.012)'}],{duration:1700,iterations:Infinity,direction:'alternate',easing:'ease-in-out'}));
        runs.push(parts.hairSway.animate([{transform:'rotate(-1deg)'},{transform:'rotate(1.2deg) scaleX(1.02)'}],{duration:3200,iterations:Infinity,direction:'alternate',easing:'ease-in-out'}));
      }
      if(name==='tap'){
        const period=options.period??620;
        runs.push(parts.tapR.animate([{transform:'rotate(0deg)'},{transform:'rotate(-22deg)',offset:.35},{transform:'rotate(0deg)',offset:.6},{transform:'rotate(0deg)'}],{duration:period,iterations:Infinity,easing:'cubic-bezier(.3,0,.3,1)'}));
        runs.push(parts.breath.animate([{transform:'translateY(0)'},{transform:'translateY(-2px)',offset:.35},{transform:'translateY(0)',offset:.6},{transform:'translateY(0)'}],{duration:period,iterations:Infinity}));
      }
      if(name==='shake'){
        const a=options.amount??2;
        runs.push(parts.shake.animate([{transform:'translate(0,0)'},{transform:'translate('+a+'px,'+(-a/2)+'px)'},{transform:'translate('+(-a)+'px,'+(a/2)+'px)'},{transform:'translate('+(a/2)+'px,'+a/2+'px)'},{transform:'translate(0,0)'}],{duration:180,iterations:Infinity}));
      }
      if(name==='steam')Array.from(parts.steam.children).forEach((puff,i)=>runs.push(puff.animate([
        {opacity:0,transform:'translateY(10px) scale(.4) rotate(0deg)'},
        {opacity:.95,transform:'translateY(-14px) scale(1) rotate(40deg)',offset:.3},
        {opacity:0,transform:'translateY(-62px) scale(1.25) rotate(120deg)'}
      ],{duration:options.period??1100,iterations:Infinity,delay:i*(options.period??1100)/3,easing:'ease-out'})));
      // Anger lifts the hair: a quick, bristling sway.
      if(name==='hair')runs.push(parts.hairSway.animate([{transform:'none'},{transform:'rotate(2.4deg) scaleX(1.06)'},{transform:'rotate(-2.4deg) scaleX(1.04)'},{transform:'none'}],{duration:options.period??480,iterations:Infinity}));
      loops.set(name,runs);
      return runs;
    }
    function stopLoop(name){(loops.get(name)||[]).forEach(a=>a.cancel());loops.delete(name);}
    function facets(){return Array.from(parts.svg.querySelectorAll('path')).filter(p=>!p.closest('.m-steam')&&p!==parts.blush&&p!==parts.thumb);}
    function scatter(path,i,distance){
      const box=path.getBBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
      const angle=Math.atan2(cy-190,cx-100)+(Math.sin(i*12.9898)*.6);
      const reach=distance*(.6+((i*7919)%13)/26);
      return 'translate('+(Math.cos(angle)*reach).toFixed(1)+'px,'+(Math.sin(angle)*reach-distance*.25).toFixed(1)+'px) rotate('+((i%2?1:-1)*(120+(i*37)%160))+'deg) scale(.25)';
    }
    function shatter({distance=320,duration=720,delay=0}={}){
      parts.blush.animate([{opacity:parts.blush.style.opacity||0},{opacity:0}],{duration:120,delay,fill:'forwards'});
      return Promise.all(facets().map((path,i)=>{
        path.style.transformBox='fill-box';path.style.transformOrigin='center';
        return path.animate([{transform:'none',opacity:1},{transform:scatter(path,i,distance),opacity:0}],{duration:duration*(.75+(i%5)/10),delay:delay+(i%7)*12,easing:'cubic-bezier(.15,.6,.3,1)',fill:'forwards'}).finished.catch(()=>{});
      }));
    }
    function assemble({distance=260,duration=760,delay=0,stagger=420}={}){
      const list=facets();
      return Promise.all(list.map((path,i)=>{
        path.style.transformBox='fill-box';path.style.transformOrigin='center';
        const wait=delay+((i*53)%list.length)/list.length*stagger;
        return path.animate([{transform:scatter(path,i,distance),opacity:0},{opacity:1,offset:.35},{transform:'none',opacity:1}],{duration,delay:wait,easing:'cubic-bezier(.2,.9,.25,1.12)',fill:'backwards'}).finished.catch(()=>{});
      }));
    }
    function cancel(){for(const name of [...loops.keys()])stopLoop(name);parts.svg.getAnimations({subtree:true}).forEach(a=>a.cancel());}
    setPose('rest');setFace('rest');
    return {el:root,parts,setPose,setFace,pose,face,loop,stopLoop,shatter,assemble,cancel};
  }
  window.DECK_MASCOT={create,poses:Object.keys(POSES),faces:Object.keys(EYE)};
})();
