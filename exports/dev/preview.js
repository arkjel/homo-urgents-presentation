// Dev-only: draws a slide of an exported .pptx (static state, as in PowerPoint's edit view) as SVG.
window.PPTX_PREVIEW=(()=>{
  const E=6350,ns='http://www.w3.org/2000/svg';
  async function unzip(url){
    const bytes=new Uint8Array(await (await fetch(url,{cache:'reload'})).arrayBuffer()),dv=new DataView(bytes.buffer),files=new Map();
    let end=bytes.length-22;while(dv.getUint32(end,true)!==0x06054b50)end--;
    let p=dv.getUint32(end+16,true);
    for(let i=0,n=dv.getUint16(end+10,true);i<n;i++){
      const method=dv.getUint16(p+10,true),size=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),local=dv.getUint32(p+42,true);
      const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+nl)),start=local+30+dv.getUint16(local+26,true)+dv.getUint16(local+28,true);
      let data=bytes.subarray(start,start+size);
      if(method===8)data=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
      files.set(name,data);p+=46+nl+dv.getUint16(p+30,true)+dv.getUint16(p+32,true);
    }
    return files;
  }
  const kid=(el,name)=>el&&[...el.children].find(c=>c.tagName===name);
  const kids=(el,name)=>el?[...el.children].filter(c=>c.tagName===name):[];
  function fillOf(el,defs){
    if(!el)return 'none';
    const solid=kid(el,'a:solidFill'),grad=kid(el,'a:gradFill');
    if(kid(el,'a:noFill'))return 'none';
    if(solid){const c=kid(solid,'a:srgbClr');const a=kid(c,'a:alpha');return 'rgba('+parseInt(c.getAttribute('val').slice(0,2),16)+','+parseInt(c.getAttribute('val').slice(2,4),16)+','+parseInt(c.getAttribute('val').slice(4),16)+','+(a?a.getAttribute('val')/100000:1)+')';}
    if(grad){
      const id='g'+Math.random().toString(36).slice(2),lg=document.createElementNS(ns,'linearGradient');lg.id=id;
      const ang=(+kid(grad,'a:lin').getAttribute('ang'))/60000*Math.PI/180;
      lg.setAttribute('x1',.5-Math.cos(ang)/2);lg.setAttribute('y1',.5-Math.sin(ang)/2);lg.setAttribute('x2',.5+Math.cos(ang)/2);lg.setAttribute('y2',.5+Math.sin(ang)/2);
      for(const gs of kid(grad,'a:gsLst').children){const c=kid(gs,'a:srgbClr'),st=document.createElementNS(ns,'stop');st.setAttribute('offset',gs.getAttribute('pos')/100000);st.setAttribute('stop-color','#'+c.getAttribute('val'));const a=kid(c,'a:alpha');if(a)st.setAttribute('stop-opacity',a.getAttribute('val')/100000);lg.append(st);}
      defs.append(lg);return 'url(#'+id+')';
    }
    return 'none';
  }
  function geomPath(spPr,w,h){
    const prst=kid(spPr,'a:prstGeom'),cust=kid(spPr,'a:custGeom');
    if(cust){
      const path=kid(kid(cust,'a:pathLst'),'a:path'),pw=+path.getAttribute('w'),ph=+path.getAttribute('h');let d='';
      for(const c of path.children){const pt=kid(c,'a:pt');if(c.tagName==='a:close'){d+='Z';continue;}d+=(c.tagName==='a:moveTo'?'M':'L')+(pt.getAttribute('x')/pw*w)+' '+(pt.getAttribute('y')/ph*h)+' ';}
      return d;
    }
    const name=prst?.getAttribute('prst')||'rect',adj={};
    for(const gd of kids(kid(prst,'a:avLst'),'a:gd'))adj[gd.getAttribute('name')]=+gd.getAttribute('fmla').split(' ')[1];
    const min=Math.min(w,h);
    if(name==='ellipse')return 'M0 '+h/2+' A'+w/2+' '+h/2+' 0 1 0 '+w+' '+h/2+' A'+w/2+' '+h/2+' 0 1 0 0 '+h/2+'Z';
    if(name==='roundRect'){const r=(adj.adj??16667)/100000*min;return 'M'+r+' 0H'+(w-r)+'A'+r+' '+r+' 0 0 1 '+w+' '+r+'V'+(h-r)+'A'+r+' '+r+' 0 0 1 '+(w-r)+' '+h+'H'+r+'A'+r+' '+r+' 0 0 1 0 '+(h-r)+'V'+r+'A'+r+' '+r+' 0 0 1 '+r+' 0Z';}
    if(name==='round2SameRect'){const a=(adj.adj1??16667)/100000*min,b=(adj.adj2??0)/100000*min;return 'M'+a+' 0H'+(w-a)+'A'+a+' '+a+' 0 0 1 '+w+' '+a+'V'+(h-b)+'A'+b+' '+b+' 0 0 1 '+(w-b)+' '+h+'H'+b+'A'+b+' '+b+' 0 0 1 0 '+(h-b)+'V'+a+'A'+a+' '+a+' 0 0 1 '+a+' 0Z';}
    if(name==='arc'){const a1=(adj.adj1??16200000)/60000*Math.PI/180,a2=(adj.adj2??0)/60000*Math.PI/180,rx=w/2,ry=h/2;let sweep=a2-a1;if(sweep<=0)sweep+=Math.PI*2;
      const p=t=>[rx+rx*Math.cos(t),ry+ry*Math.sin(t)],s=p(a1),e=p(a1+sweep);return 'M'+s[0]+' '+s[1]+' A'+rx+' '+ry+' 0 '+(sweep>Math.PI?1:0)+' 1 '+e[0]+' '+e[1];}
    return 'M0 0H'+w+'V'+h+'H0Z';
  }
  function runColor(rPr){const s=kid(rPr,'a:solidFill');if(!s)return '#000';const c=kid(s,'a:srgbClr'),a=kid(c,'a:alpha');return 'rgba('+parseInt(c.getAttribute('val').slice(0,2),16)+','+parseInt(c.getAttribute('val').slice(2,4),16)+','+parseInt(c.getAttribute('val').slice(4),16)+','+(a?a.getAttribute('val')/100000:1)+')';}
  function text(g,txBody,w,h){
    const body=kid(txBody,'a:bodyPr'),l=+(body.getAttribute('lIns')??91440)/E,t=+(body.getAttribute('tIns')??45720)/E,r=+(body.getAttribute('rIns')??91440)/E;
    const paras=kids(txBody,'a:p');let y=t;const lines=[];
    for(const p of paras){
      const pPr=kid(p,'a:pPr'),lnSpc=kid(kid(pPr,'a:lnSpc'),'a:spcPts'),bef=kid(kid(pPr,'a:spcBef'),'a:spcPts');
      const runs=kids(p,'a:r');if(!runs.length)continue;
      const sizes=runs.map(rr=>+(kid(rr,'a:rPr').getAttribute('sz')||1800)/100*2);
      const fs=Math.max(...sizes),L=lnSpc?lnSpc.getAttribute('val')/100*2:1.2*fs;
      y+=bef?bef.getAttribute('val')/100*2:0;
      lines.push({p,pPr,runs,fs,L,base:y+L-.213*fs});y+=L;
    }
    const anchor=body.getAttribute('anchor');
    const shift=anchor==='ctr'?(h-y-t)/2:0;
    for(const line of lines){
      const te=document.createElementNS(ns,'text'),algn=line.pPr?.getAttribute('algn')||'l';
      te.setAttribute('y',line.base+shift);te.setAttribute('x',algn==='ctr'?w/2:algn==='r'?w-r:l);
      te.setAttribute('text-anchor',algn==='ctr'?'middle':algn==='r'?'end':'start');te.setAttribute('font-kerning','normal');
      for(const rr of line.runs){
        const rPr=kid(rr,'a:rPr'),span=document.createElementNS(ns,'tspan');
        const face=kid(rPr,'a:latin')?.getAttribute('typeface')||'Lato';
        span.textContent=kid(rr,'a:t').textContent;
        span.setAttribute('font-family',face==='Lato Black'?'Lato':face);span.setAttribute('font-weight',face==='Lato Black'?900:rPr.getAttribute('b')==='1'?700:400);
        span.setAttribute('font-size',(rPr.getAttribute('sz')||1800)/100*2);span.setAttribute('fill',runColor(rPr));
        if(rPr.getAttribute('spc'))span.setAttribute('letter-spacing',rPr.getAttribute('spc')/100*2);
        if(rPr.getAttribute('cap')==='all')span.style.textTransform='uppercase';
        te.append(span);
      }
      g.append(te);
    }
  }
  async function render(url,index){
    const files=await unzip(url),xml=new DOMParser().parseFromString(new TextDecoder().decode(files.get('ppt/slides/slide'+index+'.xml')),'application/xml');
    const rels=new DOMParser().parseFromString(new TextDecoder().decode(files.get('ppt/slides/_rels/slide'+index+'.xml.rels')),'application/xml');
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1920 1080');svg.setAttribute('width',1920);svg.setAttribute('height',1080);
    const defs=document.createElementNS(ns,'defs');svg.append(defs);
    const bg=xml.getElementsByTagName('p:bgPr')[0],rect=document.createElementNS(ns,'rect');rect.setAttribute('width',1920);rect.setAttribute('height',1080);rect.setAttribute('fill',bg?fillOf(bg,defs):'#fff');svg.append(rect);
    const tree=xml.getElementsByTagName('p:spTree')[0];
    for(const node of tree.children){
      if(node.tagName!=='p:sp'&&node.tagName!=='p:pic')continue;
      const spPr=kid(node,'p:spPr'),xfrm=kid(spPr,'a:xfrm'),off=kid(xfrm,'a:off'),ext=kid(xfrm,'a:ext');
      const x=off.getAttribute('x')/E,y=off.getAttribute('y')/E,w=ext.getAttribute('cx')/E,h=ext.getAttribute('cy')/E,rot=(+xfrm.getAttribute('rot')||0)/60000;
      if(x>1920||y>1080||x+w<0||y+h<0)continue;
      const g=document.createElementNS(ns,'g');g.setAttribute('transform','translate('+x+' '+y+') rotate('+rot+' '+w/2+' '+h/2+')');
      if(node.tagName==='p:pic'){
        const rid=node.getElementsByTagName('a:blip')[0].getAttribute('r:embed');
        const target=[...rels.documentElement.children].find(r=>r.getAttribute('Id')===rid).getAttribute('Target').replace('../','ppt/');
        const img=document.createElementNS(ns,'image');img.setAttribute('href',URL.createObjectURL(new Blob([files.get(target)],{type:'image/png'})));img.setAttribute('width',w);img.setAttribute('height',h);img.setAttribute('preserveAspectRatio','none');g.append(img);
      }else{
        const path=document.createElementNS(ns,'path');path.setAttribute('d',geomPath(spPr,w,h));
        path.setAttribute('fill',fillOf(spPr,defs));
        const ln=kid(spPr,'a:ln');
        if(ln&&!kid(ln,'a:noFill')){path.setAttribute('stroke',fillOf(ln,defs));path.setAttribute('stroke-width',(+ln.getAttribute('w')||12700)/E);if(ln.getAttribute('cap')==='rnd')path.setAttribute('stroke-linecap','round');}
        g.append(path);
        const tx=kid(node,'p:txBody');
        if(tx&&kids(tx,'a:p').some(p=>kids(p,'a:r').length))text(g,tx,w,h);
      }
      svg.append(g);
    }
    return svg;
  }
  async function show(url,index){
    document.querySelector('#pptx-preview')?.remove();
    const holder=document.createElement('div');holder.id='pptx-preview';
    holder.style.cssText='position:fixed;left:0;top:0;width:1920px;height:1080px;z-index:30000;background:#fff;transform-origin:0 0;transform:scale('+Math.min(innerWidth/1920,innerHeight/1080)+')';
    holder.append(await render(url,index));document.body.append(holder);
  }
  async function sheet(url,list){
    document.querySelector('#pptx-preview')?.remove();
    const holder=document.createElement('div');holder.id='pptx-preview';
    holder.style.cssText='position:fixed;left:0;top:0;width:1920px;height:1080px;z-index:30000;background:#888;display:grid;grid-template-columns:1fr 1fr;gap:4px;transform-origin:0 0;transform:scale('+Math.min(innerWidth/1920,innerHeight/1080)+')';
    for(const i of list){const svg=await render(url,i);svg.setAttribute('width','958');svg.setAttribute('height','538');holder.append(svg);}
    document.body.append(holder);
  }
  return {show,sheet,hide:()=>document.querySelector('#pptx-preview')?.remove()};
})();
