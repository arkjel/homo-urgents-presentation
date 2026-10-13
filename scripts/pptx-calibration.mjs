// Builds exports/pptx-test.pptx: a short deck that checks, in real PowerPoint, every technique the
// exporter relies on (fonts, text metrics, shapes, effects, Morph, facet waves) before the full export.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const file of ['pptx-writer.js','motion.js'])vm.runInThisContext(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const {createPresentation}=globalThis.DECK_PPTX_WRITER;
const {mesh,rng,triangle,heartVertices:HV,heartFacets:HEART,shades:SHADES}=globalThis.DECK_MOTION.geometry;
const read=file=>new Uint8Array(fs.readFileSync(path.join(root,file)));
const W=1920,H=1080,RED='EE312F',INK='151515';

// Chrome measurements of the same strings (Lato from assets/fonts, same letter-spacing as the deck).
const CSS_WIDTH={A:[733.92,288.83],B:[812.64,518.31],C:[395.36,432.09],D:[206.39],E:[150.97+58.11],F:[549.97]};

const deck=createPresentation({title:'Homo Urgens – test eksportu PPTX',author:'Eksport HTML'});
deck.addFont({typeface:'Lato',style:'regular',ttf:read('assets/fonts/Lato-Regular.ttf')});
deck.addFont({typeface:'Lato',style:'bold',ttf:read('assets/fonts/Lato-Bold.ttf')});
deck.addFont({typeface:'Lato Black',style:'regular',ttf:read('assets/fonts/Lato-Black.ttf')});
const logoBytes=read('assets/brand/conference-logo.png');
const logo=deck.addMedia(logoBytes,'png');
const logoSize=[new DataView(logoBytes.buffer).getUint32(16),new DataView(logoBytes.buffer).getUint32(20)];

const rect=(name,x,y,w,h,color,extra={})=>({name,x,y,w,h,fill:color?{color}:null,line:null,...extra});
const run=(text,o={})=>({text,font:o.black?'Lato Black':'Lato',bold:o.bold,size:o.size,color:o.color||INK,alpha:o.alpha,spacing:o.spacing,caps:o.caps});
function textBox(name,x,y,w,lines,{lineHeight,align='l',...extra}={}){
  return {name,x,y,w,h:lineHeight*lines.length+2,fill:null,line:null,textBox:true,...extra,
    text:{wrap:'square',paragraphs:lines.map(runs=>({align,lineHeight,runs:Array.isArray(runs)?runs:[runs]}))}};
}
function poly(name,points,color,extra={}){
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);
  return {name,x,y,w:Math.max(1,Math.max(...xs)-x),h:Math.max(1,Math.max(...ys)-y),points:points.map(([px,py])=>[px-x,py-y]),fill:{color},line:null,...extra};
}
const note=(text,x=1180,y=40)=>textBox('Instrukcja',x,y,700,[run(text,{size:20,color:'888888'})],{lineHeight:26});
const appear=(shape,delay=0,behaviors=[],extra={})=>({shape,cls:'entr',preset:[10,0],delay,...extra,behaviors:[{type:'visibility',value:'visible'},...behaviors]});

