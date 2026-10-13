// Dev-only: summarizes the animation timeline of one exported slide.
window.PPTX_TIMING=async(url,index)=>{
  const bytes=new Uint8Array(await (await fetch(url,{cache:'reload'})).arrayBuffer()),dv=new DataView(bytes.buffer);
  let end=bytes.length-22;while(dv.getUint32(end,true)!==0x06054b50)end--;
  let p=dv.getUint32(end+16,true),xml=null;
  for(let i=0,n=dv.getUint16(end+10,true);i<n;i++){
    const method=dv.getUint16(p+10,true),size=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),local=dv.getUint32(p+42,true);
    const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+nl)),start=local+30+dv.getUint16(local+26,true)+dv.getUint16(local+28,true);
    if(name==='ppt/slides/slide'+index+'.xml'){let data=bytes.subarray(start,start+size);if(method===8)data=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());xml=new DOMParser().parseFromString(new TextDecoder().decode(data),'application/xml');}
    p+=46+nl+dv.getUint16(p+30,true)+dv.getUint16(p+32,true);
  }
  const names={};
  for(const c of xml.getElementsByTagName('p:cNvPr'))names[c.getAttribute('id')]=c.getAttribute('name');
  const main=[...xml.getElementsByTagName('p:cTn')].find(c=>c.getAttribute('nodeType')==='mainSeq');
  if(!main)return [];
  const groups=[...main.getElementsByTagName('p:childTnLst')[0].children];
  return groups.map((g,gi)=>{
    const effects=[...g.getElementsByTagName('p:cTn')].filter(c=>c.hasAttribute('presetClass'));
    return {group:gi,effects:effects.map(e=>{
      const delay=+e.getElementsByTagName('p:cond')[0].getAttribute('delay');
      const tgt=e.getElementsByTagName('p:spTgt')[0],pr=e.getElementsByTagName('p:pRg')[0];
      const beh=[...e.getElementsByTagName('p:childTnLst')[0].children].map(b=>{
        const c=b.getElementsByTagName('p:cTn')[0],attr=b.getElementsByTagName('p:attrName')[0]?.textContent;
        const keys=b.getElementsByTagName('p:tav').length;
        return b.tagName.replace('p:','')+(attr?'('+attr+')':'')+(b.getAttribute('filter')?'['+b.getAttribute('filter')+']':'')+(b.getAttribute('by')?'['+b.getAttribute('by')/60000+'°]':'')+'@'+(+(c.getElementsByTagName('p:cond')[0]?.getAttribute('delay')||0))+'+'+c.getAttribute('dur')+(keys?'k'+keys:'');
      });
      return [names[tgt.getAttribute('spid')]+(pr?' ¶'+pr.getAttribute('st'):''),e.getAttribute('presetClass')+e.getAttribute('presetID'),delay,e.getAttribute('repeatCount')||'',e.getElementsByTagName('p:iterate').length?'by-letter':'',beh.join(' ')].filter(Boolean).join(' | ');
    })};
  });
};
