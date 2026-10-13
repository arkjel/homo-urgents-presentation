/* Writes a PowerPoint (.pptx) package from a plain description of slides, shapes and animations.
 * No DOM and no libraries: the same file runs in the browser (export button) and in Node (tests).
 * Units: CSS pixels on a 1920 × 1080 slide; 1 px = 6350 EMU = 0.5 pt.
 */
(function(global){
  const EMU=6350,SLIDE={w:1920,h:1080};
  const NS={
    a:'http://schemas.openxmlformats.org/drawingml/2006/main',
    r:'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    p:'http://schemas.openxmlformats.org/presentationml/2006/main',
    p14:'http://schemas.microsoft.com/office/powerpoint/2010/main',
    p159:'http://schemas.microsoft.com/office/powerpoint/2015/09/main',
    mc:'http://schemas.openxmlformats.org/markup-compatibility/2006',
    rel:'http://schemas.openxmlformats.org/package/2006/relationships',
    ct:'http://schemas.openxmlformats.org/package/2006/content-types'
  };
  const RT='http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
  const CT='application/vnd.openxmlformats-officedocument.presentationml.';
  const ROOT_NS='xmlns:a="'+NS.a+'" xmlns:r="'+NS.r+'" xmlns:p="'+NS.p+'"';
  const HEAD='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

  const emu=px=>Math.round(px*EMU);
  const pct=f=>Math.round(f*100000);
  const ms=v=>Math.max(0,Math.round(v));
  const num=v=>Number.isInteger(v)?String(v):(Math.round(v*1e6)/1e6).toString();
  const esc=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const hex=c=>{const v=String(c||'000000').replace('#','').toUpperCase();return (v.length===3?v.replace(/./g,'$&$&'):v.padStart(6,'0')).slice(0,6);};
  function clr(color,alpha=1){
    const a=alpha<1?'<a:alpha val="'+Math.max(0,Math.round(alpha*100000))+'"/>':'';
    return '<a:srgbClr val="'+hex(color)+'"'+(a?'>'+a+'</a:srgbClr>':'/>');
  }

  // ---- Shapes ---------------------------------------------------------------------------
  function fillXml(fill){
    if(!fill)return '<a:noFill/>';
    if(fill.gradient){
      const g=fill.gradient;
      const stops=g.stops.map(s=>'<a:gs pos="'+Math.round(Math.min(1,Math.max(0,s.pos))*100000)+'">'+clr(s.color,s.alpha??1)+'</a:gs>').join('');
      return '<a:gradFill rotWithShape="1"><a:gsLst>'+stops+'</a:gsLst><a:lin ang="'+Math.round((((g.angle||0)%360)+360)%360*60000)+'" scaled="0"/></a:gradFill>';
    }
    return '<a:solidFill>'+clr(fill.color,fill.alpha??1)+'</a:solidFill>';
  }
  function lineXml(line){
    if(!line)return '<a:ln><a:noFill/></a:ln>';
    return '<a:ln w="'+emu(line.width||1)+'"'+(line.cap?' cap="'+line.cap+'"':'')+'>'+fillXml(line)+(line.join==='round'?'<a:round/>':'')+'</a:ln>';
  }
  function effectsXml(s){
    const parts=[];
    if(s.shadow){
      const sh=s.shadow;
      parts.push('<a:outerShdw blurRad="'+emu(sh.blur||0)+'" dist="'+emu(sh.dist||0)+'" dir="'+Math.round((sh.dir??90)*60000)+'" algn="ctr" rotWithShape="0">'+clr(sh.color||'000000',sh.alpha??.2)+'</a:outerShdw>');
    }
    if(s.softEdge)parts.push('<a:softEdge rad="'+emu(s.softEdge)+'"/>');
    return parts.length?'<a:effectLst>'+parts.join('')+'</a:effectLst>':'';
  }
  function geomXml(s){
    if(s.points){
      // Points are in pixels relative to the shape box; the path space is the box in EMU.
      const w=Math.max(1,emu(s.w)),h=Math.max(1,emu(s.h));
      const subpaths=Array.isArray(s.points[0][0])?s.points:[s.points];
      const path=subpaths.map(poly=>poly.map((p,i)=>(i?'<a:lnTo>':'<a:moveTo>')+'<a:pt x="'+emu(p[0])+'" y="'+emu(p[1])+'"/>'+(i?'</a:lnTo>':'</a:moveTo>')).join('')+(s.open?'':'<a:close/>')).join('');
      return '<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst><a:path w="'+w+'" h="'+h+'">'+path+'</a:path></a:pathLst></a:custGeom>';
    }
    const adj=Object.entries(s.adj||{}).map(([k,v])=>'<a:gd name="'+k+'" fmla="val '+Math.round(v)+'"/>').join('');
    return '<a:prstGeom prst="'+(s.geom||'rect')+'"><a:avLst>'+adj+'</a:avLst></a:prstGeom>';
  }
  function runProps(run,tag='a:rPr'){
    const attrs=[' lang="'+(run.lang||'pl-PL')+'"'];
    if(run.size)attrs.push(' sz="'+Math.round(run.size*50)+'"');
    if(run.bold)attrs.push(' b="1"');
    if(run.italic)attrs.push(' i="1"');
    attrs.push(' kern="'+(run.kern??100)+'"');
    if(run.caps)attrs.push(' cap="all"');
    if(run.spacing)attrs.push(' spc="'+Math.round(run.spacing*50)+'"');
    if(run.baseline)attrs.push(' baseline="'+Math.round(run.baseline*1000)+'"');
    attrs.push(' dirty="0"');
    const font=run.font||'Lato';
    const inner=(run.color?'<a:solidFill>'+clr(run.color,run.alpha??1)+'</a:solidFill>':'')+'<a:latin typeface="'+esc(font)+'"/><a:cs typeface="'+esc(font)+'"/>';
    return '<'+tag+attrs.join('')+'>'+inner+'</'+tag+'>';
  }
  function textXml(text){
    const anchor=text.anchor||'t';
    const body='<a:bodyPr wrap="'+(text.wrap||'square')+'" lIns="'+emu(text.inset?.[3]||0)+'" tIns="'+emu(text.inset?.[0]||0)+'" rIns="'+emu(text.inset?.[1]||0)+'" bIns="'+emu(text.inset?.[2]||0)+'" rtlCol="0" anchor="'+anchor+'"><a:noAutofit/></a:bodyPr><a:lstStyle/>';
    const paragraphs=(text.paragraphs||[]).map(p=>{
      const spacing=p.lineHeight?'<a:lnSpc><a:spcPts val="'+Math.round(p.lineHeight*50)+'"/></a:lnSpc>':'';
      const pPr='<a:pPr algn="'+(p.align||'l')+'"'+(p.indent?' indent="'+emu(p.indent)+'"':'')+'>'+spacing+'<a:spcBef><a:spcPts val="'+Math.round((p.before||0)*50)+'"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr>';
      const runs=(p.runs||[]).map(r=>r.br?'<a:br>'+runProps(r)+'</a:br>':'<a:r>'+runProps(r)+'<a:t>'+esc(r.text)+'</a:t></a:r>').join('');
      const last=[...(p.runs||[])].reverse().find(r=>!r.br)||p.runs?.[0]||{};
      return '<a:p>'+pPr+runs+runProps(last,'a:endParaRPr')+'</a:p>';
    }).join('');
    return '<p:txBody>'+body+(paragraphs||'<a:p><a:endParaRPr lang="pl-PL" dirty="0"/></a:p>')+'</p:txBody>';
  }
  function xfrmXml(s){
    const rot=s.rot?' rot="'+Math.round(((s.rot%360)+360)%360*60000)+'"':'';
    return '<a:xfrm'+rot+(s.flipH?' flipH="1"':'')+(s.flipV?' flipV="1"':'')+'><a:off x="'+emu(s.x)+'" y="'+emu(s.y)+'"/><a:ext cx="'+Math.max(1,emu(s.w))+'" cy="'+Math.max(1,emu(s.h))+'"/></a:xfrm>';
  }
  function nvXml(s,id,kind){
    const name=' name="'+esc(s.name||(kind==='pic'?'Obraz ':'Kształt ')+id)+'"'+(s.descr?' descr="'+esc(s.descr)+'"':'');
    if(kind==='pic')return '<p:nvPicPr><p:cNvPr id="'+id+'"'+name+'/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>';
    return '<p:nvSpPr><p:cNvPr id="'+id+'"'+name+'/><p:cNvSpPr'+(s.textBox?' txBox="1"':'')+'/><p:nvPr/></p:nvSpPr>';
  }
  function shapeXml(s,id,rid){
    if(s.kind==='picture'){
      return '<p:pic>'+nvXml(s,id,'pic')+'<p:blipFill><a:blip r:embed="'+rid+'"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr>'+xfrmXml(s)+'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>';
    }
    const spPr='<p:spPr>'+xfrmXml(s)+geomXml(s)+fillXml(s.fill)+lineXml(s.line)+effectsXml(s)+'</p:spPr>';
    // Like PowerPoint, every autoshape carries a text body, even an empty one.
    const empty='<p:txBody><a:bodyPr rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:endParaRPr lang="pl-PL" dirty="0"/></a:p></p:txBody>';
    return '<p:sp>'+nvXml(s,id,'sp')+spPr+(s.text?textXml(s.text):empty)+'</p:sp>';
  }

  // ---- Animation timeline -------------------------------------------------------------
  /* timing = {groups:[{trigger:'auto'|'click', effects:[effect]}]}
   * effect = {shape, paragraphs:[from,to]?, cls:'entr'|'exit'|'emph'|'path', preset:[id,subtype],
   *           delay, repeat:'indefinite'|n, autoReverse, untilNextClick, accel, decel,
   *           iterate:{type:'lt'|'wd', pct|ms}, behaviors:[...]}
   * behavior = {type:'visibility'|'fade'|'filter'|'anim'|'rotate'|'scale'|'motion'|'color', at, dur, ...}
   */
  function timingXml(groups,idOf,isPicture){
    groups=(groups||[]).filter(g=>g.effects&&g.effects.length);
    if(!groups.length)return '';
    let next=2;
    const id=()=>++next;
    const builds=new Map();
    const target=e=>{
      const spid=idOf(e.shape);
      const range=e.paragraphs?'<p:txEl><p:pRg st="'+e.paragraphs[0]+'" end="'+e.paragraphs[1]+'"/></p:txEl>':'';
      return '<p:tgtEl><p:spTgt spid="'+spid+'"'+(range?'>'+range+'</p:spTgt>':'/>')+'</p:tgtEl>';
    };
    const behaviorXml=(b,tgt)=>{
      const bid=id(),dur=Math.max(1,ms(b.dur??1));
      const start=b.at?'<p:stCondLst><p:cond delay="'+ms(b.at)+'"/></p:stCondLst>':'';
      const cTn=(hold=true)=>'<p:cTn id="'+bid+'" dur="'+dur+'"'+(hold?' fill="hold"':'')+(b.accel?' accel="'+pct(b.accel)+'"':'')+(b.decel?' decel="'+pct(b.decel)+'"':'')+(start?'>'+start+'</p:cTn>':'/>');
      const attrs=names=>'<p:attrNameLst>'+names.map(n=>'<p:attrName>'+n+'</p:attrName>').join('')+'</p:attrNameLst>';
      switch(b.type){
        case 'visibility':
          return '<p:set><p:cBhvr><p:cTn id="'+bid+'" dur="1" fill="hold">'+(start||'<p:stCondLst><p:cond delay="0"/></p:stCondLst>')+'</p:cTn>'+tgt+attrs(['style.visibility'])+'</p:cBhvr><p:to><p:strVal val="'+b.value+'"/></p:to></p:set>';
        case 'fade':
          return '<p:animEffect transition="'+(b.dir||'in')+'" filter="fade"><p:cBhvr>'+cTn(false)+tgt+'</p:cBhvr></p:animEffect>';
        case 'filter':
          return '<p:animEffect transition="'+(b.dir||'in')+'" filter="'+b.filter+'"><p:cBhvr>'+cTn(false)+tgt+'</p:cBhvr></p:animEffect>';
        case 'anim':{
          const keys=b.keys.map(([t,v])=>'<p:tav tm="'+Math.round(Math.min(1,Math.max(0,t))*100000)+'"><p:val>'+(typeof v==='number'?'<p:fltVal val="'+num(v)+'"/>':'<p:strVal val="'+esc(v)+'"/>')+'</p:val></p:tav>').join('');
          return '<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base">'+cTn()+tgt+attrs([b.attr])+'</p:cBhvr><p:tavLst>'+keys+'</p:tavLst></p:anim>';
        }
        case 'rotate':
          return '<p:animRot by="'+Math.round(b.by*60000)+'"><p:cBhvr>'+cTn()+tgt+attrs(['r'])+'</p:cBhvr></p:animRot>';
        case 'scale':
          return '<p:animScale><p:cBhvr>'+cTn()+tgt+'</p:cBhvr>'+(b.from?'<p:from x="'+pct(b.from[0])+'" y="'+pct(b.from[1])+'"/>':'')+(b.to?'<p:to x="'+pct(b.to[0])+'" y="'+pct(b.to[1])+'"/>':'')+(b.by?'<p:by x="'+pct(b.by[0])+'" y="'+pct(b.by[1])+'"/>':'')+'</p:animScale>';
        case 'motion':
          return '<p:animMotion origin="layout" path="'+esc(b.path)+'" pathEditMode="relative" rAng="0" ptsTypes="'+'A'.repeat((b.path.match(/[ML]/g)||[]).length)+'"><p:cBhvr>'+cTn()+tgt+attrs(['ppt_x','ppt_y'])+'</p:cBhvr><p:rCtr x="0" y="0"/></p:animMotion>';
        case 'opacity':{
          // PowerPoint's "Transparency" emphasis: the set holds the value, the image filter draws it.
          const draw=id();
          return '<p:set><p:cBhvr>'+cTn()+tgt+attrs(['style.opacity'])+'</p:cBhvr><p:to><p:strVal val="'+num(b.value)+'"/></p:to></p:set>'+
            '<p:animEffect filter="image" prLst="opacity: '+num(b.value)+'"><p:cBhvr rctx="IE"><p:cTn id="'+draw+'" dur="'+dur+'" fill="hold"'+(start?'>'+start+'</p:cTn>':'/>')+tgt+'</p:cBhvr></p:animEffect>';
        }
        case 'color':{
          const on=id(),type=id();
          return '<p:animClr clrSpc="rgb" dir="cw"><p:cBhvr>'+cTn()+tgt+attrs(['fillcolor'])+'</p:cBhvr><p:to>'+clr(b.to)+'</p:to></p:animClr>'+
            '<p:set><p:cBhvr><p:cTn id="'+on+'" dur="'+dur+'" fill="hold">'+start+'</p:cTn>'+tgt+attrs(['fill.type'])+'</p:cBhvr><p:to><p:strVal val="solid"/></p:to></p:set>'+
            '<p:set><p:cBhvr><p:cTn id="'+type+'" dur="'+dur+'" fill="hold">'+start+'</p:cTn>'+tgt+attrs(['fill.on'])+'</p:cBhvr><p:to><p:strVal val="true"/></p:to></p:set>';
        }
        default: throw new Error('Unknown behavior: '+b.type);
      }
    };
    const effectXml=(e,nodeType)=>{
      const eid=id(),spid=idOf(e.shape);
      if(!builds.has(spid))builds.set(spid,e.paragraphs?'p':'whole');
      else if(e.paragraphs)builds.set(spid,'p');
      const [presetID,presetSubtype]=e.preset||[0,0];
      const repeat=e.repeat?' repeatCount="'+(e.repeat==='indefinite'?'indefinite':Math.round(e.repeat*1000))+'"':'';
      const attrs=' presetID="'+presetID+'" presetClass="'+(e.cls||'entr')+'" presetSubtype="'+presetSubtype+'"'+repeat+(e.autoReverse?' autoRev="1"':'')+(e.accel?' accel="'+pct(e.accel)+'"':'')+(e.decel?' decel="'+pct(e.decel)+'"':'')+' fill="hold" grpId="0" nodeType="'+nodeType+'"';
      const end=e.untilNextClick?'<p:endCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst>':'';
      const iterate=e.iterate?'<p:iterate type="'+(e.iterate.type||'lt')+'">'+(e.iterate.ms!=null?'<p:tmAbs val="'+ms(e.iterate.ms)+'"/>':'<p:tmPct val="'+pct(e.iterate.pct||.1)+'"/>')+'</p:iterate>':'';
      const tgt=target(e);
      const children=e.behaviors.map(b=>behaviorXml(b,tgt)).join('');
      return '<p:par><p:cTn id="'+eid+'"'+attrs+'><p:stCondLst><p:cond delay="'+ms(e.delay||0)+'"/></p:stCondLst>'+end+iterate+'<p:childTnLst>'+children+'</p:childTnLst></p:cTn></p:par>';
    };
    const body=groups.map((g,gi)=>{
      const outer=id(),inner=id();
      const auto=gi===0&&g.trigger==='auto';
      const cond='<p:cond delay="indefinite"/>'+(auto?'<p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>':'');
      const effects=g.effects.map((e,i)=>effectXml(e,!auto&&i===0?'clickEffect':'withEffect')).join('');
      return '<p:par><p:cTn id="'+outer+'" fill="hold"><p:stCondLst>'+cond+'</p:stCondLst><p:childTnLst><p:par><p:cTn id="'+inner+'" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'+effects+'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>';
    }).join('');
    // Pictures have no build entry; shapes animated as one object animate their fill too (animBg).
    const bld=[...builds].filter(([spid])=>!isPicture(spid)).map(([spid,build])=>'<p:bldP spid="'+spid+'" grpId="0"'+(build==='p'?' build="p"':' animBg="1"')+'/>').join('');
    return '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'+
      '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'+body+'</p:childTnLst></p:cTn>'+
      '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'+
      '</p:childTnLst></p:cTn></p:par></p:tnLst>'+(bld?'<p:bldLst>'+bld+'</p:bldLst>':'')+'</p:timing>';
  }
  function transitionXml(t){
    if(!t||t.type==='none')return '';
    const dur=Math.max(1,ms(t.duration||500)),spd=dur<=500?'fast':dur<=1000?'med':'slow';
    const fallback='<mc:Fallback><p:transition spd="'+spd+'"><p:fade/></p:transition></mc:Fallback>';
    if(t.type==='morph')return '<mc:AlternateContent xmlns:mc="'+NS.mc+'"><mc:Choice xmlns:p159="'+NS.p159+'" Requires="p159"><p:transition spd="'+spd+'" p14:dur="'+dur+'"><p159:morph option="'+(t.option||'byObject')+'"/></p:transition></mc:Choice>'+fallback+'</mc:AlternateContent>';
    if(t.type==='fade')return '<mc:AlternateContent xmlns:mc="'+NS.mc+'"><mc:Choice Requires="p14"><p:transition spd="'+spd+'" p14:dur="'+dur+'"><p:fade/></p:transition></mc:Choice>'+fallback+'</mc:AlternateContent>';
    throw new Error('Unknown transition: '+t.type);
  }

  // ---- Fonts: TrueType → Embedded OpenType (uncompressed, version 0x00020001) ------------
  function ttfToEot(ttf){
    const dv=new DataView(ttf.buffer,ttf.byteOffset,ttf.byteLength),tables={};
    for(let i=0,n=dv.getUint16(4);i<n;i++){
      const o=12+16*i;
      tables[String.fromCharCode(ttf[o],ttf[o+1],ttf[o+2],ttf[o+3])]={off:dv.getUint32(o+8),len:dv.getUint32(o+12)};
    }
    const os2=tables['OS/2'].off,head=tables.head.off,name=tables.name.off;
    const names={};
    for(let i=0,count=dv.getUint16(name+2),store=name+dv.getUint16(name+4);i<count;i++){
      const r=name+6+12*i,platform=dv.getUint16(r),language=dv.getUint16(r+4),id=dv.getUint16(r+6),len=dv.getUint16(r+8),off=dv.getUint16(r+10);
      if(platform!==3||(names[id]&&language!==0x409))continue;
      const le=new Uint8Array(len);
      for(let k=0;k<len;k+=2){le[k]=ttf[store+off+k+1];le[k+1]=ttf[store+off+k];}
      names[id]=le;
    }
    const strings=[1,2,5,4].map(id=>names[id]||new Uint8Array(0));
    const size=100+strings.reduce((n,s)=>n+s.length,0)+ttf.length;
    const out=new Uint8Array(size),w=new DataView(out.buffer);
    let p=0;
    const u32=v=>{w.setUint32(p,v>>>0,true);p+=4;},u16=v=>{w.setUint16(p,v,true);p+=2;},u8=v=>{out[p++]=v;};
    u32(size);u32(ttf.length);u32(0x00020001);u32(0);
    for(let i=0;i<10;i++)u8(ttf[os2+32+i]);
    u8(1);u8(dv.getUint16(os2+62)&1);
    u32(dv.getUint16(os2+4));u16(dv.getUint16(os2+8));u16(0x504C);
    for(const o of [42,46,50,54])u32(dv.getUint32(os2+o));
    const hasCodePages=dv.getUint16(os2)>=1;
    u32(hasCodePages?dv.getUint32(os2+78):0);u32(hasCodePages?dv.getUint32(os2+82):0);
    u32(dv.getUint32(head+8));
    u32(0);u32(0);u32(0);u32(0);u16(0);
    strings.forEach((s,i)=>{if(i)u16(0);u16(s.length);out.set(s,p);p+=s.length;});
    u16(0);u16(0);
    out.set(ttf,p);
    return out;
  }

  // ---- ZIP (stored or raw-deflated entries, no ZIP64) -------------------------------------
  const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(data){let c=0xFFFFFFFF;for(let i=0;i<data.length;i++)c=CRC[(c^data[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  async function deflateRaw(data){
    if(typeof CompressionStream==='undefined')return null;
    try{
      const stream=new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }catch{return null;}
  }
  async function zip(files,{date=new Date()}={}){
    const enc=new TextEncoder(),parts=[],central=[];
    const time=(date.getHours()<<11)|(date.getMinutes()<<5)|(date.getSeconds()>>1);
    const day=((date.getFullYear()-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate();
    let offset=0;
    for(const f of files){
      const name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data);
      let body=data,method=0;
      if(f.compress!==false){const packed=await deflateRaw(data);if(packed&&packed.length<data.length){body=packed;method=8;}}
      const local=new Uint8Array(30+name.length),lv=new DataView(local.buffer);
      lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x0800,true);lv.setUint16(8,method,true);
      lv.setUint16(10,time,true);lv.setUint16(12,day,true);lv.setUint32(14,crc,true);lv.setUint32(18,body.length,true);lv.setUint32(22,data.length,true);
      lv.setUint16(26,name.length,true);lv.setUint16(28,0,true);local.set(name,30);
      const entry=new Uint8Array(46+name.length),cv=new DataView(entry.buffer);
      cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,method,true);
      cv.setUint16(12,time,true);cv.setUint16(14,day,true);cv.setUint32(16,crc,true);cv.setUint32(20,body.length,true);cv.setUint32(24,data.length,true);
      cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);entry.set(name,46);
      parts.push(local,body);central.push(entry);
      offset+=local.length+body.length;
    }
    const size=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
    ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,size,true);ev.setUint32(16,offset,true);
    const all=[...parts,...central,end],out=new Uint8Array(all.reduce((n,a)=>n+a.length,0));
    let p=0;for(const a of all){out.set(a,p);p+=a.length;}
    return out;
  }

  // ---- Package parts ----------------------------------------------------------------------
  const rels=list=>HEAD+'<Relationships xmlns="'+NS.rel+'">'+list.map(r=>'<Relationship Id="'+r.id+'" Type="'+r.type+'" Target="'+esc(r.target)+'"/>').join('')+'</Relationships>';
  const spTreeOpen='<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
  const defRPr=(size,font)=>'<a:defRPr sz="'+size+'" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="'+font+'"/><a:ea typeface="+mn-ea"/><a:cs typeface="'+font+'"/></a:defRPr>';
  const clrMap='<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>';
  function themeXml(name,fonts){
    const c=(tag,v)=>'<a:'+tag+'><a:srgbClr val="'+v+'"/></a:'+tag+'>';
    const solid='<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>';
    return HEAD+'<a:theme xmlns:a="'+NS.a+'" name="'+esc(name)+'"><a:themeElements><a:clrScheme name="'+esc(name)+'">'+
      c('dk1','151515')+c('lt1','FFFFFF')+c('dk2','111111')+c('lt2','FAF8F5')+c('accent1','EE312F')+c('accent2','CF1723')+c('accent3','95161D')+c('accent4','00856B')+c('accent5','FFC244')+c('accent6','666666')+c('hlink','EE312F')+c('folHlink','95161D')+
      '</a:clrScheme><a:fontScheme name="'+esc(name)+'"><a:majorFont><a:latin typeface="'+fonts.major+'"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="'+fonts.minor+'"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>'+
      '<a:fmtScheme name="'+esc(name)+'"><a:fillStyleLst>'+solid+solid+solid+'</a:fillStyleLst><a:lnStyleLst><a:ln w="6350">'+solid+'</a:ln><a:ln w="12700">'+solid+'</a:ln><a:ln w="19050">'+solid+'</a:ln></a:lnStyleLst>'+
      '<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst>'+solid+solid+solid+'</a:bgFillStyleLst></a:fmtScheme>'+
      '</a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>';
  }
  function masterXml(){
    const lvl=(size,font)=>'<a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:lnSpc><a:spcPct val="100000"/></a:lnSpc><a:spcBef><a:spcPts val="0"/></a:spcBef><a:buNone/>'+defRPr(size,font)+'</a:lvl1pPr>';
    return HEAD+'<p:sldMaster '+ROOT_NS+'><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg>'+spTreeOpen+'</p:spTree></p:cSld>'+clrMap+
      '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle>'+lvl(4400,'+mj-lt')+'</p:titleStyle><p:bodyStyle>'+lvl(2800,'+mn-lt')+'</p:bodyStyle><p:otherStyle>'+lvl(1800,'+mn-lt')+'</p:otherStyle></p:txStyles></p:sldMaster>';
  }
  const layoutXml=()=>HEAD+'<p:sldLayout '+ROOT_NS+' type="blank" preserve="1"><p:cSld name="Pusty">'+spTreeOpen+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>';
  function notesMasterXml(){
    return HEAD+'<p:notesMaster '+ROOT_NS+'><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg>'+spTreeOpen+
      '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Obraz slajdu"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="1143000"/><a:ext cx="5486400" cy="3086100"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln w="12700"><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:ln></p:spPr></p:sp>'+
      '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Notatki"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" sz="quarter" idx="3"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="4400550"/><a:ext cx="5486400" cy="3600450"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle/><a:p><a:pPr lvl="0"/><a:r><a:rPr lang="pl-PL"/><a:t>Notatki</a:t></a:r></a:p></p:txBody></p:sp>'+
      '</p:spTree></p:cSld>'+clrMap+'<p:notesStyle><a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1">'+defRPr(1200,'+mn-lt')+'</a:lvl1pPr></p:notesStyle></p:notesMaster>';
  }
  function notesXml(text){
    const paragraphs=String(text).split('\n').map(line=>'<a:p><a:r><a:rPr lang="pl-PL" dirty="0"/><a:t>'+esc(line)+'</a:t></a:r></a:p>').join('');
    return HEAD+'<p:notes '+ROOT_NS+'><p:cSld>'+spTreeOpen+
      '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Obraz slajdu"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp>'+
      '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Notatki"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>'+paragraphs+'</p:txBody></p:sp>'+
      '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>';
  }

  function createPresentation({title='Prezentacja',author='',fonts={major:'Lato Black',minor:'Lato'}}={}){
    const slides=[],media=[],embedded=[];
    const api={
      addMedia(bytes,extension='png'){media.push({bytes,extension});return media.length;},
      addFont({typeface,style='regular',ttf}){embedded.push({typeface,style,data:ttfToEot(ttf)});},
      addSlide(slide){slides.push(slide);return slide;},
      slides,
      async build({compress=true,date=new Date()}={}){
        const files=[],overrides=[],add=(name,data,type)=>{files.push({name,data,compress});if(type)overrides.push([name,type]);};
        const presRels=[{id:'rId1',type:RT+'slideMaster',target:'slideMasters/slideMaster1.xml'}];
        slides.forEach((_,i)=>presRels.push({id:'rId'+(i+2),type:RT+'slide',target:'slides/slide'+(i+1)+'.xml'}));
        let n=slides.length+2;
        const notesMasterRid='rId'+n++,themeRid='rId'+n++;
        presRels.push({id:notesMasterRid,type:RT+'notesMaster',target:'notesMasters/notesMaster1.xml'});
        presRels.push({id:themeRid,type:RT+'theme',target:'theme/theme1.xml'});
        for(const [type,target] of [['presProps','presProps.xml'],['viewProps','viewProps.xml'],['tableStyles','tableStyles.xml']])presRels.push({id:'rId'+n++,type:RT+type,target});
        const fontRids=embedded.map((f,i)=>{const id='rId'+n++;presRels.push({id,type:RT+'font',target:'fonts/font'+(i+1)+'.fntdata'});return id;});
        const families=[];
        embedded.forEach((f,i)=>{let fam=families.find(x=>x.typeface===f.typeface);if(!fam)families.push(fam={typeface:f.typeface,faces:{}});fam.faces[f.style]=fontRids[i];});
        const fontList=families.length?'<p:embeddedFontLst>'+families.map(f=>'<p:embeddedFont><p:font typeface="'+esc(f.typeface)+'" pitchFamily="34" charset="0"/>'+['regular','bold','italic','boldItalic'].filter(s=>f.faces[s]).map(s=>'<p:'+s+' r:id="'+f.faces[s]+'"/>').join('')+'</p:embeddedFont>').join('')+'</p:embeddedFontLst>':'';
        add('[Content_Types].xml','');
        add('_rels/.rels',rels([{id:'rId1',type:RT+'officeDocument',target:'ppt/presentation.xml'},{id:'rId2',type:'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',target:'docProps/core.xml'},{id:'rId3',type:RT+'extended-properties',target:'docProps/app.xml'}]));
        const stamp=date.toISOString().replace(/\.\d+Z$/,'Z');
        add('docProps/core.xml',HEAD+'<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>'+esc(title)+'</dc:title><dc:creator>'+esc(author)+'</dc:creator><cp:lastModifiedBy>'+esc(author)+'</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">'+stamp+'</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">'+stamp+'</dcterms:modified></cp:coreProperties>','application/vnd.openxmlformats-package.core-properties+xml');
        add('docProps/app.xml',HEAD+'<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Office PowerPoint</Application><PresentationFormat>Panoramiczny</PresentationFormat><Slides>'+slides.length+'</Slides><Notes>'+slides.filter(s=>s.notes).length+'</Notes></Properties>','application/vnd.openxmlformats-officedocument.extended-properties+xml');
        add('ppt/presentation.xml',HEAD+'<p:presentation '+ROOT_NS+(families.length?' embedTrueTypeFonts="1"':'')+'><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="'+notesMasterRid+'"/></p:notesMasterIdLst><p:sldIdLst>'+
          slides.map((_,i)=>'<p:sldId id="'+(256+i)+'" r:id="rId'+(i+2)+'"/>').join('')+'</p:sldIdLst><p:sldSz cx="'+emu(SLIDE.w)+'" cy="'+emu(SLIDE.h)+'"/><p:notesSz cx="6858000" cy="9144000"/>'+fontList+
          '<p:defaultTextStyle><a:defPPr><a:defRPr lang="pl-PL"/></a:defPPr><a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1">'+defRPr(1800,'+mn-lt')+'</a:lvl1pPr></p:defaultTextStyle></p:presentation>',CT+'presentation.main+xml');
        add('ppt/_rels/presentation.xml.rels',rels(presRels));
        add('ppt/presProps.xml',HEAD+'<p:presentationPr '+ROOT_NS+'/>',CT+'presProps+xml');
        add('ppt/viewProps.xml',HEAD+'<p:viewPr '+ROOT_NS+'><p:normalViewPr><p:restoredLeft sz="15620"/><p:restoredTop sz="94660"/></p:normalViewPr><p:gridSpacing cx="76200" cy="76200"/></p:viewPr>',CT+'viewProps+xml');
        add('ppt/tableStyles.xml',HEAD+'<a:tblStyleLst xmlns:a="'+NS.a+'" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>',CT+'tableStyles+xml');
        add('ppt/theme/theme1.xml',themeXml(title,fonts),'application/vnd.openxmlformats-officedocument.theme+xml');
        add('ppt/theme/theme2.xml',themeXml(title,fonts),'application/vnd.openxmlformats-officedocument.theme+xml');
        add('ppt/slideMasters/slideMaster1.xml',masterXml(),CT+'slideMaster+xml');
        add('ppt/slideMasters/_rels/slideMaster1.xml.rels',rels([{id:'rId1',type:RT+'slideLayout',target:'../slideLayouts/slideLayout1.xml'},{id:'rId2',type:RT+'theme',target:'../theme/theme1.xml'}]));
        add('ppt/slideLayouts/slideLayout1.xml',layoutXml(),CT+'slideLayout+xml');
        add('ppt/slideLayouts/_rels/slideLayout1.xml.rels',rels([{id:'rId1',type:RT+'slideMaster',target:'../slideMasters/slideMaster1.xml'}]));
        add('ppt/notesMasters/notesMaster1.xml',notesMasterXml(),CT+'notesMaster+xml');
        add('ppt/notesMasters/_rels/notesMaster1.xml.rels',rels([{id:'rId1',type:RT+'theme',target:'../theme/theme2.xml'}]));
        slides.forEach((slide,i)=>{
          const index=i+1,slideRels=[{id:'rId1',type:RT+'slideLayout',target:'../slideLayouts/slideLayout1.xml'}];
          if(slide.notes)slideRels.push({id:'rId2',type:RT+'notesSlide',target:'../notesSlides/notesSlide'+index+'.xml'});
          const ids=new Map(),mediaRid=new Map();
          (slide.shapes||[]).forEach((s,k)=>{
            ids.set(s,k+2);
            if(s.kind==='picture'&&!mediaRid.has(s.media)){const rid='rId'+(slideRels.length+1);mediaRid.set(s.media,rid);slideRels.push({id:rid,type:RT+'image',target:'../media/image'+s.media+'.'+media[s.media-1].extension});}
          });
          const idOf=s=>{if(!ids.has(s))throw new Error('Animation targets a shape that is not on slide '+index+': '+(s&&s.name));return ids.get(s);};
          const pictureIds=new Set((slide.shapes||[]).filter(s=>s.kind==='picture').map(s=>ids.get(s)));
          const bg=slide.background?'<p:bg><p:bgPr>'+fillXml({color:slide.background})+'<a:effectLst/></p:bgPr></p:bg>':'';
          const tree=(slide.shapes||[]).map(s=>shapeXml(s,ids.get(s),mediaRid.get(s.media))).join('');
          const xml=HEAD+'<p:sld '+ROOT_NS+' xmlns:p14="'+NS.p14+'"><p:cSld'+(slide.name?' name="'+esc(slide.name)+'"':'')+'>'+bg+spTreeOpen+tree+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>'+
            transitionXml(slide.transition)+timingXml(slide.timing?.groups,idOf,spid=>pictureIds.has(spid))+'</p:sld>';
          add('ppt/slides/slide'+index+'.xml',xml,CT+'slide+xml');
          add('ppt/slides/_rels/slide'+index+'.xml.rels',rels(slideRels));
          if(slide.notes){
            add('ppt/notesSlides/notesSlide'+index+'.xml',notesXml(slide.notes),CT+'notesSlide+xml');
            add('ppt/notesSlides/_rels/notesSlide'+index+'.xml.rels',rels([{id:'rId1',type:RT+'notesMaster',target:'../notesMasters/notesMaster1.xml'},{id:'rId2',type:RT+'slide',target:'../slides/slide'+index+'.xml'}]));
          }
        });
        media.forEach((m,i)=>files.push({name:'ppt/media/image'+(i+1)+'.'+m.extension,data:m.bytes,compress:false}));
        embedded.forEach((f,i)=>files.push({name:'ppt/fonts/font'+(i+1)+'.fntdata',data:f.data,compress}));
        const defaults=[['rels','application/vnd.openxmlformats-package.relationships+xml'],['xml','application/xml'],['png','image/png'],['jpeg','image/jpeg'],['fntdata','application/x-fontdata']];
        files[0].data=HEAD+'<Types xmlns="'+NS.ct+'">'+defaults.map(([e,t])=>'<Default Extension="'+e+'" ContentType="'+t+'"/>').join('')+overrides.map(([name,type])=>'<Override PartName="/'+name+'" ContentType="'+type+'"/>').join('')+'</Types>';
        return zip(files,{date});
      }
    };
    return api;
  }

  global.DECK_PPTX_WRITER={createPresentation,ttfToEot,zip,crc32,emu,SLIDE};
})(typeof window==='undefined'?globalThis:window);