// 1 — Fonts and text metrics against CSS guides --------------------------------------------
{
  const shapes=[];
  for(let x=100;x<W;x+=100)shapes.push(rect('Siatka x '+x,x,0,1,H,'E6E6E6'));
  for(let y=100;y<H;y+=100)shapes.push(rect('Siatka y '+y,0,y,W,1,'E6E6E6'));
  for(let x=100;x<W;x+=200)shapes.push(textBox('Etykieta '+x,x+4,4,60,[run(String(x),{size:12,color:'AAAAAA'})],{lineHeight:16}));
  shapes.push(textBox('Tytuł testu',130,40,900,[run('Test 1 · Fonty i pozycje tekstu',{size:24,bold:true,color:'666666'})],{lineHeight:30}));
  shapes.push(note('Linie: niebieska = góra wiersza w HTML, czerwona = linia bazowa w HTML, zielona = koniec tekstu w HTML.'));
  const sample=(key,x,y,boxW,lines,{size,lineHeight,align='l'},guidesFor=lines)=>{
    shapes.push(textBox('Próbka '+key,x,y,boxW,lines,{lineHeight,align}));
    guidesFor.forEach((_,i)=>{
      const top=y+i*lineHeight,base=top+(lineHeight-1.2*size)/2+0.987*size,width=CSS_WIDTH[key][i];
      const left=align==='ctr'?x+(boxW-width)/2:x;
      shapes.push(rect('Góra '+key+i,left,top,width,1.5,'2F6FFF'));
      shapes.push(rect('Baza '+key+i,left,base,width,1.5,'EE312F'));
      shapes.push(rect('Koniec '+key+i,left+width,top,1.5,lineHeight,'00A050'));
      if(align==='ctr')shapes.push(rect('Początek '+key+i,left,top,1.5,lineHeight,'00A050'));
    });
  };
  sample('A',130,150,780,[run('Potrzeba nie może',{black:true,size:96,spacing:-3.36}),run('czekać.',{black:true,size:96,spacing:-3.36})],{size:96,lineHeight:101.28});
  sample('B',130,420,860,[run('Wychowaliśmy pokolenie natychmiastowości.',{size:42,spacing:-0.63}),run('Co na to Retail Media onsite?',{size:42,spacing:-0.63})],{size:42,lineHeight:53.76});
  sample('C',1060,420,720,[run('Chce produktu lub usługi',{size:37,spacing:-0.444}),run('wtedy, kiedy ich potrzebuje',{size:37,spacing:-0.444})],{size:37,lineHeight:46.25,align:'ctr'});
  sample('D',130,640,260,[run('Tryb: teraz',{size:27,bold:true,spacing:3.78,caps:true,color:RED})],{size:27,lineHeight:33.75});
  sample('E',1060,640,260,[[run('78',{black:true,size:148,spacing:-10.36,color:RED}),run('%',{black:true,size:72,spacing:-1.44,color:RED})]],{size:148,lineHeight:148});
  sample('F',130,1000,600,[run('Inquiry / Glovo, IX 2026 · Użytkownicy q-commerce · s. 6',{size:22,color:'666666'})],{size:22,lineHeight:29.7});
  deck.addSlide({name:'Test 1',background:'FFFFFF',shapes,notes:'Sprawdź: czy teksty są w foncie Lato (Lato Black w nagłówku), czy pokrywają się z liniami pomocniczymi. Najlepiej: Plik → Eksportuj → PNG, wszystkie slajdy.'});
}

