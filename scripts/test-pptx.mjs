import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateRawSync} from 'node:zlib';
import vm from 'node:vm';
const ctx={TextEncoder,Blob,Response,CompressionStream,Uint8Array,DataView};vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('../pptx-writer.js',import.meta.url),'utf8'),ctx);
const {createPresentation,ttfToEot,crc32}=ctx.DECK_PPTX_WRITER;

function unzip(bytes){
  const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),files=new Map();
  let end=bytes.length-22;while(dv.getUint32(end,true)!==0x06054b50)end--;
  let p=dv.getUint32(end+16,true);
  for(let i=0,n=dv.getUint16(end+10,true);i<n;i++){
    const method=dv.getUint16(p+10,true),crc=dv.getUint32(p+16,true),size=dv.getUint32(p+20,true),nameLen=dv.getUint16(p+28,true),local=dv.getUint32(p+42,true);
    const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+nameLen));
    const start=local+30+dv.getUint16(local+26,true)+dv.getUint16(local+28,true),raw=bytes.subarray(start,start+size);
    const data=method===8?new Uint8Array(inflateRawSync(raw)):raw;
    assert.equal(crc32(data),crc,'CRC of '+name);
    files.set(name,data);p+=46+nameLen+dv.getUint16(p+30,true)+dv.getUint16(p+32,true);
  }
  return files;
}
// Balanced tags are enough to catch broken string building; the full schema check runs separately.
function wellFormed(xml,name){
  const stack=[];
  for(const [,close,tag,self] of xml.replace(/<\?xml[^>]*\?>/,'').matchAll(/<(\/?)([A-Za-z_][\w:.-]*)(?:\s+[^<>]*?)?(\/?)>/g)){
    if(self)continue;
    if(close)assert.equal(stack.pop(),tag,name+': </'+tag+'>');else stack.push(tag);
  }
  assert.equal(stack.length,0,name+': unclosed '+stack.join(','));
}
async function sample(){
  const deck=createPresentation({title:'Test',author:'Test'});
  deck.addFont({typeface:'Lato',style:'regular',ttf:new Uint8Array(readFileSync(new URL('../assets/fonts/Lato-Regular.ttf',import.meta.url)))});
  const media=deck.addMedia(new Uint8Array(readFileSync(new URL('../assets/brand/conference-heart.png',import.meta.url))),'png');
  const title={name:'Tytuł & <test>',x:100,y:100,w:800,h:200,textBox:true,text:{paragraphs:[{lineHeight:100,runs:[{text:'Pierwszy',size:96}]},{lineHeight:100,runs:[{text:'drugi',size:96,color:'#ee312f'},{br:true,size:96},{text:'łamany',size:96}]}]}};
  const facet={name:'!!Fasetka',x:10,y:10,w:100,h:80,points:[[0,80],[50,0],[100,80]],fill:{color:'#cf1723'},line:null};
  const picture={name:'Serce',kind:'picture',media,x:1500,y:50,w:100,h:82};
  deck.addSlide({background:'#111111',shapes:[facet,title,picture],notes:'Notatka\nDruga linia',timing:{groups:[
    {trigger:'auto',effects:[0,1].map(i=>({shape:title,paragraphs:[i,i],cls:'entr',preset:[12,4],delay:i*85,behaviors:[{type:'visibility',value:'visible'},{type:'filter',filter:'wipe(down)',dur:800}]}))},
    {trigger:'click',effects:[{shape:facet,cls:'emph',preset:[8,0],repeat:'indefinite',untilNextClick:true,behaviors:[{type:'rotate',by:360,dur:1000}]},{shape:picture,cls:'entr',delay:100,behaviors:[{type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:300}]}]}]}});
  deck.addSlide({background:'#ffffff',shapes:[{...facet,x:400}],transition:{type:'morph',duration:800}});
  return unzip(await deck.build());
}
const text=(files,name)=>new TextDecoder().decode(files.get(name));