// 2 — Shapes: freeforms, rounded frames, ring with round caps, gradients, shadows, picture ---
{
  const shapes=[];
  shapes.push(textBox('Tytuł testu',130,40,900,[run('Test 2 · Kształty i grafika',{size:24,bold:true,color:'666666'})],{lineHeight:30}));
  shapes.push({name:'Logo',kind:'picture',media:logo,x:130,y:110,w:480,h:480*logoSize[1]/logoSize[0],descr:'I love marketing & technology'});
  shapes.push({name:'Telefon',x:130,y:220,w:610,h:620,geom:'roundRect',adj:{adj:28/610*100000},fill:{color:'FFFFFF'},line:{color:'D9D9D9',width:2},shadow:{color:'000000',alpha:.07,blur:70,dist:24,dir:90}});
  shapes.push({name:'Telefon – nagłówek',x:131,y:221,w:608,h:76,geom:'round2SameRect',adj:{adj1:27/76*100000,adj2:0},fill:{color:'FFC244'},line:null});
  shapes.push(textBox('Telefon – Glovo',161,234,200,[run('Glovo',{black:true,size:41,spacing:-1.85,color:'00856B'})],{lineHeight:49}));
  shapes.push({name:'Telefon – oferta',x:161,y:330,w:548,h:110,fill:{color:'EDF8F3'},line:null});
  shapes.push(rect('Telefon – pasek oferty',161,330,5,110,'00856B'));
  shapes.push(textBox('Telefon – tekst oferty',183,348,500,[run('Sponsorowane · przykład',{size:16,color:'6B7C72'}),run('Antyperspirant · marka A',{size:25,bold:true}),run('Spray · 150 ml · w ofercie sklepu',{size:19,color:'40705D'})],{lineHeight:30}));
  shapes.push(rect('Telefon – linia wiersza',161,520,548,1,'EEEEEE'));
  // Metric ring: track + arc with round caps, 78%.
  shapes.push({name:'Metryka – tor',x:905,y:240,w:292,h:292,geom:'ellipse',fill:null,line:{color:'E3E3E3',width:11}});
  shapes.push({name:'Metryka – pierścień 78%',x:905,y:240,w:292,h:292,geom:'arc',adj:{adj1:16200000,adj2:((270+3.6*78)%360)*60000},fill:null,line:{color:RED,width:11,cap:'rnd'}});
  shapes.push(textBox('Metryka – liczba',905,312,292,[[run('78',{black:true,size:120,spacing:-8.4,color:RED}),run('%',{black:true,size:58,color:RED})]],{lineHeight:148,align:'ctr'}));
  // Antiperspirant can: gradients, soft shadow, rotation.
  const can=[1300,620];
  shapes.push({name:'Puszka – cień',x:can[0]-35,y:can[1]+540,w:400,h:34,geom:'ellipse',fill:{color:'000000',alpha:.13},line:null,softEdge:16,rot:-7});
  shapes.push({name:'Puszka – nakrętka',x:can[0]+32,y:can[1]-70,w:266,h:145,geom:'round2SameRect',adj:{adj1:54/145*100000,adj2:9/145*100000},rot:7,fill:{gradient:{angle:0,stops:[{pos:0,color:'171717'},{pos:.38,color:'484848'},{pos:.83,color:'252525'},{pos:1,color:'121212'}]}},line:null});
  shapes.push({name:'Puszka – korpus',x:can[0]+12,y:can[1]+64,w:270,h:460,geom:'round2SameRect',adj:{adj1:8/270*100000,adj2:50/270*100000},rot:7,fill:{gradient:{angle:0,stops:[{pos:0,color:'BFC0C4'},{pos:.18,color:'F2F2F4'},{pos:.4,color:'FFFFFF'},{pos:.8,color:'EEEEEE'},{pos:1,color:'BDBEC3'}]}},line:null});
  // Low-poly heart from the measured facets.
  HEART.forEach(([names,color],i)=>shapes.push(poly('Serce – fasetka '+(i+1),names.split(' ').map(n=>[1250+HV[n][0]*.25,120+HV[n][1]*.25]),color.replace('#',''))));
  shapes.push({name:'Komunikat obrócony',x:880,y:640,w:330,h:110,rot:-7,fill:{color:RED},line:null,shadow:{color:'000000',alpha:.2,blur:30,dist:18,dir:90},text:{wrap:'square',anchor:'ctr',inset:[0,40,0,40],paragraphs:[{align:'l',lineHeight:48,runs:[run('Poznaj markę',{black:true,size:44,color:'FFFFFF'})]}]}});
  shapes.push(textBox('Tekst półprzezroczysty',880,820,600,[run('Biały tekst 60% na czerwonym tle',{size:30,bold:true,color:'FFFFFF',alpha:.6})],{lineHeight:40,fill:{color:RED}}));
  deck.addSlide({name:'Test 2',background:'FFFFFF',shapes,notes:'Sprawdź: logo PNG, telefon z cieniem i zaokrąglonymi rogami, pierścień 78% z zaokrąglonymi końcami, gradienty puszki, miękki cień, serce z fasetek, obrócony komunikat, przezroczysty tekst.'});
}

// 3 — Text and entrance effects -----------------------------------------------------------------
{
  const shapes=[],auto=[],click1=[],click2=[];
  const heading=textBox('Nagłówek (wiersze)',130,150,900,[run('Potrzeba nie może',{black:true,size:96,spacing:-3.36,color:'FFFFFF'}),run('czekać.',{black:true,size:96,spacing:-3.36,color:'FFFFFF'})],{lineHeight:101.28});
  const subtitle=textBox('Podtytuł (zanikanie + ruch)',130,380,900,[run('Wchodzi z dołu o 24 px i zanika.',{size:40,color:'AAAAAA'})],{lineHeight:50});
  const letters=textBox('HOMO URGENS (litery)',130,470,1100,[run('HOMO URGENS',{black:true,size:120,spacing:-5.4,color:'FFFFFF'})],{lineHeight:130});
  const typed=textBox('Pisanie (A: odstęp 40 ms)',130,640,900,[run('Właśnie weszliście w tryb',{bold:true,size:34,color:'FFFFFF'})],{lineHeight:42});
  const typedB=textBox('Pisanie (B: zanikanie po literach)',130,700,900,[run('Właśnie weszliście w tryb',{bold:true,size:34,color:'FFFFFF'})],{lineHeight:42});
  shapes.push(textBox('Tytuł testu',130,40,900,[run('Test 3 · Animacje tekstu i wejścia',{size:24,bold:true,color:'888888'})],{lineHeight:30}),note('Start sam: wiersze, podtytuł, litery, pisanie, paski, pierścień, pętle. Klik 1: TERAZ. Klik 2: podtytuł znika, ramka przestaje drgać.'));
  shapes.push(heading,subtitle,letters,typed,typedB);
  [0,1].forEach(i=>auto.push({shape:heading,paragraphs:[i,i],cls:'entr',preset:[12,4],delay:60+i*85,behaviors:[
    {type:'visibility',value:'visible'},
    {type:'anim',attr:'ppt_y',dur:820,decel:1,keys:[[0,'#ppt_y+#ppt_h'],[1,'#ppt_y']]},
    {type:'filter',filter:'wipe(down)',dir:'in',dur:820,decel:1}]}));
  auto.push(appear(subtitle,300,[{type:'fade',dir:'in',dur:600},{type:'anim',attr:'ppt_y',dur:600,decel:1,keys:[[0,'#ppt_y+'+(24/H).toFixed(5)],[1,'#ppt_y']]}]));
  auto.push({shape:letters,cls:'entr',preset:[31,0],delay:500,iterate:{type:'lt',pct:36/640},behaviors:[
    {type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:220},
    {type:'anim',attr:'ppt_y',dur:640,keys:[[0,'#ppt_y-'+(90/H).toFixed(5)],[.55,'#ppt_y+'+(10/H).toFixed(5)],[1,'#ppt_y']]},
    {type:'anim',attr:'ppt_w',dur:640,keys:[[0,'#ppt_w*1.55'],[.55,'#ppt_w*0.95'],[1,'#ppt_w']]},
    {type:'anim',attr:'ppt_h',dur:640,keys:[[0,'#ppt_h*1.55'],[.55,'#ppt_h*0.95'],[1,'#ppt_h']]},
    {type:'anim',attr:'style.rotation',dur:640,keys:[[0,-8],[1,0]]}]});
  auto.push({shape:typed,cls:'entr',preset:[1,0],delay:1300,iterate:{type:'lt',ms:40},behaviors:[{type:'visibility',value:'visible'}]});
  auto.push({shape:typedB,cls:'entr',preset:[10,0],delay:1300,iterate:{type:'lt',pct:.08},behaviors:[{type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:500}]});
  // Wipe directions, labelled so the result can be read off a screenshot or video.
  ['wipe(left)','wipe(right)','wipe(up)','wipe(down)','barn(outVertical)','barn(inVertical)'].forEach((filter,i)=>{
    const bar=rect('Pasek '+filter,1280,170+i*80,420,46,RED);
    shapes.push(bar,textBox('Etykieta '+filter,1280,220+i*80,420,[run(filter,{size:18,color:'888888'})],{lineHeight:22}));
    auto.push(appear(bar,400+i*250,[{type:'filter',filter,dir:'in',dur:900}],{preset:[22,8]}));
  });
  const ringTrack={name:'Pierścień – tor',x:1500,y:700,w:250,h:250,geom:'ellipse',fill:null,line:{color:'353535',width:11}};
  const ring={name:'Pierścień – koło',x:1500,y:700,w:250,h:250,geom:'arc',adj:{adj1:16200000,adj2:((270+3.6*78)%360)*60000},fill:null,line:{color:RED,width:11,cap:'rnd'}};
  shapes.push(ringTrack,ring);
  auto.push(appear(ring,600,[{type:'filter',filter:'wheel(1)',dir:'in',dur:1200,decel:1}],{preset:[21,1]}));
  // Loops: slow spin until the slide ends; jitter until the next click.
  const orbit={name:'Orbita (pętla obrotu)',x:1000,y:770,w:200,h:200,geom:'arc',adj:{adj1:16200000,adj2:0},fill:null,line:{color:'FFFFFF',alpha:.3,width:20}};
  const jitter={name:'Ramka (drga do kliknięcia)',x:500,y:820,w:300,h:90,rot:4,fill:{color:'222222'},line:{color:'555555',width:2},text:{wrap:'square',anchor:'ctr',paragraphs:[{align:'ctr',lineHeight:40,runs:[run('Nowa kolekcja',{black:true,size:34,color:'FFFFFF'})]}]}};
  shapes.push(orbit,jitter);
  auto.push({shape:orbit,cls:'emph',preset:[8,0],delay:0,repeat:'indefinite',behaviors:[{type:'rotate',by:360,dur:6000}]});
  auto.push({shape:jitter,cls:'path',preset:[0,0],delay:0,repeat:'indefinite',untilNextClick:true,behaviors:[
    {type:'anim',attr:'ppt_x',dur:560,keys:[[0,'#ppt_x'],[.2,'#ppt_x+0.002'],[.4,'#ppt_x-0.0025'],[.6,'#ppt_x+0.0015'],[.8,'#ppt_x-0.001'],[1,'#ppt_x']]},
    {type:'anim',attr:'ppt_y',dur:560,keys:[[0,'#ppt_y'],[.2,'#ppt_y-0.003'],[.4,'#ppt_y+0.002'],[.6,'#ppt_y+0.003'],[.8,'#ppt_y-0.002'],[1,'#ppt_y']]}]});
  // Click 1: stamp. Click 2: exit.
  const stamp=textBox('TERAZ (pieczątka)',130,880,600,[run('TERAZ',{black:true,size:120,spacing:-6,color:RED})],{lineHeight:130});
  shapes.push(stamp);
  click1.push(appear(stamp,0,[{type:'fade',dir:'in',dur:200},
    {type:'anim',attr:'ppt_w',dur:440,keys:[[0,'#ppt_w*2.4'],[.55,'#ppt_w*0.94'],[1,'#ppt_w']]},
    {type:'anim',attr:'ppt_h',dur:440,keys:[[0,'#ppt_h*2.4'],[.55,'#ppt_h*0.94'],[1,'#ppt_h']]}],{preset:[23,16]}));
  click2.push({shape:subtitle,cls:'exit',preset:[10,0],delay:0,behaviors:[{type:'fade',dir:'out',dur:400},{type:'visibility',value:'hidden',at:399}]});
  deck.addSlide({name:'Test 3',background:'111111',shapes,notes:'Bez klikania: wiersze nagłówka wysuwają się spod maski jeden po drugim, podtytuł wchodzi z dołu, litery HOMO URGENS spadają po kolei z obrotem, dwa warianty pisania, sześć pasków z etykietami kierunku, pierścień rysuje się od góry zgodnie z ruchem wskazówek, łuk się kręci, ramka drga. Klik 1: TERAZ wbija się jak pieczątka. Klik 2: podtytuł znika, ramka przestaje drgać.',
    timing:{groups:[{trigger:'auto',effects:auto},{trigger:'click',effects:click1},{trigger:'click',effects:click2}]}});
}