test('every part is declared, every relationship resolves and every XML part is well formed',async()=>{
  const files=await sample(),types=text(files,'[Content_Types].xml');
  assert.equal([...files.keys()][0],'[Content_Types].xml');
  for(const name of files.keys()){
    if(name.endsWith('.xml')||name.endsWith('.rels'))wellFormed(text(files,name),name);
    const ext=name.split('.').pop();
    if(name!=='[Content_Types].xml')assert.ok(types.includes('PartName="/'+name+'"')||types.includes('Extension="'+ext+'"'),'content type for '+name);
  }
  for(const [name] of files){
    if(!name.endsWith('.rels'))continue;
    const base=name.replace(/_rels\/[^/]*\.rels$/,'');
    for(const [,target] of text(files,name).matchAll(/Target="([^"]+)"/g)){
      const parts=(base+target).split('/'),resolved=[];
      for(const part of parts)part==='..'?resolved.pop():resolved.push(part);
      assert.ok(files.has(resolved.join('/')),name+' → '+target);
    }
  }
});
test('animations target existing shapes, pictures have no build entry, paragraphs build by paragraph',async()=>{
  const xml=text(await sample(),'ppt/slides/slide1.xml');
  const ids=[...xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'unique shape ids');
  for(const [,spid] of xml.matchAll(/spid="(\d+)"/g))assert.ok(ids.includes(spid),'spid '+spid);
  assert.match(xml,/<p:bldP spid="3" grpId="0" build="p"\/>/);
  assert.match(xml,/<p:bldP spid="2" grpId="0" animBg="1"\/>/);
  assert.doesNotMatch(xml,/<p:bldP spid="4"/,'picture');
  assert.match(xml,/<p:cond evt="onBegin" delay="0"><p:tn val="2"\/><\/p:cond>/,'first group starts with the slide');
  assert.match(xml,/nodeType="clickEffect"/);
  assert.match(xml,/repeatCount="indefinite"[^>]*>(?:<p:stCondLst>.*?<\/p:stCondLst>)<p:endCondLst><p:cond evt="onNext"/);
  assert.match(xml,/Tytuł &amp; &lt;test&gt;/);
});
test('Morph is wrapped for readers without it, notes are attached',async()=>{
  const files=await sample(),morph=text(files,'ppt/slides/slide2.xml');
  assert.match(morph,/<mc:AlternateContent[^>]*><mc:Choice xmlns:p159="[^"]+" Requires="p159"><p:transition[^>]*p14:dur="800"><p159:morph option="byObject"\/><\/p:transition><\/mc:Choice><mc:Fallback><p:transition[^>]*><p:fade\/><\/p:transition><\/mc:Fallback><\/mc:AlternateContent>/);
  assert.ok(files.has('ppt/notesSlides/notesSlide1.xml'));
  assert.ok(!files.has('ppt/notesSlides/notesSlide2.xml'));
  assert.match(text(files,'ppt/notesSlides/notesSlide1.xml'),/Druga linia/);
});
test('embedded font is an uncompressed EOT wrapping the original TrueType data',()=>{
  const ttf=new Uint8Array(readFileSync(new URL('../assets/fonts/Lato-Black.ttf',import.meta.url))),eot=ttfToEot(ttf);
  const dv=new DataView(eot.buffer);
  assert.equal(dv.getUint32(0,true),eot.length);
  assert.equal(dv.getUint32(4,true),ttf.length);
  assert.equal(dv.getUint32(8,true),0x00020001);
  assert.equal(dv.getUint16(34,true),0x504C);
  assert.equal(dv.getUint32(28,true),900);
  assert.deepEqual(eot.subarray(eot.length-ttf.length),ttf);
  assert.equal(new TextDecoder('utf-16le').decode(eot.subarray(84,84+dv.getUint16(82,true))),'Lato Black');
});
test('every animation behaviour the exporter uses is written',async()=>{
  const deck=createPresentation();
  const box={name:'Box',x:0,y:0,w:100,h:100,fill:{color:'#ee312f'}};
  const text={name:'Text',x:0,y:200,w:400,h:100,textBox:true,text:{paragraphs:[{runs:[{text:'HOMO',size:96}]}]}};
  deck.addSlide({shapes:[box,text],transition:{type:'fade',duration:200},timing:{groups:[{trigger:'auto',effects:[
    {shape:box,cls:'entr',preset:[31,0],behaviors:[{type:'visibility',value:'visible'},{type:'anim',attr:'ppt_w',dur:400,decel:1,keys:[[0,0],[1,'#ppt_w']]},{type:'anim',attr:'style.rotation',dur:400,keys:[[0,-80],[1,0]]},{type:'color',to:'#95161d',dur:1},{type:'color',to:'#ee312f',at:100,dur:200}]},
    {shape:box,cls:'emph',preset:[9,0],delay:500,behaviors:[{type:'opacity',value:.28,dur:400},{type:'rotate',by:-12.5,at:10,dur:100},{type:'scale',by:[1.2,1.2],dur:100},{type:'motion',path:'M 0 0 L 0.1 0 E',dur:300}]},
    {shape:text,cls:'entr',preset:[1,0],iterate:{type:'lt',ms:40},behaviors:[{type:'visibility',value:'visible'},{type:'filter',filter:'wipe(down)',dur:300}]},
    {shape:text,cls:'emph',preset:[8,0],repeat:2.5,autoReverse:true,behaviors:[{type:'rotate',by:5,dur:200}]}]}]}});
  const xml=text_(unzip(await deck.build()),'ppt/slides/slide1.xml');
  wellFormed(xml,'slide');
  for(const snippet of ['<p:attrName>ppt_w</p:attrName>','<p:fltVal val="0"/>','<p:strVal val="#ppt_w"/>','<p:attrName>style.rotation</p:attrName>','<p:fltVal val="-80"/>','<p:animClr','<a:srgbClr val="95161D"/>','<p:attrName>style.opacity</p:attrName>','prLst="opacity: 0.28"','<p:animRot by="-750000">','<p:by x="120000" y="120000"/>','ptsTypes="AA"','<p:tmAbs val="40"/>','filter="wipe(down)"','repeatCount="2500"','autoRev="1"','decel="100000"','<mc:Choice Requires="p14"><p:transition spd="fast" p14:dur="200"><p:fade/>'])
    assert.ok(xml.includes(snippet),snippet);
});
const text_=(files,name)=>new TextDecoder().decode(files.get(name));
test('the Google Slides version: a plain fade transition and click fades in and out',async()=>{
  const deck=createPresentation();
  const before={name:'Before',x:0,y:0,w:100,h:100,fill:{color:'#f1f1f1'}},after={...before,name:'After',fill:{color:'#ee312f'}};
  const line={name:'Line',x:0,y:200,w:400,h:100,textBox:true,text:{wrap:'none',anchor:'ctr',paragraphs:[{lineHeight:0,runs:[{text:'Wiersz',size:40}]}]}};
  deck.addSlide({shapes:[line]});
  deck.addSlide({shapes:[before,after,line],transition:{type:'plain',duration:600},timing:{groups:[{trigger:'auto',effects:[]},{trigger:'click',effects:[
    {shape:after,cls:'entr',preset:[10,0],behaviors:[{type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:400}]},
    {shape:before,cls:'exit',preset:[10,0],behaviors:[{type:'fade',dir:'out',dur:300},{type:'visibility',value:'hidden',at:299}]}]}]}});
  const files=unzip(await deck.build()),xml=text_(files,'ppt/slides/slide2.xml');
  wellFormed(xml,'slide');
  assert.ok(xml.includes('<p:transition spd="med"><p:fade/></p:transition>'),'plain fade transition');
  assert.ok(!xml.includes('mc:AlternateContent'),'no extension markup for importers');
  assert.equal((xml.match(/nodeType="clickEffect"/g)||[]).length,1,'one click');
  assert.ok(xml.includes('presetClass="exit"')&&xml.includes('transition="out" filter="fade"'),'fade out');
  assert.ok(!xml.includes('<a:lnSpc>'),'line boxes use the default spacing');
  assert.ok(text_(files,'ppt/slides/slide1.xml').includes('wrap="none"'),'no wrapping');
});