// 4 — Keyframed motion: squash and stretch, off-slide particles, colour flash, rotation chains ------
{
  const shapes=[],auto=[],click1=[];
  shapes.push(textBox('Tytuł testu',130,40,900,[run('Test 4 · Ruch z klatek kluczowych',{size:24,bold:true,color:'666666'})],{lineHeight:30}),note('Start sam: puszka spada i się ugina, kwadrat obraca się tam i z powrotem, trójkąty błyskają kolorem. Klik 1: kursor klika, fala, konfetti. W trybie edycji kursora i konfetti nie widać na slajdzie (leżą poza nim).'));
  const canX=200,canY=380,bottom=canY+600;
  const cap={name:'Puszka – nakrętka',x:canX+67,y:canY+10,w:266,h:145,geom:'round2SameRect',adj:{adj1:37000,adj2:6000},fill:{gradient:{angle:0,stops:[{pos:0,color:'171717'},{pos:.4,color:'484848'},{pos:1,color:'121212'}]}},line:null};
  const body={name:'Puszka – korpus',x:canX+65,y:canY+145,w:270,h:460,geom:'round2SameRect',adj:{adj1:3000,adj2:18500},fill:{gradient:{angle:0,stops:[{pos:0,color:'BFC0C4'},{pos:.4,color:'FFFFFF'},{pos:1,color:'BDBEC3'}]}},line:null};
  const shadow={name:'Puszka – cień',x:canX,y:bottom-20,w:400,h:34,geom:'ellipse',fill:{color:'000000',alpha:.15},line:null,softEdge:14};
  shapes.push(shadow,cap,body);
  // Drop keyframes from the HTML scene, scaled about the can's bottom edge (fall sampled for gravity).
  const drop=[[0,-780,.96,1.06],[.125,-731,.96,1.06],[.25,-585,.96,1.06],[.375,-341,.96,1.06],[.5,0,.96,1.06],[.62,0,1.08,.88],[.78,-28,.98,1.03],[.9,0,1.015,.985],[1,0,1,1]];
  for(const part of [cap,body]){
    const toBottom=bottom-(part.y+part.h/2);
    auto.push(appear(part,260,[{type:'fade',dir:'in',dur:115},
      {type:'anim',attr:'ppt_y',dur:1150,keys:drop.map(([t,dy,,sy])=>[t,'#ppt_y+'+((dy+(1-sy)*toBottom)/H).toFixed(5)])},
      {type:'anim',attr:'ppt_w',dur:1150,keys:drop.map(([t,,sx])=>[t,'#ppt_w*'+sx])},
      {type:'anim',attr:'ppt_h',dur:1150,keys:drop.map(([t,,,sy])=>[t,'#ppt_h*'+sy])}]));
  }
  auto.push(appear(shadow,260,[{type:'fade',dir:'in',dur:600},{type:'anim',attr:'ppt_w',dur:1150,keys:[[0,'#ppt_w*0.3'],[.5,'#ppt_w*0.6'],[.62,'#ppt_w*1.12'],[1,'#ppt_w']]}]));
  // Rotation chain on an unrotated square.
  const square=rect('Kwadrat (obrót +90, −45)',700,450,160,160,'222222');
  shapes.push(square);
  auto.push({shape:square,cls:'emph',preset:[8,0],delay:400,behaviors:[{type:'rotate',by:90,dur:600},{type:'rotate',by:-45,at:700,dur:400}]});
  // Colour flash: triangles flash a darker shade, then settle on the brand red.
  const random=rng(5);
  for(let i=0;i<6;i++){
    const t=poly('Błysk '+(i+1),triangle(70,random).map(([x,y])=>[1000+i*130+x,520+y]),RED);
    shapes.push(t);
    auto.push({shape:t,cls:'emph',preset:[1,0],delay:600+i*120,behaviors:[{type:'color',to:SHADES[i%3],dur:1},{type:'color',to:RED,at:250,dur:300}]});
  }
  // Click 1: cursor glides in from outside the slide, clicks; ripple; confetti bursts.
  const target=[1500,800];
  const cursor={name:'Kursor',x:W+80,y:H+80,w:46,h:67,points:[[3,3],[3,52],[15,41],[25,63],[34,58],[25,38],[41,38]].map(([x,y])=>[x*46/46,y]),fill:{color:INK},line:{color:'FFFFFF',width:2}};
  const off=(x,y,s)=>['#ppt_x+'+((x-(s.x+s.w/2))/W).toFixed(5),'#ppt_y+'+((y-(s.y+s.h/2))/H).toFixed(5)];
  shapes.push(cursor);
  const path=[[1880,1050],[1640,980],target];
  click1.push(appear(cursor,0,[
    {type:'anim',attr:'ppt_x',dur:720,keys:path.map((p,i)=>[i/2,off(p[0]+20,p[1]+30,cursor)[0]])},
    {type:'anim',attr:'ppt_y',dur:720,keys:path.map((p,i)=>[i/2,off(p[0]+20,p[1]+30,cursor)[1]])},
    {type:'fade',dir:'out',at:1500,dur:300},{type:'visibility',value:'hidden',at:1800}]));
  const ripple={name:'Ripple',x:W+200,y:H+200,w:44,h:44,geom:'ellipse',fill:null,line:{color:'00856B',width:4}};
  shapes.push(ripple);
  click1.push(appear(ripple,760,[
    {type:'anim',attr:'ppt_x',dur:560,keys:[[0,off(...target,ripple)[0]],[1,off(...target,ripple)[0]]]},
    {type:'anim',attr:'ppt_y',dur:560,keys:[[0,off(...target,ripple)[1]],[1,off(...target,ripple)[1]]]},
    {type:'anim',attr:'ppt_w',dur:560,keys:[[0,'#ppt_w*0.3'],[1,'#ppt_w*2.6']]},
    {type:'anim',attr:'ppt_h',dur:560,keys:[[0,'#ppt_h*0.3'],[1,'#ppt_h*2.6']]},
    {type:'fade',dir:'out',dur:560},{type:'visibility',value:'hidden',at:560}]));
  const confettiRandom=rng(9);
  for(let i=0;i<24;i++){
    const size=8+confettiRandom()*14,piece=poly('Konfetti '+(i+1),triangle(size,confettiRandom).map(([x,y])=>[W+40+x,40+i*40+y]),SHADES[i%3]);
    const ang=-Math.PI/2+(confettiRandom()-.5)*Math.PI*1.3,v=420+confettiRandom()*600,vx=Math.cos(ang)*v,vy=Math.sin(ang)*v,T=1.6+confettiRandom();
    const at=o=>{const t=o*T;return [target[0]+vx*t*(1-.38*o),target[1]+vy*t+850*t*t];};
    const offs=[0,.2,.4,.6,.8,1].map(o=>[o,...off(...at(o),piece)]);
    shapes.push(piece);
    click1.push(appear(piece,800,[
      {type:'anim',attr:'ppt_x',dur:T*1000,keys:offs.map(([o,x])=>[o,x])},
      {type:'anim',attr:'ppt_y',dur:T*1000,keys:offs.map(([o,,y])=>[o,y])},
      {type:'anim',attr:'style.rotation',dur:T*1000,keys:[[0,0],[1,(confettiRandom()-.5)*1400]]},
      {type:'fade',dir:'out',at:T*800,dur:T*200},{type:'visibility',value:'hidden',at:T*1000}]));
  }
  deck.addSlide({name:'Test 4',background:'FFFFFF',shapes,notes:'Bez klikania: puszka spada z góry, ugina się przy lądowaniu i odbija, cień rośnie. Kwadrat obraca się o 90° i wraca o 45°. Sześć trójkątów błyska ciemniejszą czerwienią. Klik 1: kursor wjeżdża z prawego dolnego rogu i klika, zielony okrąg się rozchodzi, wybuchają konfetti.',
    timing:{groups:[{trigger:'auto',effects:auto},{trigger:'click',effects:click1}]}});
}

// 5 → 6 — Morph: same-named shapes glide, the figure shatters off-slide, then a red facet wave --------
const figure=HEART.map(([names,color],i)=>({names:names.split(' '),color:color.replace('#',''),i}));
{
  const shapes=[];
  shapes.push(textBox('Tytuł testu',130,40,900,[run('Test 5 · Morph (kliknij, aby przejść dalej)',{size:24,bold:true,color:'888888'})],{lineHeight:30}));
  shapes.push(textBox('!!Tytuł',600,380,720,[run('Proszę czekać',{black:true,size:94,color:'FFFFFF'})],{lineHeight:103,align:'ctr'}));
  shapes.push(rect('!!Loader – tor',610,640,700,5,'353535'),rect('!!Loader – pasek',610,640,693,5,RED));
  figure.forEach(f=>shapes.push(poly('!!Figura '+(f.i+1),f.names.map(n=>[1330+HV[n][0]*.1,470+HV[n][1]*.1]),f.color)));
  deck.addSlide({name:'Test 5',background:'111111',shapes,notes:'Kliknij: przejście Morph na slajd 6. Fasetki serca (figura) mają się rozlecieć poza ekran i zniknąć, pasek ma się wydłużyć i przesunąć, napis ma urosnąć i zniknąć. Jedna fasetka zostaje i zmienia kolor na zielony.'});
}
{
  const shapes=[],auto=[],random=rng(31);
  shapes.push(textBox('!!Tytuł',528,340,864,[run('Proszę czekać',{black:true,size:94,color:'FFFFFF',alpha:0})],{lineHeight:103,align:'ctr'}));
  shapes.push(rect('!!Loader – tor',310,700,900,5,'353535'),rect('!!Loader – pasek',310,700,900,5,RED));
  figure.forEach(f=>{
    const keep=f.i===0,ang=-Math.PI/2+(f.i-4)*0.7,dist=keep?0:1500;
    const pts=f.names.map(n=>[1330+HV[n][0]*.1+Math.cos(ang)*dist,470+HV[n][1]*.1+Math.sin(ang)*dist]);
    const s=poly('!!Figura '+(f.i+1),pts,keep?'00856B':f.color);
    if(!keep){s.rot=(f.i%2?1:-1)*160;s.fill.alpha=0;}
    else{s.x+=200;s.y+=200;}
    shapes.push(s);
  });
  // The wave sits under everything; static fill is the final flat red, so editing shows a normal red slide.
  const tris=mesh(12,7,31,.38),impact=[1310,642];
  const ds=tris.map(t=>Math.hypot((t[0][0]+t[1][0]+t[2][0])/3-impact[0],(t[0][1]+t[1][1]+t[2][1])/3-impact[1])),max=Math.max(...ds);
  const wave=tris.map((t,i)=>{
    const s=poly('Tło – fasetka '+(i+1),t,RED,{line:{color:RED,width:1.6}});
    const shade=SHADES[Math.floor(random()*3)].replace('#','');
    auto.push(appear(s,300+ds[i]/max*470,[
      {type:'color',to:shade,dur:1},
      {type:'anim',attr:'ppt_w',dur:420,decel:1,keys:[[0,0],[1,'#ppt_w']]},
      {type:'anim',attr:'ppt_h',dur:420,decel:1,keys:[[0,0],[1,'#ppt_h']]},
      {type:'anim',attr:'style.rotation',dur:420,decel:1,keys:[[0,(i%2?1:-1)*(50+random()*80)],[1,0]]},
      {type:'color',to:RED,at:200,dur:260}],{preset:[31,0]}));
    return s;
  });
  shapes.unshift(...wave);
  const letters=textBox('HOMO URGENS',130,300,1100,[run('HOMO',{black:true,size:192,spacing:-8.6,color:'FFFFFF'}),run('URGENS',{black:true,size:192,spacing:-8.6,color:'FFFFFF'})],{lineHeight:188});
  shapes.push(letters);
  auto.push({shape:letters,cls:'entr',preset:[31,0],delay:900,iterate:{type:'lt',pct:.056},behaviors:[
    {type:'visibility',value:'visible'},{type:'fade',dir:'in',dur:220},
    {type:'anim',attr:'ppt_y',dur:640,keys:[[0,'#ppt_y-0.0833'],[.55,'#ppt_y+0.0093'],[1,'#ppt_y']]},
    {type:'anim',attr:'ppt_w',dur:640,keys:[[0,'#ppt_w*1.55'],[.55,'#ppt_w*0.95'],[1,'#ppt_w']]},
    {type:'anim',attr:'ppt_h',dur:640,keys:[[0,'#ppt_h*1.55'],[.55,'#ppt_h*0.95'],[1,'#ppt_h']]}]});
  shapes.push(textBox('Tytuł testu',130,1010,1200,[run('Test 6 · Morph + czerwona fala fasetek',{size:24,bold:true,color:'FFFFFF',alpha:.6})],{lineHeight:30}));
  deck.addSlide({name:'Test 6',background:'111111',shapes,transition:{type:'morph',duration:1000},notes:'Po Morph: od prawego końca paska rozchodzi się fala trójkątów w trzech odcieniach czerwieni, które przechodzą w płaską czerwień. Potem litery HOMO URGENS. W trybie edycji slajd ma wyglądać jak zwykłe czerwone tło z napisem.',
    timing:{groups:[{trigger:'auto',effects:auto}]}});
}

// 7 — Facet wave between themes: previous colour as background, new colour tiles in -----------------
{
  const shapes=[],auto=[];
  const tris=mesh(9,5,9,.34),origin=[0,H];
  const ds=tris.map(t=>Math.hypot((t[0][0]+t[1][0]+t[2][0])/3-origin[0],(t[0][1]+t[1][1]+t[2][1])/3-origin[1])),max=Math.max(...ds);
  tris.forEach((t,i)=>{
    const s=poly('Tło – fasetka '+(i+1),t,'FFFFFF',{line:{color:'FFFFFF',width:1.6}});
    shapes.push(s);
    auto.push(appear(s,ds[i]/max*340,[
      {type:'anim',attr:'ppt_w',dur:380,keys:[[0,0],[1,'#ppt_w']]},
      {type:'anim',attr:'ppt_h',dur:380,keys:[[0,0],[1,'#ppt_h']]},
      {type:'anim',attr:'style.rotation',dur:380,keys:[[0,(i%2?1:-1)*80],[1,0]]}],{preset:[31,0]}));
  });
  const logoShape={name:'Logo',kind:'picture',media:logo,x:130,y:57,w:480,h:480*logoSize[1]/logoSize[0],descr:'I love marketing & technology'};
  const heading=textBox('Nagłówek',130,300,1100,[run('Każdy z nas bywa',{black:true,size:96,spacing:-3.36}),run('Homo Urgens',{black:true,size:96,spacing:-3.36})],{lineHeight:101.28});
  shapes.push(logoShape,heading,textBox('Tytuł testu',130,1010,1200,[run('Test 7 · Fala fasetek przy zmianie tła (ciemne → jasne)',{size:24,bold:true,color:'666666'})],{lineHeight:30}));
  auto.push(appear(logoShape,250,[{type:'fade',dir:'in',dur:300}]));
  [0,1].forEach(i=>auto.push({shape:heading,paragraphs:[i,i],cls:'entr',preset:[12,4],delay:420+i*85,behaviors:[
    {type:'visibility',value:'visible'},{type:'anim',attr:'ppt_y',dur:820,decel:1,keys:[[0,'#ppt_y+#ppt_h'],[1,'#ppt_y']]},{type:'filter',filter:'wipe(down)',dir:'in',dur:820,decel:1}]}));
  deck.addSlide({name:'Test 7',background:'111111',shapes,transition:{type:'fade',duration:200},notes:'Po krótkim przenikaniu: na ciemnym tle białe trójkąty rozkładają się falą od lewego dolnego rogu, aż całe tło jest białe. Potem logo i nagłówek. W trybie edycji slajd ma wyglądać jak zwykły biały slajd (bez widocznych szwów między trójkątami).',
    timing:{groups:[{trigger:'auto',effects:auto}]}});
}

const out=path.join(root,'exports','pptx-test.pptx');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,await deck.build());
console.log('Wrote '+path.relative(root,out)+' ('+(fs.statSync(out).size/1024).toFixed(0)+' KB, '+deck.slides.length+' slides)');
