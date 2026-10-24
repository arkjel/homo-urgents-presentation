/* Content and research values. Data slides cite the study in one line; SOURCES.md keeps each page and base.
 * Research: Inquiry / Glovo, Homo Urgens, September 2026, supplied PDF.
 * The guests story, its screens, brands and prices are authored examples, not recordings or measured campaigns.
 */
(function(){
  const heading=(title,kicker='')=>'<header class="slide-heading" data-move>'+(kicker?'<p class="kicker" data-edit>'+kicker+'</p>':'')+'<h1 data-edit>'+title+'</h1></header>';
  const reveal=(step,html,cls='')=>'<div class="reveal '+cls+'" data-reveal="'+step+'">'+html+'</div>';
  const metric=(value,label,tone='red')=>'<figure class="metric tone-'+tone+'" data-move><div class="metric-disc" style="--value:'+value+'" aria-hidden="true"><svg viewBox="0 0 320 320"><circle class="ring-track" cx="160" cy="160" r="146"/><circle class="ring-value" cx="160" cy="160" r="146" pathLength="100"/></svg><strong class="metric-value" data-value="'+value+'">'+value+'<span>%</span></strong></div><figcaption data-edit>'+label+'</figcaption></figure>';
  // Horizontal bars, longest = 100. Brand rows use ink, category phrases the accent red.
  const barChart=(title,rows,caption)=>'<figure class="bar-chart" data-move><p class="bar-chart-title">'+title+'</p><div class="bar-rows">'+rows.map(([label,value,tone='red'])=>'<div class="bar-row tone-'+tone+'"><span class="bar-label" data-edit>'+label+'</span><span class="bar-track"><i style="width:'+value+'%"></i></span></div>').join('')+'</div><figcaption data-edit>'+caption+'</figcaption></figure>';
  const inquiry='Źródło: Badanie Inquiry - Homo Urgens 2026';

  // Drawing helpers. SVG uses only polygons and circles so every shape stays a plain, exportable path.
  const pts=list=>list.map(([x,y])=>x.toFixed(1)+','+y.toFixed(1)).join(' ');
  const poly=(points,fill,extra='')=>'<polygon points="'+pts(points)+'" fill="'+fill+'"'+extra+'/>';
  const arc=(cx,cy,rx,ry,from=0,to=360,n=32)=>Array.from({length:n+1},(_,i)=>{const a=(from+(to-from)*i/n)*Math.PI/180;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)];});
  const ellipse=(cx,cy,rx,ry,fill,extra='')=>poly(arc(cx,cy,rx,ry,0,360,36).slice(0,-1),fill,extra);
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(p,q,t)=>'#'+rgb(p).map((v,i)=>Math.round(v+(rgb(q)[i]-v)*t).toString(16).padStart(2,'0')).join('');
  // Half a lemon in a 56×48 box, cut face to the viewer; the rind of the back half shows on the right.
  // The fridge draws it at scale 1, the inside view ×6 with finer facets, so the zoom between them lands shape on shape.
  const halfLemon=(ox,oy,s,fine=false)=>{
    const P=(x,y)=>[ox+x*s,oy+y*s],F=P(24,24),D=P(30,25),R=24*s;
    const at=(c,rx,ry,deg)=>{const a=deg*Math.PI/180;return [c[0]+rx*Math.cos(a),c[1]+ry*Math.sin(a)];};
    const lit=deg=>.5+.5*Math.cos((deg+135)*Math.PI/180),n=fine?18:1;
    let out='';
    // Back rind, then the face: rind ring, pith, ten segments with pith between them.
    for(let i=0;i<n&&fine;i++){const a0=i*20,a1=a0+20;out+=poly([D,at(D,26*s,23*s,a0),at(D,26*s,23*s,a1)],mix('#cf9a12','#f0c235',lit(a0+10)));}
    if(!fine)out+=ellipse(D[0],D[1],26*s,23*s,'#e2b020');
    out+=ellipse(F[0],F[1],R,R,'#f4cb33')+ellipse(F[0],F[1],.9*R,.9*R,'#fbf1c9');
    for(let i=0;i<10;i++){
      const a0=12+i*36,a1=a0+28,am=a0+14,inner=at(F,.1*R,.1*R,am),p0=at(F,.8*R,.8*R,a0),pm=at(F,.84*R,.84*R,am),p1=at(F,.8*R,.8*R,a1);
      if(fine)out+=poly([inner,p0,pm],mix('#f0ca3e','#fbe68e',Math.min(1,lit(am)+.1)))+poly([inner,pm,p1],mix('#f0ca3e','#fbe68e',Math.max(0,lit(am)-.1)));
      else out+=poly([inner,p0,pm,p1],'#f7d955');
    }
    return out;
  };

  // Inside the fridge of the next slide, seen from its back shelf. One vanishing point; the back wall is the screen scaled by k.
  // The half lemon's box is centred on (960,700): motion.js zooms the drawn fridge 6× onto its lemon and lands exactly here.
  const fridgeInside=()=>{
    const k=.42,back=([x,y])=>[960+(x-960)*k,540+(y-540)*k],mirror=list=>list.map(([x,y])=>[1920-x,y]);
    const rib=y=>{const [,b]=back([0,y]);return [[[0,y],[557,b],[557,b+30*k],[0,y+30]],[[0,y-10],[557,b-10*k],[557,b],[0,y]]];};
    const ribs=[120,300,480].flatMap(y=>{const [shade,light]=rib(y);return [poly(shade,'#ddd2b8'),poly(light,'#fcf8ee'),poly(mirror(shade),'#d9ceb3'),poly(mirror(light),'#fbf6ea')];}).join('');
    return '<svg viewBox="0 0 1920 1080" aria-hidden="true">'
      +poly([[0,0],[1920,0],[1363,313],[557,313]],'#fbf6ea')
      +poly([[700,215],[1220,215],[1180,300],[740,300]],'#fff9ec')+poly([[795,243],[1125,243],[1101,286],[819,286]],'#fffdf8')
      +poly([[557,313],[1363,313],[1363,767],[557,767]],'#f6eedc')+poly([[557,313],[1363,313],[1363,420],[557,420]],'#f9f3e5')
      +poly([[0,0],[557,313],[557,767],[0,1080]],'#ebe1ca')+poly(mirror([[0,0],[557,313],[557,767],[0,1080]]),'#e7ddc5')
      +ribs
      +poly([[0,844],[1920,844],[1363,668],[557,668]],'#ede6d4')+poly([[557,664],[1363,664],[1363,668],[557,668]],'#dcd1b8')
      +poly([[0,892],[1920,892],[1920,1080],[0,1080]],'#e9e0cb')+poly([[0,892],[1920,892],[1920,904],[0,904]],'#cfc2a6')
      +poly([[800,952],[1120,952],[1100,980],[820,980]],'#d3c6aa')
      +poly([[0,844],[1920,844],[1920,892],[0,892]],'#d9ccb0')+poly([[0,844],[1920,844],[1920,852],[0,852]],'#e8dec8')
      +ellipse(966,842,175,12,'#d4c8ab')+'<g class="inside-lemon">'+halfLemon(792,556,6,true)+'</g></svg>';
  };

  // The story clock has no digits: one turn is the 20 minutes until the guests arrive. Tension, never a delivery time.
  const storyClock=minute=>{
    const C=60,R=47,parts=[];
    for(let k=1;k<=minute;k++)parts.push(poly([[C,C],...arc(C,C,R,R,-90+(k-1)*18,-90+k*18,4)],'currentColor',' class="clock-wedge" data-k="'+k+'"'));
    const ticks=[0,90,180,270].map(a=>{const r=a*Math.PI/180,c=Math.cos(r),s=Math.sin(r),p=(d,w)=>[C+d*s+w*c,C-d*c+w*s];return poly([p(41,-2.5),p(41,2.5),p(51,2.5),p(51,-2.5)],'currentColor',' class="clock-tick"');}).join('');
    return '<div class="story-clock" data-clock="'+minute+'" aria-label="Zegar opowieści: goście w drodze"><span class="clock-label" data-edit>Goście<br>w drodze</span>'+
      '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="clock-face" cx="60" cy="60" r="54"/>'+parts.join('')+ticks+
      poly([[57,66],[63,66],[61.5,20],[58.5,20]],'currentColor',' class="clock-hand" style="transform:rotate('+minute*18+'deg)"')+'<circle class="clock-pin" cx="60" cy="60" r="6"/></svg></div>';
  };

  // Product art: small packs for lists, a chocolate bar for packshots.
  // A branded bar opens like the packshots; the plain one stays a category icon.
  const pack=(kind,brand='')=>kind==='bar'&&brand?'<span class="pack pack-bar pack-open" aria-hidden="true">'+barIcon+'<span class="pack-sleeve brand-'+brand.toLowerCase()+'"><b>'+brand+'</b></span></span>':
    '<span class="pack pack-'+kind+(brand?' brand-'+brand.toLowerCase():'')+'" aria-hidden="true">'+(brand?'<b>'+brand+'</b>':'')+'</span>';
  const bar=(brand,label)=>'<span class="choc" aria-hidden="true">'+barOpen+'<span class="choc-sleeve brand-'+brand.toLowerCase()+'"><b>'+brand+'</b><i>'+label+'</i></span></span>';
  const row=(kind,brand,name,detail,price,cls='')=>'<div class="product-row '+cls+'">'+(snackArt[kind]?snack(kind,brand):pack(kind,brand))+'<div><strong data-edit>'+name+'</strong><span class="product-detail" data-edit>'+detail+'</span></div><b data-edit>'+price+'</b><span class="product-add" aria-hidden="true">+</span></div>';
  const ad='<span class="ad-disclosure" data-edit>Sponsorowane · przykład</span>';
  const appHeader='<header class="shop-header"><span class="shop-wordmark" data-edit>Aplikacja szybkich dostaw</span><span class="shop-cart-icon" aria-hidden="true">▣</span></header>';
  const frame=(mode,body)=>'<section class="shopping-frame app-'+mode+'" data-move aria-label="Ilustracyjny ekran aplikacji szybkich dostaw">'+appHeader+'<div class="shop-body">'+body+'</div></section>';
  const top=(context,title)=>'<p class="shop-context" data-edit>'+context+'</p><h2 data-edit>'+title+'</h2>';
  // Banner still life: lemonade, a can and a bag of nachos behind a half-open chocolate bar. Tilted parts are rotated point by point.
  const turn=(list,cx,cy,deg)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return list.map(([x,y])=>[cx+(x-cx)*c-(y-cy)*s,cy+(x-cx)*s+(y-cy)*c]);};
  const box=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  const bagSide=Array.from({length:11},(_,i)=>[142+i*6.8,i%2?31:26]);
  const bag=(list,fill,extra)=>poly(turn(list,176,100,8),fill,extra);
  const chocPart=(list,fill,extra)=>poly(turn(list,116,171,-7),fill,extra);
  const nachosArt='<svg class="banner-art" viewBox="0 0 240 210" aria-hidden="true">'+ellipse(124,104,100,100,'#fff',' fill-opacity=".13"')+ellipse(122,200,104,8,'#5a0d10',' fill-opacity=".35"')+
    bag([...bagSide,[212,60],[213,100],[212,140],...bagSide.map(([x,y])=>[x,y===26?172:167]).reverse(),[140,140],[139,100],[140,60]],'#e2932b')+
    bag(box(142,31,210,40),'#c4741a')+bag(box(142,158,210,167),'#c4741a')+bag(box(154,52,198,63),'#fff')+
    bag(arc(176,112,26,26,0,360,36).slice(0,-1),'#fff4d8')+bag([[160,122],[176,94],[188,120]],'#f6c445')+bag([[172,127],[190,104],[195,128]],'#e9a72f')+
    poly(box(41,12,59,26),'#1f5c42')+poly([[43,26],[57,26],[57,44],[70,58],[73,70],[73,180],[69,186],[31,186],[27,180],[27,70],[30,58],[43,44]],'#ffe7a0')+
    poly(box(33,74,39,170),'#fff',' fill-opacity=".55"')+poly(box(27,104,73,146),'#2f7d5b')+ellipse(50,125,11,11,'#f6d33c')+ellipse(50,125,6,6,'#fff3b0')+
    ellipse(100,160,20,6,'#2c6f98')+poly(box(80,72,120,160),'#3a8fc2')+poly([[80,100],[120,92],[120,104],[80,112]],'#fff')+poly(box(86,80,91,152),'#fff',' fill-opacity=".35"')+
    ellipse(100,72,20,6,'#dfe5ea')+ellipse(100,72,14,3.6,'#b9c2ca')+
    chocPart(box(156,152,188,190),'#5a3321')+[[160,155],[175,155],[160,173],[175,173]].map(([x,y])=>chocPart(box(x,y,x+11,y+14),'#7a4a2e')).join('')+
    chocPart([[146,150],[158,150],[154,157],[160,164],[154,171],[160,178],[155,185],[158,192],[146,192]],'#d6b15e')+
    chocPart(box(44,150,150,192),'#23305e')+chocPart(box(44,158,150,163),'#d6b15e')+chocPart(box(56,172,112,181),'#fff')+'</svg>';
  // A square of chocolate, bevelled and lit from the top left.
  const chocSquare=(x,y,w,h,b=10)=>{const r=x+w,d=y+h;
    return poly([[x,y],[r,y],[r-b,y+b],[x+b,y+b]],'#85512f')+poly([[x,y],[x+b,y+b],[x+b,d-b],[x,d]],'#7a4a2e')+
      poly([[r,y],[r,d],[r-b,d-b],[r-b,y+b]],'#5a3321')+poly([[x,d],[x+b,d-b],[r-b,d-b],[r,d]],'#4a2a1a')+poly(box(x+b,y+b,r-b,d-b),'#6d4029');};
  // What a packshot bar shows past its sleeve (the sleeve ends at 140): torn foil, then two columns of squares.
  const barOpen='<svg viewBox="0 0 196 76">'+poly(box(122,69,194,75),'#3d2214')+poly(box(122,5,194,71),'#331c11')+
    [0,1,2].flatMap(c=>[0,1,2].map(r=>chocSquare(123+c*24,6+r*22,22,20,3.5))).join('')+
    poly([[130,3],[146,3],[142,10],[150,18],[143,26],[151,34],[144,42],[150,50],[142,58],[149,66],[143,75],[130,75]],'#c9ccd2')+
    poly([[130,4],[142,4],[139,11],[146,19],[140,27],[147,35],[141,43],[146,51],[139,59],[145,67],[140,74],[130,74]],'#e8eaee')+
    poly([[140,30],[144,36],[140,40]],'#f6f7f9')+poly([[140,4],[142,-4],[150,-7],[156,-2],[149,3],[151,6]],'#c9ccd2')+'</svg>';
  // The same in a list's 58 px slot (the sleeve ends at 36).
  const barIcon='<svg viewBox="0 0 58 36">'+poly(box(27,31,57,35),'#3d2214')+poly(box(27,3,57,33),'#331c11')+
    [0,1,2].flatMap(c=>[0,1,2].map(r=>chocSquare(27.5+c*10,3.5+r*10,9,9,1.8))).join('')+
    poly([[31,1.5],[38,1.5],[36.5,5],[39.5,9],[37,13],[40,17],[37.5,21],[40,25],[37,29],[39.5,32],[37.5,35],[31,35]],'#c9ccd2')+
    poly([[31,2],[36.5,2],[35.5,5.5],[37.5,9.5],[35.5,13.5],[38,17.5],[36,21.5],[38,25.5],[35.5,29.5],[37.5,33],[36,34.5],[31,34.5]],'#e8eaee')+
    poly([[34,2],[35,-1.5],[38.5,-3],[41,-.8],[38,1.5],[38.8,2.8]],'#c9ccd2')+'</svg>';
  // Search results: each snack in its real pack, drawn on a 64 × 72 grid, lit from the top left; the brand letter is HTML over it.
  // A pillow bag: crimped seals, a puffed body (lit side, shade, dark edge laid over its colour) and a window onto what is inside.
  const crimp=(x0,x1,y,dy,n)=>Array.from({length:n+1},(_,i)=>[x0+(x1-x0)*i/n,y+(i%2?dy:0)]);
  const bagLeft=[[10,13],[8,19],[6.5,28],[6,37],[6.5,46],[8,54],[10,60]],bagRight=bagLeft.map(([x,y])=>[64-x,y]).reverse();
  const pillow=([light,mid,shade,dark],seal,inside)=>
    poly([...bagLeft,...bagRight],mid)+poly([...bagLeft,[19,60],[19,13]],light)+poly([[42,13],[42,60],...bagRight],shade)+poly([[50,13],[50,60],...bagRight],dark)+
    poly([...crimp(7,57,6,3,10),[57,13],[7,13]],seal)+poly([[7,60],[57,60],...crimp(57,7,66,-3,10)],seal)+ellipse(32,43,12.5,12.5,'#fff4d8')+inside;
  const snackArt={
    // Nachos A, as in the banner: two chips in the window.
    nachos:pillow(['#eba142','#e2932b','#d6861f','#c4741a'],'#b5661a',poly([[23.5,48],[31,34],[37,47]],'#f6c445')+poly([[29.5,51],[38.5,39.5],[41,51.5]],'#e9a72f')),
    // Paprika chips B: two chips dusted red, and a pepper.
    chips:pillow(['#2d3c72','#23305e','#1d2850','#161d3a'],'#121830',
      poly(turn(arc(28,40,8.5,5.6,0,360,18).slice(0,-1),28,40,-24),'#f2b84b')+poly(turn(arc(34,44,8.5,5.6,0,360,18).slice(0,-1),34,44,18),'#e9a03b')+
      [[25,39],[29,37.5],[31,41],[33,43.5],[37,45],[34,46.5]].map(([x,y])=>ellipse(x,y,.9,.9,'#c7372a')).join('')+
      poly([[35,50],[39.5,47],[44,49],[42.5,54.5],[38,55.5],[35.5,53.5]],'#d9342b')+poly([[36.5,50],[39.5,48.2],[40,50.5],[37.5,52]],'#ef5a45')+poly([[39.2,47.5],[40.5,44],[42,44.6],[40.6,47.8]],'#3f8a3a')),
    // Salt sticks C: a tall narrow bag, the sticks behind a clear window.
    sticks:poly([[18,10],[46,10],[47.5,24],[48,36],[47.5,48],[46,62],[18,62],[16.5,48],[16,36],[16.5,24]],'#2f7d5b')+
      poly([[18,10],[24,10],[24,62],[18,62],[16.5,48],[16,36],[16.5,24]],'#3a8f69')+poly([[41,10],[46,10],[47.5,24],[48,36],[47.5,48],[46,62],[41,62]],'#276b4d')+
      poly([...crimp(18,46,3,3,8),[46,10],[18,10]],'#1f5c42')+poly([[18,62],[46,62],...crimp(46,18,69,-3,8)],'#1f5c42')+
      poly([[24,27],[40,27],[42,29],[42,56],[40,58],[24,58],[22,56],[22,29]],'#eef4ef')+
      [[23.5,56,32],[27,56.5,29],[30.5,55,30.5],[34,56.5,32],[28.5,48,40]].map(([x,y0,y1],i)=>poly([[x,y0],[x+2.6,y0],[x+2.6+(y0-y1)*.2,y1],[x+(y0-y1)*.2,y1]],['#d9a05b','#e8b874','#d9a05b','#e8b874','#cf9450'][i])).join('')+
      [[25,51],[26.6,40],[29,48],[30.4,36],[33,52],[34.6,40],[36.6,33],[32,45]].map(([x,y])=>ellipse(x,y,.7,.7,'#fff')).join('')+
      poly([[38.5,29],[42,29],[42,56],[40,58],[38.5,58]],'#fff',' fill-opacity=".45"'),
    // Butter popcorn D: a striped paper bag filled over the top.
    popcorn:[0,1,2,3,4,5].map(i=>{const t=13+6.4*i,b=18.5+4.5*i;return poly([[t,28],[t+6.4,28],[b+4.5,68],[b,68]],i%2?(i<3?'#fff4e6':'#f1e6d4'):(i<3?'#7a3e22':'#65321b'));}).join('')+
      [[17,26],[25,24],[33,26],[41,24],[48,27],[21,18],[30,16],[38,17],[45,20],[33,9],[25,10.5]].map(([x,y],i)=>
        ellipse(x+.5,y+.8,5,4.6,'#e7cf8a')+ellipse(x,y,4.6,4.3,i%2?'#f8e7b0':'#fff1c4')+ellipse(x-1.2,y-1.2,2.1,1.9,'#fffdf4')).join('')+
      ellipse(32,49,9.5,9.5,'#fff4e6')+ellipse(32,49,7.8,7.8,'#7a3e22')
  };
  const snack=(kind,brand)=>'<span class="snack snack-'+kind+'" aria-hidden="true"><svg viewBox="0 0 64 72">'+snackArt[kind]+'</svg><b>'+brand+'</b></span>';
  const app={
    home:frame('home',top('Dzień dobry!','Czego dziś potrzebujesz?')+
      '<div class="shop-search"><span aria-hidden="true">⌕</span><span data-edit>Szukaj produktów</span></div>'+
      '<div class="app-banner">'+ad+'<strong data-edit>Spotkanie ze znajomymi?</strong><span class="banner-cta" data-edit>Zobacz produkty →</span>'+nachosArt+'</div>'+
      '<p class="app-section" data-edit>Kategorie</p><div class="app-cats">'+
      [['bottle','Napoje'],['bag','Przekąski'],['bar','Słodycze'],['fruit','Owoce']].map(([kind,name])=>'<span class="app-cat"><span class="cat-icon">'+pack(kind)+'</span><span data-edit>'+name+'</span></span>').join('')+'</div>'),
    search:frame('search',top('Na spotkanie','Znajdź produkt')+
      '<div class="shop-search"><span aria-hidden="true">⌕</span><span class="type-query" data-edit>przekąski</span></div>'+
      reveal(1,'<div class="relevant-offer">'+snack('nachos','A')+'<div>'+ad+'<strong data-edit>Nachosy solone · marka A</strong><span data-edit>200 g</span></div><b data-edit>8,99 zł</b><span class="product-add" aria-hidden="true">+</span></div>'+
        row('chips','B','Chipsy paprykowe · marka B','150 g','6,99 zł')+row('sticks','C','Paluszki solone · marka C','200 g','4,49 zł')+row('popcorn','D','Popcorn maślany · marka D','90 g','5,49 zł'),'shop-results')+
      '<div class="shop-bottom"><span data-edit>Szukam kategorii. Marka jest otwarta.</span></div>'),
    shelf:frame('shelf',top('Słodycze','Czekolady')+'<div class="app-grid">'+
      [['B','Czekolada z orzechami','Z ORZECHAMI','marka B · 100 g','6,49 zł','sponsored selected'],['A','Czekolada gorzka 70%','GORZKA 70%','marka A · 100 g','7,29 zł',''],['C','Czekolada mleczna','MLECZNA','marka C · 90 g','5,49 zł',''],['D','Czekolada z karmelem','Z KARMELEM','marka D · 100 g','6,99 zł','']]
        .map(([brand,name,label,detail,price,cls])=>'<div class="app-tile '+cls+'">'+(cls.includes('sponsored')?'<span class="tile-tag" data-edit>Sponsorowane</span>':'')+'<div class="tile-shot">'+bar(brand,label)+'</div><strong data-edit>'+name+'</strong><span class="product-detail" data-edit>'+detail+'</span><div class="tile-foot"><b data-edit>'+price+'</b><span class="product-add" aria-hidden="true">+</span></div></div>').join('')+'</div>'+
      reveal(1,'<p class="selection-feedback" data-edit>Dodano do koszyka: czekolada z orzechami</p>')),
    cart:frame('cart',top('Mój koszyk','Twój koszyk')+
      row('bottle','C','Lemoniada · marka C','1 l','7,99 zł')+row('nachos','A','Nachosy solone · marka A','200 g','8,99 zł')+row('bar','B','Czekolada z orzechami · marka B','100 g','6,49 zł')+
      '<div class="cart-suggestion"><p><strong data-edit>Pasuje do Twojego koszyka</strong>'+ad+'</p>'+row('jar','A','Dip salsa · marka A','200 g · do nachosów','9,99 zł','suggested')+'</div>'+
      '<div class="shop-cta" data-edit>Przejdź do podsumowania</div><p class="shop-cart-note" data-edit>Przykładowe ceny. Dostawa i opłaty widoczne przed zakupem.</p>')
  };
  const journey=(step,question,statement,punch,screen)=>'<div class="shopping-copy">'+heading(question,step)+'<p class="shopping-statement" data-edit>'+statement+'</p>'+reveal(1,'<p class="shopping-punch red-text" data-edit>'+punch+'</p>')+'</div>'+screen;

  // Then and now: one shop within reach, then many shops in one phone.
  const thenMap='<div class="then-map" aria-hidden="true">'+
    [70,170,270].map(y=>'<i class="street h" style="top:'+y+'px"></i>').join('')+[110,300,470,640].map(x=>'<i class="street v" style="left:'+x+'px"></i>').join('')+
    '<i class="map-radius"></i><i class="route v"></i><i class="route h"></i>'+
    '<svg class="map-pin pin-home" viewBox="0 0 56 56">'+poly([[28,4],[53,25],[46,25],[46,52],[10,52],[10,25],[3,25]],'#151515')+poly([[23,36],[33,36],[33,52],[23,52]],'#fff')+'</svg>'+
    '<svg class="map-pin pin-shop" viewBox="0 0 64 58">'+poly([[8,22],[56,22],[56,56],[8,56]],'#fff',' stroke="#151515" stroke-width="3"')+
      [0,1,2,3].map(i=>poly([[4+i*14,6],[18+i*14,6],[18+i*14,22],[4+i*14,22]],i%2?'#fff':'#ee312f',' stroke="#151515" stroke-width="2"')).join('')+poly([[26,36],[38,36],[38,56],[26,56]],'#151515')+'</svg>'+
    '<span class="map-tag tag-home">Dom</span><span class="map-tag tag-shop">Sklep</span></div>';
  const nowApp='<div class="now-app" aria-label="Schemat aplikacji szybkich dostaw"><header class="now-app-header"><span data-edit>Aplikacja szybkich dostaw</span><span class="shop-cart-icon" aria-hidden="true">▣</span></header><div class="now-shops">'+
    [['Market','#ee312f'],['Apteka','#2f7d5b'],['Drogeria','#6c72b3'],['Piekarnia','#e2932b'],['Kwiaciarnia','#d9668f'],['Napoje','#3a8fc2'],['Zoologiczny','#8a6d3b'],['Elektronika','#555']]
      .map(([name,color])=>'<span class="now-shop"><i style="background:'+color+'"></i><span data-edit>'+name+'</span></span>').join('')+'</div>'+
    reveal(2,'<div class="now-sponsor">'+ad+'<strong data-edit>Polecane na wieczór ze znajomymi</strong></div>')+'</div>';

  // The needs behind 78%: four authored still lifes, no people.
  // A fruit, scoop or kernel, faceted like the story's lemon: an outer and an inner ring, lit from the top left.
  const gem=(cx,cy,rx,ry,[light,mid,dark],n=10)=>{
    const rim=arc(cx,cy,rx,ry,0,360,n).slice(0,-1),H=[cx-rx*.18,cy-ry*.2],inner=rim.map(([x,y])=>[H[0]+(x-H[0])*.56,H[1]+(y-H[1])*.56]);
    const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(p,q,t)=>'#'+rgb(p).map((v,i)=>Math.round(v+(rgb(q)[i]-v)*t).toString(16).padStart(2,'0')).join('');
    const shade=(tri,i)=>{const x=(tri.reduce((s,p)=>s+p[0],0)/3-cx)/rx,y=(tri.reduce((s,p)=>s+p[1],0)/3-cy)/ry;
      const b=Math.min(1,Math.max(0,.5+.5*(-.55*x-.83*y)*1.25+(i%2?.05:-.05)));return b<.5?mix(dark,mid,b*2):mix(mid,light,(b-.5)*2);};
    return rim.flatMap((p,i)=>{const k=(i+1)%n;return [[p,rim[k],inner[k]],[p,inner[k],inner[i]],[H,inner[i],inner[k]]];}).map((tri,i)=>{const fill=shade(tri,i);return poly(tri,fill,' stroke="'+fill+'" stroke-width=".6" stroke-linejoin="round"');}).join('');};
  const needScene=(bg,body)=>'<svg class="need-art" viewBox="0 0 400 280" aria-hidden="true">'+poly([[0,0],[400,0],[400,280],[0,280]],bg)+body+'</svg>';
  const shelf=y=>poly([[40,y],[360,y],[400,y+12],[0,y+12]],'#ede6d4')+poly([[0,y+12],[400,y+12],[400,y+20],[0,y+20]],'#d9ccb0');
  const needArt=[
    // The fridge: a jar, ketchup, the story's lemon, and only a dashed outline where the milk should be.
    needScene('#f6eedc',poly([[0,0],[400,0],[360,22],[40,22]],'#fbf6ea')+poly([[0,0],[40,22],[40,252],[0,280]],'#ebe1ca')+poly([[400,0],[360,22],[360,252],[400,280]],'#e7ddc5')+
      poly([[40,22],[360,22],[360,64],[40,64]],'#f9f3e5')+poly([[160,22],[240,22],[232,34],[168,34]],'#fffdf8')+shelf(112)+shelf(206)+
      poly([[70,64],[118,64],[120,116],[68,116]],'#cfe0b4')+poly([[76,70],[88,70],[86,110],[74,110]],'#e6f0d8')+poly([[96,80],[112,84],[108,106],[94,100]],'#8fb36a')+poly([[72,50],[116,50],[118,64],[70,64]],'#ee312f')+poly([[72,50],[116,50],[116,55],[72,55]],'#f25553')+
      poly([[138,116],[138,64],[146,48],[164,48],[172,64],[172,116]],'#cf1723')+poly([[138,116],[138,64],[146,48],[155,48],[155,116]],'#ee312f')+poly([[147,34],[163,34],[164,48],[146,48]],'#151515')+
      poly([[214,116],[214,58],[226,40],[266,40],[278,58],[278,116]],'#efe4cc',' stroke="#c9b993" stroke-width="3" stroke-dasharray="9 7" stroke-linejoin="round"')+
      poly([[300,116],[346,116],[346,96],[300,104]],'#f4cf3c')+poly([[300,104],[346,96],[338,90]],'#fdeb98')+
      gem(110,186,34,22,['#fdeb98','#f4cf3c','#cf980c'],12)+
      poly([[24,238],[376,238],[384,280],[16,280]],'#e9e0cb')+poly([[24,238],[376,238],[376,244],[24,244]],'#fbf6ea')+poly([[170,256],[230,256],[226,264],[174,264]],'#cfc2a6')),
    // The pharmacy: water, a bag with the green cross (the pharmacy's colour on slide 6), pills and a thermometer.
    needScene('#e6eef0',poly([[250,0],[320,0],[240,170],[170,170]],'#eef4f6')+poly([[0,178],[400,160],[400,280],[0,280]],'#d6a774')+poly([[0,178],[400,160],[400,168],[0,186]],'#e4bb8c')+
      poly([[40,92],[94,92],[88,190],[46,190]],'#d6e9f2')+poly([[43,122],[91,122],[88,190],[46,190]],'#a9d0e4')+poly([[50,98],[60,98],[58,182],[52,182]],'#f4fafd')+ellipse(67,92,27,6,'#eef6fa')+
      poly([[214,74],[238,86],[242,170],[220,178]],'#dcdcd6')+poly([[118,74],[214,74],[220,178],[112,178]],'#fbfbf9')+poly([[118,74],[134,62],[150,74],[166,62],[182,74],[198,62],[214,74]],'#ecece6')+
      poly([[158,104],[176,104],[176,150],[158,150]],'#2f7d5b')+poly([[144,118],[190,118],[190,136],[144,136]],'#2f7d5b')+
      poly([[236,206],[318,194],[332,232],[250,244]],'#d3d8de')+poly([[236,206],[318,194],[325,213],[243,225]],'#e6e9ed')+
      [0,1,2,3].flatMap(i=>[0,1].map(j=>{const s=(i+.5)/4,t=(j+.5)/2;return ellipse(236+82*s+14*t,206-12*s+38*t,8,6,'#fff',' stroke="#bcc2ca" stroke-width="1.5"');})).join('')+
      poly([[48,238],[176,214],[178,222],[50,246]],'#fff')+poly([[48,238],[64,235],[66,243],[50,246]],'#ee312f')+poly([[136,222],[160,218],[162,226],[138,230]],'#cfd6dd')),
    // Everyday groceries: a paper bag with a baguette, greens and milk; an apple on the counter.
    needScene('#f3efe8',[70,140].map(y=>poly([[0,y],[400,y],[400,y+3],[0,y+3]],'#e2dacd')).join('')+[80,160,240,320].map(x=>poly([[x,0],[x+3,0],[x+3,200],[x,200]],'#e2dacd')).join('')+
      poly([[0,200],[400,200],[400,280],[0,280]],'#e9e0cb')+poly([[0,200],[400,200],[400,208],[0,208]],'#fbf6ea')+ellipse(186,228,96,10,'#d9ccb0')+
      poly([[150,104],[196,18],[214,26],[172,108]],'#e2a65a')+[.3,.5,.7].map(t=>{const x=161+44*t,y=106-84*t;return poly([[x-8,y+2],[x+6,y-6],[x+8,y-2],[x-6,y+6]],'#f6cf8f');}).join('')+
      poly([[122,104],[96,40],[112,44],[134,100]],'#3f7a3a')+poly([[128,104],[124,28],[140,34],[138,102]],'#5a9b4c')+poly([[134,104],[156,50],[164,60],[142,104]],'#7cbb5f')+
      poly([[200,110],[200,54],[209,40],[223,40],[232,54],[232,110]],'#fff')+poly([[216,40],[223,40],[232,54],[232,110],[216,110]],'#eef1f4')+poly([[207,28],[225,28],[224,40],[208,40]],'#3a8fc2')+poly([[200,72],[232,72],[232,92],[200,92]],'#cfe3f1')+
      poly([[236,98],[268,110],[272,214],[244,226]],'#9c6438')+poly([[110,98],[236,98],[244,226],[102,226]],'#c8925e')+poly([[110,98],[236,98],[237,112],[109,112]],'#d8a774')+poly([[106,170],[240,170],[240,173],[106,173]],'#b47f4f')+
      gem(306,206,26,24,['#ff6b5e','#ee312f','#95161d'])+poly([[305,184],[309,184],[311,170],[307,170]],'#5a3321')+poly([[310,176],[326,166],[318,180]],'#5a9b4c')),
    // A sudden craving: a night window, popcorn and ice cream on the table.
    needScene('#1d2240',poly([[28,18],[206,18],[206,150],[28,150]],'#2d3566')+poly([[38,28],[196,28],[196,140],[38,140]],'#28306a')+ellipse(150,62,20,20,'#fbe78a')+ellipse(160,56,18,18,'#28306a')+
      poly([[38,140],[38,110],[62,110],[62,96],[86,96],[86,118],[112,118],[112,88],[134,88],[134,114],[160,114],[160,102],[196,102],[196,140]],'#161b3a')+
      [[46,118],[70,104],[74,122],[94,126],[120,96],[124,108],[142,122],[170,110],[182,120]].map(([x,y])=>poly([[x,y],[x+6,y],[x+6,y+6],[x,y+6]],'#ffc244')).join('')+
      poly([[115,28],[119,28],[119,140],[115,140]],'#2d3566')+poly([[38,82],[196,82],[196,86],[38,86]],'#2d3566')+
      poly([[0,196],[400,182],[400,280],[0,280]],'#5a3a2a')+poly([[0,196],[400,182],[400,190],[0,204]],'#6d4029')+
      [[86,118,'#fff6d6'],[104,110,'#f8e7b0'],[122,114,'#fff6d6'],[140,116,'#f8e7b0'],[96,124,'#f8e7b0'],[132,124,'#fff6d6'],[114,124,'#fff6d6']].map(([x,y,c])=>gem(x,y,12,10,['#fffdf4',c,'#e7cf8a'],7)).join('')+
      [0,1,2,3,4].map(i=>poly([[76+16*i,124],[92+16*i,124],[84+12.8*(i+1),206],[84+12.8*i,206]],i%2?'#fff':'#ee312f')).join('')+
      poly([[228,146],[300,146],[292,210],[236,210]],'#f6d2dc')+poly([[264,146],[300,146],[292,210],[264,210]],'#ecbccb')+poly([[228,146],[300,146],[299,156],[229,156]],'#ee312f')+
      gem(250,140,22,16,['#fff3d6','#f6dfae','#d9b77a'],9)+gem(280,136,22,16,['#a5694a','#7a4627','#5d331c'],9)+poly([[286,122],[318,84],[324,88],[292,126]],'#c9ccd2'))
  ];
  const needs='<div class="needs-grid" data-move>'+['Brakujący produkt<br>spożywczy','Leki lub produkty<br>z apteki','Zwykłe zakupy<br>spożywcze','Produkty pod wpływem<br>chwilowej ochoty']
    .map((caption,i)=>'<figure class="need-card">'+needArt[i]+'<figcaption data-edit>'+caption+'</figcaption></figure>').join('')+'</div>';

  // The guests on their way (slide 12): a round little red car driving right, with two friends inside, in facets lit from the top left
  // like the heart. A long hood in front, a short trunk behind. Its ground line (y = 176) lands on the top edge of the red band;
  // motion.js spins the wheels, rocks the body and blows the exhaust.
  const guestCar=(()=>{
    const facet=(list,fill)=>poly(list,fill,' stroke="'+fill+'" stroke-width=".8" stroke-linejoin="round"');
    const reds=['#7d1118','#95161d','#b51a22','#cf1723','#e0262a','#ee312f','#f25553','#f6716d'];
    // The lower body, rounded at both ends: two strips of facets (beltline to crease, crease to sill), brighter on top and towards the light.
    const xs=[30,36,50,72,96,120,144,168,192,216,240,264,288,312,336,356,368];
    const belt=[110,94,83,79,78,78,78,78,78,78,78,78,78,78,79.5,84,96],crease=[116,110,108,108,108,108,108,108,108,108,108,108,108,108,108,110,118],sill=[141,148,151,151,151,151,151,151,151,151,151,151,151,151,151,147,137];
    const strip=(top,bottom,base)=>xs.slice(1).flatMap((x,i)=>{const a=[xs[i],top[i]],b=[x,top[i+1]],c=[x,bottom[i+1]],d=[xs[i],bottom[i]];return i%2?[[a,b,d],[b,c,d]]:[[a,b,c],[a,c,d]];})
      .map((t,i)=>facet(t,reds[Math.max(0,Math.min(7,Math.round((base+.18*(1-(t[0][0]+t[1][0]+t[2][0])/1200)+(i%2?.07:-.07))*7)))])).join('');
    // The domed cabin: its outline and the two windows inside it, point for point, so the frame between them is a ring of facets.
    // The rear window slants down to the trunk; the windscreen curves down to the hood.
    const rearOut=[[188.5,12],[160,12],[129,12.8],[108.2,16.5],[97.6,26.4],[89.8,46.9],[83,78]],rearWin=[[184,22],[160,22],[130,22],[114,25],[104,33],[97,48],[91,78]];
    const frontOut=[[188.5,12],[210,12.2],[227.8,13.2],[246.2,20.2],[258.6,34.5],[267,55],[271.5,78]],frontWin=[[193,22],[210,22],[228,24],[241,31],[250,42],[256,58],[259,78]];
    const ring=(out,win,fills)=>out.slice(1).map((p,i)=>facet([out[i],p,win[i+1],win[i]],fills[i])).join('');
    // Friends in profile, facing the road; faces in the heroine's grey facets (mascot.js).
    const head=[[0,-14],[12.5,-9],[13,7],[0,14],[-13,7],[-12.5,-9]],skin=['#ececec','#dadada','#cecece','#e2e2e2','#f3f3f3','#fbfbfb'];
    const face=at=>head.map((p,i)=>facet(at([p,head[(i+1)%6],[0,0]]),skin[i])).join('')+facet(at([[13,-1],[17,4],[13,6]]),'#dadada');
    const calm=at=>poly(at([[5,-4],[8,-4],[8,0],[5,0]]),'#151515')+poly(at([[4,8],[10,7],[8,10]]),'#8e1219');
    // The driver sits in front, behind the frame (drawn after him), which hides any bounce past the glass.
    const driver=(()=>{const at=list=>list.map(([x,y])=>[218+x,50+y]);
      return '<g class="car-guest">'+poly(at([[-17,30],[-14,18],[-5,14],[6,14],[14,18],[17,30]]),'#e9a72f')+face(at)+calm(at)+
        [[[[-14,-6],[-9,-6],[-11,5],[-14.5,3]],'#7a4627'],[[[-14,-6],[-11,-14],[0,-19],[10,-15],[14,-7]],'#2c6f98'],[[[-11,-14],[0,-19],[-2,-12]],'#3a8fc2'],[[[10,-9],[25,-6],[24,-3],[12,-5]],'#1f5577']]
          .map(([list,fill])=>facet(at(list),fill)).join('')+'</g>';})();
    // The passenger in the back is drawn over the frame: motion.js rolls her window down and she leans out into the wind, beaming.
    // Her torso ends on the sill and stretches up from it; the long hair turns back in the wind; wind strands and the happy face wait hidden.
    const rider=(()=>{const at=list=>list.map(([x,y])=>[140+x,50+y]);
      return '<g class="car-guest car-rider"><g class="car-lean" data-pivot="140,78">'+
        '<g class="car-torso" data-pivot="140,78">'+facet(at([[-17,28],[-15,18],[-6,14],[6,14],[15,18],[17,28]]),'#2f7d5b')+facet(at([[6,14],[15,18],[17,28],[4,28]]),'#276b4d')+'</g>'+
        '<g class="car-head"><g class="car-wind" opacity="0">'+facet(at([[-11,-13],[-28,-19],[-46,-14],[-28,-9]]),'#e0b04f')+facet(at([[-14,-4],[-36,-6],[-54,0],[-34,2]]),'#c9922f')+facet(at([[-12,5],[-30,9],[-44,16],[-28,13]]),'#b07f26')+'</g>'+
          '<g class="car-hair" data-pivot="131,48">'+facet(at([[-13,-2],[-5,0],[-5,17],[-16,19]]),'#b8862a')+'</g>'+face(at)+
          facet(at([[-14,-9],[-5,-17],[-1,-6],[-6,4],[-13,6]]),'#c9922f')+facet(at([[-5,-17],[6,-18],[14,-10],[4,-8],[-1,-6]]),'#e0b04f')+
          '<g class="car-calm">'+calm(at)+'</g><g class="car-joy" opacity="0">'+poly(at([[4,-2],[6.5,-6],[9,-2],[7.8,-1.2],[6.5,-3.6],[5.2,-1.2]]),'#151515')+
          poly(at([[3,6],[11,5],[9.5,11],[5,11.5]]),'#8e1219')+poly(at([[5,10],[9,9.6],[8.5,11],[5.5,11.3]]),'#ff8a80')+ellipse(141,54,3.2,2,'#ff9a9a',' fill-opacity=".7"')+'</g>'+
        '</g></g></g>';})();
    // Big cartoon wheels; the rim's ten facets alternate, so it reads as five spokes and shows the spin.
    const wheel=cx=>{const rim=arc(cx,145,19,19,0,360,10);
      return '<g class="car-wheel">'+poly(arc(cx,145,31,31,0,360,16).slice(0,-1),'#1f1f1f')+poly(arc(cx,145,23,23,0,360,12).slice(0,-1),'#3a3a3a')+
        rim.slice(0,-1).map((p,i)=>facet([[cx,145],p,rim[i+1]],i%2?'#9aa1ab':'#e6e9ed')).join('')+poly(arc(cx,145,6,6,0,360,8).slice(0,-1),'#c9ccd2')+ellipse(cx,145,2.5,2.5,'#7a7a7a')+'</g>';};
    // A static trail for Google Slides and still frames; in motion the same puffs leave the pipe one after another.
    const puff=gem(0,0,10,8.5,['#fbfbfb','#e4e4e4','#c2c2c2'],7);
    const exhaust='<g class="car-exhaust" data-x="14" data-y="150">'+[[0,147,.55,.85],[-22,141,.8,.7],[-50,133,1.05,.5],[-84,124,1.3,.32],[-122,115,1.55,.16]]
      .map(([x,y,s,o])=>'<g class="car-puff" transform="translate('+x+' '+y+') scale('+s+')" opacity="'+o+'">'+puff+'</g>').join('')+'</g>';
    return '<svg class="car-art" viewBox="0 0 400 190" aria-hidden="true">'+ellipse(199,176,185,6,'#151515',' fill-opacity=".14" class="car-shadow"')+exhaust+
      '<g class="car-body">'+poly([...rearOut.slice().reverse(),...frontOut.slice(1)],'#9fc3db')+driver+
        poly([[238,60],[243,58],[251,78],[246,80]],'#151515')+poly([[246,58],[252,56],[258,76],[252,78]],'#fff',' fill-opacity=".35"')+
        ring(rearOut,rearWin,['#f6716d','#f25553','#ee312f','#e0262a','#cf1723','#b51a22'])+ring(frontOut,frontWin,['#f25553','#f6716d','#f25553','#ee312f','#e0262a','#cf1723'])+
        facet([[193,22],[188.5,12],[184,22]],'#f25553')+facet(box(184,22,193,78),'#e0262a')+
        strip(belt,crease,.62)+strip(crease,sill,.34)+poly([[44,89],[354,89],[355,91],[43,91]],'#ffc9c2')+
        poly(box(106,79,108,150),'#95161d')+poly(box(187,79,189,151),'#95161d')+poly(box(264,79,266,150),'#95161d')+
        poly(box(164,94,178,97),'#e6e9ed')+poly(box(200,94,214,97),'#e6e9ed')+ellipse(290,84,3,2.4,'#ff9f1c')+facet([[268,70],[280,66],[284,74],[272,78]],'#b51a22')+
        poly([[36,102],[31,108],[31,118],[36,116]],'#5d0f14')+poly([[35,105],[32,109],[32,115],[35,114]],'#ff6b5e')+poly(box(364,101,370,114),'#fbe78a')+poly(box(365,102,368,106),'#fff6d6')+
        // Fender flares in a lighter red around dark wheel arches, as on a classic cartoon car.
        [91,299].map(cx=>poly([...arc(cx,145,45,45,180,360,14),[cx+45,151],[cx-45,151]],'#ff7b72')+poly([...arc(cx,145,37,37,180,360,14),[cx+37,151],[cx-37,151]],'#4a0c10')).join('')+
        poly(box(14,147,30,153),'#8a8a8a')+ellipse(14,150,2,3,'#3a3a3a')+
        [[22,42],[358,378]].map(([x0,x1])=>poly(box(x0,139,x1,151),'#2b2b2b')+poly(box(x0,136,x1,139.5),'#f4f4f4')).join('')+
        // Her window pane, tinted with a glare, lies over her; it rolls down into the door from the sill.
        rider+'<g class="car-pane" data-pivot="138,78">'+poly([...rearWin,[184,78]],'#e8f4fb',' fill-opacity=".25"')+poly([[170,30],[178,26],[166,70],[160,72]],'#fff',' fill-opacity=".4"')+'</g>'+
      '</g>'+wheel(91)+wheel(299)+'</svg>';
  })();

  // The finale: the laid table, in the conference heart's facet language. Everything from the cart is on it (lemonade C,
  // nachos and salsa A, chocolate B) beside the fridge's half lemon, salt sticks and three glasses; back row first.
  // Standing things are drawn about their foot (stand); things lying on the table in plan, squashed to its depth (flat).
  const tableArt=(()=>{
    const facet=(list,fill)=>poly(list,fill,' stroke="'+fill+'" stroke-width=".8" stroke-linejoin="round"');
    const stand=(cx,cy,deg=0)=>list=>turn(list.map(([x,y])=>[cx+x,cy+y]),cx,cy,deg);
    const flat=(cx,cy,deg=0)=>list=>turn(list,0,0,deg).map(([x,y])=>[cx+x,cy+y*.42]);
    const oval=(P,cx,cy,rx,ry,fill,from=0,to=360)=>poly(P(to-from<360?arc(cx,cy,rx,ry,from,to,12):arc(cx,cy,rx,ry,0,360,24).slice(0,-1)),fill);
    const shadow=(cx,cy,rx)=>ellipse(cx,cy,rx,rx*.2,'#5a3321',' fill-opacity=".18"');
    const item=(body,cls='')=>'<g class="table-item'+cls+'">'+body+'</g>';
    const nachoShades=['#f6c453','#eeb33b','#f8d77a','#e7a12c'];
    // A bowl in vertical strips of facets, listed left to right (lit from the top left), under its lip and inside.
    const bowl=(cx,cy,rx,ry,fills,lip,inside)=>fills.map((fill,i)=>{const n=fills.length,a=180*(n-i)/n,b=180*(n-i-1)/n,x=d=>cx+rx*Math.cos(d*Math.PI/180);
      return facet([[x(a),cy],[x(b),cy],...arc(cx,cy,rx,ry,b,a,4)],fill);}).join('')+ellipse(cx,cy,rx,rx*.19,lip)+ellipse(cx,cy+1,rx*.92,rx*.15,inside);
    // A square of chocolate lying on the table, lit on its top-left half.
    const piece=(cx,cy,deg)=>{const F=flat(cx,cy,deg);
      return poly(F(box(-15,-15,15,15)).map(([x,y])=>[x,y+5]),'#3d2214')+poly(F(box(-15,-15,15,15)),'#5a3321')+poly(F(box(-11,-11,11,11)),'#6d4029')+poly(F([[-11,-11],[11,-11],[-11,11]]),'#7a4a2e');};

    // Lemonade C, as in the app banner: one litre, green label with a lemon.
    const bottle=(cx,cy,s)=>{const P=list=>list.map(([x,y])=>[cx+(x-50)*s,cy+(y-186)*s]);
      return shadow(cx,cy,30*s)+poly(P(box(41,12,59,26)),'#1f5c42')+poly(P(box(52,12,59,26)),'#174a35')+
        poly(P([[43,26],[57,26],[57,44],[70,58],[73,70],[73,180],[69,186],[31,186],[27,180],[27,70],[30,58],[43,44]]),'#ffe7a0')+
        poly(P([[60,70],[73,70],[73,180],[69,186],[60,186]]),'#f5d88a')+poly(P(box(33,74,39,170)),'#fff',' fill-opacity=".55"')+
        poly(P(box(27,104,73,146)),'#2f7d5b')+poly(P(box(60,104,73,146)),'#276b4d')+oval(P,50,125,11,11,'#f6d33c')+oval(P,50,125,6,6,'#fff3b0');};
    // Salt sticks in a glass: the sticks first, then the glass over them, see-through.
    const sticks=(cx,cy)=>{const P=stand(cx,cy),fan=[[-17,-15,124],[-10,-8,138],[-3,-2,128],[4,4,144],[11,10,130],[17,16,120],[-7,-12,112],[8,7,116],[0,-5,136]];
      return shadow(cx,cy,34)+oval(P,0,-96,30,7,'#cdd9e1')+
        fan.map(([x,deg,len],i)=>poly(turn(P(box(x-3.5,-14-len,x+3.5,-14)),cx+x,cy-14,deg),i%2?'#d9a05b':'#e8b874')).join('')+
        poly(P([...arc(0,-96,30,7,180,0,12),[26,0],[-26,0]]),'#e4ecf1',' fill-opacity=".72"')+poly(P([[15,-90],[30,-96],[26,0],[13,0]]),'#c5d2db',' fill-opacity=".6"')+
        poly(P([[-23,-86],[-17,-87],[-16,-8],[-20,-8]]),'#fff',' fill-opacity=".8"')+poly(P([...arc(0,-96,30,7,180,0,12),...arc(0,-95,27,5,0,180,12)]),'#f7fafc');};
    // A tumbler of lemonade with a straw and a slice of lemon on its rim.
    const glass=(cx,cy)=>{const P=stand(cx,cy);
      return shadow(cx,cy,30)+poly(P([[-26,-92],[26,-92],[22,0],[-22,0]]),'#f3e2a0')+poly(P([[12,-92],[26,-92],[22,0],[10,0]]),'#ead38a')+poly(P([[-19,-84],[-12,-84],[-11,-8],[-16,-8]]),'#fbf1c8')+
        oval(P,0,-92,26,6,'#fff6d6')+poly(P([[2,-90],[7,-90],[24,-146],[19,-146]]),'#ee312f')+poly(P([[7,-90],[9,-90],[26,-146],[24,-146]]),'#cf1723')+
        oval(P,-20,-92,15,15,'#f4d03f',180,360)+oval(P,-20,-92,11,11,'#fbe78a',180,360);};
    // An open bag of nachos A, as in the app banner, leaning back a little; a few chips peek over the top.
    const nachoBag=(cx,cy)=>{const P=stand(cx,cy,-6);
      return shadow(cx,cy,58)+poly(P([[-48,-121],[-24,-138],[0,-132],[24,-140],[48,-121]]),'#b5661a')+
        [[[-36,-120],[-16,-158],[2,-118]],[[-8,-118],[16,-152],[32,-116]],[[14,-120],[42,-142],[46,-114]]].map((t,i)=>facet(P(t),nachoShades[i])).join('')+
        facet(P([[-50,-120],[-26,-126],[-26,0],[-50,0],[-54,-60]]),'#eba142')+facet(P([[-26,-126],[0,-118],[0,0],[-26,0]]),'#e2932b')+
        facet(P([[0,-118],[26,-126],[26,0],[0,0]]),'#d6861f')+facet(P([[26,-126],[50,-120],[54,-60],[50,0],[26,0]]),'#c4741a')+
        poly(P(box(-50,-12,50,0)),'#b5661a')+poly(P(box(-38,-102,38,-78)),'#fff')+poly(P(box(-26,-94,26,-86)),'#e2932b')+
        oval(P,0,-44,24,24,'#fff4d8')+poly(P([[-14,-34],[0,-60],[10,-32]]),'#f6c445')+poly(P([[-2,-30],[16,-52],[20,-28]]),'#e9a72f');};
    // Salsa A in its jar: red through the glass, the brand's orange label, a dark lid.
    const jar=(cx,cy)=>{const P=stand(cx,cy);
      return shadow(cx,cy,40)+poly(P([[-35,-76],[35,-76],[35,-7],[28,0],[-28,0],[-35,-7]]),'#cf1723')+poly(P([[18,-76],[35,-76],[35,-7],[28,0],[18,0]]),'#b51a22')+
        poly(P(box(-29,-70,-23,-10)),'#fff',' fill-opacity=".35"')+poly(P(box(-35,-58,35,-22)),'#e2932b')+poly(P(box(18,-58,35,-22)),'#c4741a')+poly(P(box(-20,-46,14,-34)),'#fff')+
        poly(P(box(-31,-82,31,-76)),'#95161d')+poly(P(box(-33,-98,33,-82)),'#3a3a3a')+poly(P(box(18,-98,33,-82)),'#2b2b2b')+oval(P,0,-98,33,6,'#5a5a5a');};
    // A can of something fizzy, as in the app banner.
    const can=(cx,cy)=>{const P=stand(cx,cy);
      return shadow(cx,cy,28)+oval(P,0,0,22,6,'#2c6f98',0,180)+poly(P(box(-22,-84,22,0)),'#3a8fc2')+poly(P(box(8,-84,22,0)),'#2c6f98')+
        poly(P([[-22,-46],[22,-56],[22,-42],[-22,-32]]),'#fff')+poly(P([[8,-52.8],[22,-56],[22,-42],[8,-38.8]]),'#e6e9ed')+poly(P(box(-16,-76,-12,-8)),'#fff',' fill-opacity=".35"')+
        oval(P,0,-84,22,6,'#dfe5ea')+oval(P,0,-84,15,3.6,'#b9c2ca')+poly(P(box(-3,-87,7,-83)),'#9aa1ab');};
    // The half lemon from the fridge, standing on the table about its foot (cx,cy), cut face to the guests.
    const halfOnTable=(cx,cy,s)=>shadow(cx,cy,50*s/1.6)+halfLemon(cx-28*s,cy-48*s,s,true);
    // A plate, its underside showing at the front, and what has landed on it.
    const plate=(cx,cy,food)=>shadow(cx,cy+8,122)+ellipse(cx,cy+6,118,32,'#e3dbd0')+ellipse(cx,cy,118,32,'#fff')+ellipse(cx,cy+2,84,22,'#f1ece4')+food;
    // Chocolate B lying open: the bar unwrapped past the foil, a row of squares broken off; the wrapper as on the shelf.
    const chocolate=(cx,cy,deg)=>{const F=flat(cx,cy,deg),drop=list=>list.map(([x,y])=>[x,y+8]);
      return poly(F(box(-74,-30,92,48)),'#5a3321',' fill-opacity=".18"')+poly(drop(F(box(-70,-36,14,36))),'#3d2214')+poly(drop(F(box(14,-39,85,39))),'#161d3a')+
        poly(F(box(-70,-36,14,36)),'#4a2a1a')+[-70,-44,-18].flatMap(u=>[-36,0].map(v=>poly(F(box(u+3,v+3,u+23,v+33)),'#6d4029')+poly(F([[u+3,v+3],[u+23,v+3],[u+3,v+33]]),'#7a4a2e'))).join('')+
        poly(F([[6,-40],[13,-32],[6,-24],[13,-16],[6,-8],[13,0],[6,8],[13,16],[6,24],[13,32],[6,40],[22,40],[22,-40]]),'#d6b15e')+
        poly(F(box(20,-39,85,39)),'#23305e')+poly(F(box(20,-27,85,-21)),'#d6b15e')+poly(F(box(36,-6,72,16)),'#fff');};

    // The pile in the big bowl, relative to its rim centre; motion.js flies each chip in.
    const pile=[[[-134,0],[-102,-52],[-68,2]],[[-104,-6],[-50,-86],[-10,-12]],[[-62,-12],[0,-110],[42,-16]],[[-10,-8],[60,-90],[92,-6]],[[42,-6],[102,-70],[138,-2]],
      [[100,-10],[134,-44],[146,2]],[[-120,-12],[-74,-60],[-86,6]],[[-80,-36],[-24,-64],[-50,4]],[[-30,-48],[18,-70],[-4,4]],[[0,-42],[44,-64],[30,4]],[[60,-32],[112,-38],[92,4]]];
    const nachos=pile.map((t,i)=>facet(t.map(([x,y])=>[830+x,226+y]),nachoShades[i%4]))
      .concat([[574,312,20],[646,324,-34]].map(([x,y,deg],i)=>facet(flat(x,y,deg)([[-28,16],[0,-30],[28,16]]),nachoShades[(i+1)%4])))
      .map(p=>p.replace('<polygon','<polygon class="nacho"')).join('');

    return '<svg class="table-art" viewBox="0 0 1660 440" aria-hidden="true">'+
      '<g class="table-top">'+poly([[110,170],[1550,170],[1660,340],[0,340]],'#c8925e')+poly([[0,340],[1660,340],[1660,382],[0,382]],'#9c6438')+
        poly([[60,382],[112,382],[112,440],[60,440]],'#8a5631')+poly([[1548,382],[1600,382],[1600,440],[1548,440]],'#8a5631')+
        poly([[540,170],[1120,170],[1210,340],[450,340]],'#fffaf2')+poly([[540,170],[570,170],[482,340],[450,340]],'#ee312f')+poly([[1090,170],[1120,170],[1210,340],[1178,340]],'#ee312f')+
        poly(box(450,340,1210,378),'#f1e9dc')+poly(box(450,340,482,378),'#cf1723')+poly(box(1178,340,1210,378),'#cf1723')+'</g>'+
      item(bottle(200,212,1.1))+item(sticks(318,208))+item(nachoBag(604,212))+item(jar(1046,206))+
      item(can(1380,204))+item(glass(1468,212))+item(glass(1546,226))+item(glass(456,266))+
      item(bowl(830,226,158,96,['#f6716d','#ee312f','#f25553','#e0262a','#cf1723','#e0262a','#b51a22','#95161d'],'#f25553','#7d1118'),' table-bowl')+nachos+
      item(plate(320,292,[[284,290,8],[318,298,-24],[300,280,64]].map(([x,y,deg],i)=>facet(flat(x,y,deg)([[-30,18],[0,-34],[30,18]]),nachoShades[i])).join('')+
        ellipse(366,290,24,10,'#ee312f')+poly([[358,286],[366,283],[364,291]],'#95161d')+poly([[370,291],[378,288],[376,295]],'#95161d')))+
      item(halfOnTable(112,304,1.6))+
      item(bowl(1084,282,62,36,['#ffffff','#f8f5f0','#efe9e0','#e3dbd0'],'#fff','#ee312f')+poly([[1066,284],[1098,218],[1112,282]],'#f8d77a')+poly([[1088,250],[1098,218],[1112,282],[1098,284]],'#eeb33b')+
        poly([[1050,284],[1060,280],[1058,288]],'#95161d')+poly([[1110,286],[1120,283],[1117,291]],'#95161d')+poly([[1072,292],[1080,289],[1080,295]],'#5a9b4c'))+
      item(chocolate(1240,302,-12)+piece(1162,326,18))+
      item(plate(1450,292,[[1408,292,-14],[1440,282,40]].map(([x,y,deg],i)=>facet(flat(x,y,deg)([[-30,18],[0,-34],[30,18]]),nachoShades[i+2])).join('')+piece(1478,296,-20)+piece(1506,286,14)+piece(1494,308,32)))+
      '</svg>';
  })();

  // The organizer's closing slide (last-slide.svg, 2560 × 1440, drawn here at 1920 × 1080). Its red background is the
  // conference heart seen from very close: the same eight facets, centre vertex at (1730.5, 635.4), edges within 0.1° of
  // the heart, in the organizer's muted tones. The heart is scaled past the slide edges (it covers them from 2.22), so only
  // its facet rays show; each facet is clipped to the slide so the shapes stay inside it.
  const heartV={ls:[152,225],lt:[614,0],n:[998,277],rt:[1382,0],rs:[1845,225],l:[0,563],r:[1997,563],lb:[152,866],rb:[1845,866],c:[998,727],b:[998,1646]}; // HV in motion.js
  const heartFit={scale:2.5,x:1730.5,y:635.4};
  const thanksFacets=[['ls lt c','#bc2f2d'],['lt n c','#da443b'],['n rt c','#bc2f2d'],['rt rs c','#da443b'],['rs r rb c','#bc2f2d'],['ls l lb c','#892424'],['lb c b','#bc2f2d'],['c rb b','#892424']];
  const clipRect=(list,w=1920,h=1080)=>[[0,0,1],[0,w,-1],[1,0,1],[1,h,-1]].reduce((shape,[axis,edge,sign])=>{
    const inside=p=>sign*(p[axis]-edge)>=0,out=[];
    shape.forEach((p,i)=>{
      const q=shape[(i+1)%shape.length];
      if(inside(p))out.push(p);
      if(inside(p)!==inside(q)){const t=(edge-p[axis])/(q[axis]-p[axis]);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
    });
    return out;
  },list);
  const toStage=([x,y])=>[heartFit.x+heartFit.scale*(x-heartV.c[0]),heartFit.y+heartFit.scale*(y-heartV.c[1])];
  const thanksBg='<svg class="thanks-bg" viewBox="0 0 1920 1080" aria-hidden="true">'+thanksFacets.map(([names,fill],i)=>{
    const shape=clipRect(names.split(' ').map(n=>toStage(heartV[n])));
    return shape.length>2?poly(shape,fill,' stroke="'+fill+'" stroke-width="1.6" stroke-linejoin="round" data-facet="'+i+'"'):'';
  }).join('')+'</svg>';
  // The white panel's left edge, measured from the organizer artwork (three straight segments).
  const thanksPanel='<svg class="thanks-panel" viewBox="0 0 1920 1080" aria-hidden="true">'+poly([[1097.6,0],[959.4,299.1],[1134.5,634.6],[1617.6,1080],[1920,1080],[1920,0]],'#fff')+'</svg>';

  // The organizer's cover template (first-slide.svg, 2560 × 1440, drawn here at 1920 × 1080): its logo top left and the
  // conference heart cropped by the right edge. The heart's vertices were measured edge by edge from the template, centre
  // vertex just past the edge at (1925, 463); its right half lies beyond the slide and mirrors the left. Only the facets
  // that show are drawn, clipped to the slide, in the brand colours instead of the export's muted ones.
  const coverHeart={l:[904.7,293.7],ls:[1059,-50.1],lt:[1528.8,-287.3],n:[1925,-1.5],c:[1925,463],lb:[1058.5,605.9],b:[1925,1398.8]};
  [['r','l'],['rs','ls'],['rt','lt'],['rb','lb']].forEach(([k,m])=>{coverHeart[k]=[2*coverHeart.c[0]-coverHeart[m][0],coverHeart[m][1]];});
  const coverFacets=[['ls lt c','#cf1723'],['lt n c','#ee312f'],['n rt c','#cf1723'],['rt rs c','#ee312f'],['rs r rb c','#cf1723'],['ls l lb c','#95161d'],['lb c b','#cf1723'],['c rb b','#95161d']]; // HEART in motion.js
  const coverTemplate='<svg class="cover-template" viewBox="0 0 1920 1080" aria-hidden="true">'+coverFacets.map(([names,fill],i)=>{
    const shape=clipRect(names.split(' ').map(n=>coverHeart[n]));
    return shape.length>2?poly(shape,fill,' stroke="'+fill+'" stroke-width="1.6" stroke-linejoin="round" data-facet="'+i+'"'):'';
  }).join('')+'</svg>';

  // Slide 13's chocolate, in the pack's own pixels: the sleeve slid back, the foil torn open over three columns of squares,
  // the top-right square broken off (it lies on the table with another).
  const chocPiece=cls=>'<svg class="choc-piece '+cls+'" viewBox="0 0 86 94">'+poly(box(6,12,86,94),'#000',' fill-opacity=".1"')+poly(box(0,76,80,86),'#3d2214')+chocSquare(0,0,80,78)+'</svg>';
  const openChocolate='<svg class="choc-open" viewBox="0 0 680 330">'+
    poly(box(340,316,672,328),'#3d2214')+poly([[340,72],[589,72],[589,154],[672,154],[672,318],[340,318]],'#331c11')+
    [0,1,2,3].flatMap(c=>[0,1,2].filter(r=>c<3||r>0).map(r=>chocSquare(342+c*83,74+r*82,79,78))).join('')+
    poly([[372,64],[414,64],[404,84],[426,104],[410,126],[428,150],[412,172],[430,196],[414,220],[428,244],[408,266],[426,290],[410,312],[420,330],[372,330]],'#c9ccd2')+
    poly([[372,66],[402,66],[394,86],[414,106],[398,128],[416,152],[400,174],[418,198],[402,222],[416,246],[396,268],[412,292],[398,312],[404,328],[372,328]],'#e8eaee')+
    poly([[392,96],[408,108],[394,124]],'#f6f7f9')+poly([[392,160],[412,170],[408,176],[392,168]],'#d4d7dc')+poly([[392,214],[410,226],[396,250]],'#f6f7f9')+
    poly([[392,66],[398,44],[418,34],[436,46],[420,58],[426,68]],'#c9ccd2')+poly([[396,64],[402,48],[416,42],[414,56]],'#e8eaee')+'</svg>';
  const slides=[
    {id:'tytul',title:'Homo Urgens: Wychowaliśmy pokolenie natychmiastowości. Co na to Retail Media onsite?',layout:'cover',theme:'light',textVersion:2,seconds:30,reveals:0,coverHeart,speaker:'Obie',notes:'To pierwszy slajd. Ustaw go przed wejściem na scenę. Po wejściu kliknij raz (albo naciśnij R): serce złoży się jeszcze raz. Kolejne kliknięcie przechodzi do slajdu 2. Przedstawcie się krótko. Powiedzcie, że opowiecie jedną historię zakupową i pokażecie na niej, co z badania Inquiry wynika dla Retail Media onsite.',html:coverTemplate+'<div class="cover-copy"><p class="kicker" data-edit>Tryb: TERAZ</p><h1 data-edit>Homo<br>Urgens</h1><p class="cover-subtitle" data-edit>Wychowaliśmy pokolenie natychmiastowości.<br>Co na to Retail Media onsite?</p><p class="speakers" data-edit>Uliana Jelonek<br>Joanna Wysocka</p><img class="speakers-logo" src="assets/brand/glovo-logo-black.png" alt="Glovo"></div>'},
    {id:'cytaty',title:'Co mówi konsument w trybie pilnej potrzeby',layout:'quotes',theme:'light',textVersion:2,seconds:45,reveals:2,speaker:'Uliana',source:inquiry,notes:'Trzy zdania z raportu Inquiry (s. 22). To sformułowania raportu, które oddają głos konsumenta na kolejnych etapach decyzji, nie wypowiedzi konkretnych osób z badania. Odsłaniaj je po kolei: pokaż, pomóż wybrać, pomóż skończyć. Te trzy prośby wrócą w historii o gościach.',html:heading('Trzy prośby<br>konsumenta.')+'<div class="quote-grid">'+
      [['Pokaż mi to, co jest mi potrzebne.','Gdy decyzja jest jeszcze otwarta'],['Pomóż mi wybrać.','Gdy porównuję kilka opcji'],['Pomóż mi upewnić się i zakończyć zakup.','Gdy wybór jest prawie gotowy']]
        .map(([quote,stage],i)=>{const card='<figure class="quote-card" data-move><svg class="quote-mark" viewBox="0 0 76 52" aria-hidden="true">'+poly([[0,0],[30,0],[30,30],[17,52],[5,52],[13,30],[0,30]],'#ee312f')+poly([[42,0],[72,0],[72,30],[59,52],[47,52],[55,30],[42,30]],'#ee312f')+'</svg><blockquote data-edit>'+quote+'</blockquote><figcaption data-edit>'+stage+'</figcaption></figure>';return i?reveal(i,card):card;}).join('')+'</div>'},
    {id:'prosze-czekac',title:'Proszę czekać',layout:'waiting',theme:'dark',seconds:4,reveals:0,loader:{from:0,to:87,duration:4000},speaker:'Uliana',notes:'Kliknij i nic nie mów. Loader rośnie przez około cztery sekundy. Nie komentuj go jeszcze.',html:'<div class="waiting-content"><div class="loader-orbit" aria-hidden="true"></div><h1 data-edit>Proszę czekać</h1><div class="loading-track" role="progressbar" aria-label="Teatralny loader" aria-valuemin="0" aria-valuemax="100"><i></i></div><p class="loader-percent"><span data-loader-value>0</span><span>%</span></p></div>'},
    {id:'jeszcze-chwila',title:'Prezentacja zacznie się za chwilę',layout:'waiting',theme:'dark',seconds:6,reveals:0,loader:{from:87,to:99,duration:6000},speaker:'Uliana',notes:'Odczekaj około sześciu sekund. Loader dochodzi do 99% i zostaje w tym miejscu. Kolejne naciśnięcie klikera odsłania sens tej przerwy. Nie ma automatycznej zmiany slajdu.',html:'<div class="waiting-content"><div class="loader-orbit" aria-hidden="true"></div><h1 data-edit>Proszę czekać</h1><p class="waiting-subtitle" data-edit>Prezentacja zacznie się za chwilę</p><div class="loading-track" role="progressbar" aria-label="Teatralny loader" aria-valuemin="0" aria-valuemax="100"><i></i></div><p class="loader-percent"><span data-loader-value>87</span><span>%</span></p></div>'},
    {id:'tryb-teraz',title:'Właśnie weszliście w tryb Homo Urgens',layout:'breakthrough',theme:'red',seconds:20,reveals:1,speaker:'Uliana',notes:'Zapytaj retorycznie: „Już mieliście dość?”. Powiedz: „Właśnie weszliście w tryb Homo Urgens”. To demonstracja niecierpliwości, nie pomiar reakcji widowni. Odsłoń słowo TERAZ.',html:'<div class="orbit-fragments" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="breakthrough-copy"><p class="kicker" data-edit>Właśnie weszliście w tryb</p><h1 data-edit>HOMO<br>URGENS</h1>'+reveal(1,'<p class="now-word" data-edit>TERAZ</p>')+'</div>'},
    {id:'kiedys-teraz',title:'Kiedyś jeden sklep. Teraz aplikacja szybkich dostaw.',layout:'then-now',theme:'light',seconds:55,reveals:2,speaker:'Uliana',notes:'Kiedyś zakupy oznaczały jeden sklep w promieniu kilku kilometrów, jego godziny otwarcia i to, co akurat było na półce. Odsłoń TERAZ: aplikacja szybkich dostaw mieści wiele sklepów w jednym telefonie i pozwala kupić wtedy, kiedy pojawia się potrzeba. Drugie kliknięcie: w tym samym miejscu marka może pojawić się w chwili wyboru. To jest Retail Media onsite. Mapa i sklepy są schematem, nie danymi.',html:
      '<i class="then-divider" aria-hidden="true"></i><section class="then-col" data-move><p class="kicker" data-edit>Kiedyś</p><h2 data-edit>Jeden sklep<br>w okolicy.</h2><p class="then-caption" data-edit>W promieniu kilku kilometrów.<br>Otwarty w swoich godzinach.</p>'+thenMap+'</section>'+
      reveal(1,'<section class="now-col" data-move><p class="kicker" data-edit>Teraz</p><h2 data-edit>Aplikacja<br>szybkich dostaw.</h2><p class="then-caption" data-edit>Wiele sklepów w jednym telefonie.<br>Zakupy wtedy, kiedy pojawia się potrzeba.</p>'+nowApp+'</section>')+
      reveal(2,'<p class="now-plus" data-edit>+ marka w chwili wyboru</p>')},
    {id:'kontrola',title:'Potrzeba nie może czekać',layout:'needs',theme:'light',textVersion:2,seconds:50,reveals:0,metrics:[78],speaker:'Uliana',source:inquiry,notes:'78% chce mieć produkt lub usługę wtedy, kiedy ich potrzebuje. Po doliczeniu do 78% same, bez klikania, pojawiają się cztery przykłady takich potrzeb: brakujący produkt spożywczy, leki lub produkty z apteki, zwykłe zakupy spożywcze i produkty pod wpływem chwilowej ochoty. Karty są ilustracjami, nie danymi. To kontekst dla Retail Media: marka ma szansę pojawić się, gdy konsument szuka rozwiązania swojej aktywnej potrzeby. Powiedz: „Rola Retail Media to pokazać produkt w momencie potrzeby”. Ta liczba opisuje oczekiwanie wobec dostępności, nie wpływ reklamy.',html:heading('Potrzeba nie<br>może czekać.')+'<i class="then-divider" aria-hidden="true"></i><div class="relevance-metric">'+metric(78,'Chce produktu lub usługi<br>wtedy, kiedy ich potrzebuje')+'</div>'+needs},
    {id:'tryb-sytuacyjny',title:'Każdy z nas bywa Homo Urgens',layout:'mechanism',theme:'dark',textVersion:2,seconds:40,reveals:1,speaker:'Uliana',source:inquiry,notes:'Tytuł mówi o pokoleniu, ale badanie nie wyodrębnia generacji. Homo Urgens jest sytuacyjnym trybem działania. Ta sama osoba może działać inaczej zależnie od zadania. Aktywna potrzeba i ograniczenie zasobów uruchamiają ten tryb. Przejście: „Pokażemy to na jednej historii”.',html:heading('Każdy z nas bywa<br>Homo Urgens')+'<div class="mechanism-line"><p data-edit>Potrzeba</p>'+reveal(1,'<span class="mechanism-plus" aria-hidden="true">+</span><p data-edit>Brak czasu</p>')+reveal(1,'<span class="mode-result" data-edit>= TRYB: TERAZ</span>')+'</div>'},
    {id:'goscie',title:'Będziemy za 20 minut',layout:'message',theme:'dark',seconds:25,reveals:1,clock:0,speaker:'Uliana',notes:'Zaczyna się historia. Bohaterka dostaje wiadomość: znajomi będą za 20 minut. Zegar w rogu będzie nam towarzyszył do końca zakupów. To element opowieści, nie czas dostawy. Odsłoń pytanie: „A w lodówce?”. Następne kliknięcie: wjeżdżamy do lodówki.',html:'<p class="kicker message-kicker" data-edit>Zakupowy thriller</p><div class="notification" data-move><div class="notif-top"><span class="notif-icon" aria-hidden="true"><svg viewBox="0 0 40 40">'+poly([[6,8],[34,8],[34,28],[18,28],[10,35],[11,28],[6,28]],'#fff')+'</svg></span><span class="notif-app" data-edit>Znajomi</span><span class="notif-time" data-edit>teraz</span></div><p class="notif-text" data-edit>Będziemy za 20 minut 😊</p></div>'+reveal(1,'<p class="message-twist" data-edit>A w lodówce?</p>')},
    {id:'pusta-lodowka',title:'o-shit commerce',layout:'fridge-inside',theme:'light',seconds:10,reveals:0,clock:1,speaker:'Uliana',notes:'O-shit commerce: goście za 20 minut, a w lodówce tylko pół cytryny. Krótka pauza na reakcję sali. To moment, w którym zaczyna się pilna potrzeba. Kliknięcie: kamera odjeżdża od lodówki i widzimy bohaterkę.',html:'<div class="inside-scene">'+fridgeInside()+'</div><h1 class="inside-title" data-edit>o-shit commerce</h1>'},
    {id:'lodowka',title:'To nie jest moment na długą historię marki',layout:'fridge',theme:'dark',seconds:30,reveals:1,clock:2,speaker:'Uliana',notes:'Otwarta lodówka, prawie pusta. To nie jest moment na długą historię marki. Bohaterka potrzebuje napojów, przekąsek i czegoś słodkiego. Odsłoń jej listę. Potrzeba plus brak czasu: tryb TERAZ.',html:heading('To nie jest moment<br>na długą historię<br>marki.','Otwieram lodówkę')+
      reveal(1,'<p class="fridge-need" data-edit>Potrzebuję napojów, przekąsek<br>i czegoś słodkiego. <span class="red-text">Teraz.</span></p>')+
      '<div class="fridge" data-move aria-hidden="true"><i class="fridge-glow"></i><div class="fridge-body"><div class="fridge-inside"><i class="shelf s1"></i><i class="shelf s2"></i><i class="shelf s3"></i><span class="fridge-item item-jar"></span><svg class="fridge-item item-lemon" viewBox="0 0 56 48">'+halfLemon(0,0,1)+'</svg><span class="fridge-item item-sauce"></span></div></div>'+
      '<svg class="fridge-door" viewBox="0 0 170 780">'+poly([[0,0],[170,70],[170,720],[0,780]],'#d4d4d9')+poly([[16,36],[154,94],[154,680],[16,738]],'#e9e9ed')+poly([[30,120],[140,160],[140,190],[30,152]],'#f4f4f6')+poly([[30,330],[140,350],[140,380],[30,362]],'#f4f4f6')+poly([[56,96],[72,98],[72,122],[56,118]],'#ee312f')+'</svg></div>'},
    {id:'dwa-plany',title:'Dwa plany. Jeden moment.',layout:'worlds',theme:'dark',textVersion:3,seconds:50,reveals:2,clock:3,speaker:'Uliana',notes:'Marka ma swój plan: launch, awareness, zaangażowanie i główny produkt. Konsumentka też ma plan: goście za 20 minut i coś słodkiego na stół. Najpierw widać tylko markę. Pierwsze kliknięcie odsłania konsumentkę i jej plan, drugie: rolę Retail Media jako miejsca spotkania tych dwóch planów. Nie przeciwstawiamy celów marki klientce: szukamy momentu, w którym produkt marki pomaga wykonać jej zadanie.',html:'<div class="world-brand" data-move><p class="kicker" data-edit>Marka</p><h1 data-edit>Ma swój plan.</h1><div class="brand-goals"><p data-edit>Launch</p><p data-edit>Awareness</p><p data-edit>Zaangażowanie</p><p data-edit>Główny produkt</p></div><p class="world-quote" data-edit>Chce, żebyś wybrała jej produkt.</p></div>'+reveal(1,'<div class="world-consumer" data-move><p class="kicker" data-edit>Konsumentka</p><h1 data-edit>Też ma plan.</h1><p class="consumer-need" data-edit>Goście<br>za 20 minut.</p><p class="world-quote" data-edit>Potrzebuje czegoś słodkiego. <span class="red-text">TERAZ.</span></p></div>')+reveal(2,'<div class="world-bridge" data-move><span class="bridge-icon" aria-hidden="true">↔</span><h2 data-edit>Retail Media łączy te dwa plany.</h2></div>')+reveal(1,'<div class="guest-car" data-move>'+guestCar+'</div>')},
    {id:'potrzeba-teraz',title:'Potrzebuję czekolady',layout:'scenario',theme:'light',seconds:40,reveals:1,clock:4,speaker:'Uliana',notes:'Coś słodkiego dla gości: czekolada. Bohaterka zna produkt, ale nie wybrała marki. Nie przypisujemy tej historii konkretnej osobie z badania. Odsłoń różnicę między znaną potrzebą a otwartym wyborem marki.',html:heading('Potrzebuję<br>czekolady.','Plan konsumentki')+'<p class="scenario-question" data-edit>Coś słodkiego dla gości. Teraz.</p>'+
      '<div class="hero-chocolate" data-move aria-hidden="true"><i class="choc-shadow"></i>'+chocPiece('p1')+chocPiece('p2')+'<div class="choc-pack">'+openChocolate+'<div class="choc-bar"><span class="choc-brand">?</span><span class="choc-label">CZEKOLADA</span></div></div></div>'+
      reveal(1,'<p class="scenario-answer" data-edit>Produkt znam.<br><span class="red-text">Marki jeszcze nie wybrałam.</span></p>')},
    {id:'wybor-w-aplikacji',title:'Produkt w głowie. Marka do wyboru.',layout:'metrics',theme:'light',textVersion:2,seconds:60,reveals:1,metrics:[55],clock:5,speaker:'Uliana',source:inquiry,notes:'55% zawsze lub często mniej więcej wie, czego potrzebuje, ale konkretny produkt wybiera podczas przeglądania aplikacji. Kliknięcie: wykres fraz w kategorii czekolada. Fraza „czekolada” zdecydowanie dominuje nad nazwami marek i wariantami. W naszej historii: czekolada tak, marka jeszcze otwarta. Tu jest miejsce dla Retail Media. Przekaż narrację Joannie: „Zobaczmy, co dzieje się w aplikacji”.',html:heading('Produkt w głowie.<br>Marka do wyboru.')+'<div class="metrics-pair">'+metric(55,'Wybiera konkretny produkt/markę<br>podczas przeglądania aplikacji')+'</div>'+reveal(1,barChart('Kategoria: czekolada',[['czekolada',100],['marka',30,'ink'],['marka',28,'ink'],['marka',23,'ink'],['czekolada gorzka',18],['marka',13,'ink'],['czekolada mleczna',9],['marka',7.5,'ink'],['biała czekolada',7]],'Fraza „czekolada” zdecydowanie dominująca'),'chart-reveal')},
    {id:'otwieram-aplikacje',title:'Nie wiem, od czego zacząć',layout:'shopping journey',theme:'light',textVersion:2,seconds:50,reveals:1,clock:7,speaker:'Joanna',notes:'Bohaterka otwiera aplikację i nie wie, od czego zacząć. Na ekranie startowym sponsorowany banner odpowiada na jej okazję: spotkanie ze znajomymi, napoje i przekąski w jednym miejscu. Nie nazywaj jeszcze formatu: publiczność ma zobaczyć, co robi. Kliknięcie: kursor wybiera banner. Kontekst z raportu: 19% wskazuje gości lub przygotowanie spotkania jako sytuację, w której sięga po szybką dostawę (s. 9). Ekran jest schematem, nie zrzutem prawdziwej aplikacji.',html:journey('· Otwieram aplikację','„Nie wiem, od czego<br>zacząć.”','Nie mam listy zakupów.<br>Mam gości w drodze.','Banner prowadzi prosto<br>do produktów na spotkanie.',app.home)},
    {id:'szukam-przekasek',title:'Gdzie są przekąski?',layout:'shopping journey',theme:'light',seconds:50,reveals:1,clock:9,speaker:'Joanna',notes:'Drugie pytanie: gdzie są przekąski? Bohaterka wpisuje kategorię, nie markę. Po kliknięciu pojawiają się wyniki: na górze sponsorowane nachosy marki A, które pasują do zapytania. Marka wchodzi do wyboru, bo odpowiada na pytanie, a nie przerywa zadania. Kontekst: 31% zaczyna zakupy od wyszukania konkretnego produktu (s. 11).',html:journey('· Wyszukuję','„Gdzie są<br>przekąski?”','Wpisuję kategorię.<br>Nie wpisuję marki.','Sponsorowany produkt<br>odpowiada na moje pytanie.',app.search)},
    {id:'wybieram',title:'Które kupić?',layout:'shopping journey',theme:'light',seconds:50,reveals:1,clock:11,speaker:'Joanna',notes:'Trzecie pytanie: którą czekoladę kupić? Wątek czekolady się domyka. Cztery opcje, każda z czytelnym packshotem, wariantem, gramaturą i ceną. Kliknięcie: bohaterka dodaje sponsorowaną czekoladę marki B. Wybiera tę, przy której nie musi zgadywać. W raporcie o wyborze decydują m.in. cena (55%), wariant, rodzaj lub wielkość (20%) i zdjęcie produktu (15%) (s. 21).',html:journey('· Wybieram','„Które<br>kupić?”','Cztery czekolady. Widzę wariant,<br>gramaturę i cenę.','Wybieram tę, przy której<br>nie muszę zgadywać.',app.shelf)},
    {id:'koszyk',title:'Nie szukałam, ale tego mi brakowało',layout:'shopping journey',theme:'light',textVersion:2,seconds:50,reveals:1,clock:13,speaker:'Joanna',notes:'Czwarty etap: „Nie szukałam, ale tego mi brakowało”. W koszyku są lemoniada, nachosy i czekolada. Podpowiedź przy koszyku proponuje dip do nachosów, który pasuje do tego, co już jest w koszyku. Kliknięcie: dip trafia do koszyka. Bliżej finalizacji podpowiedź powinna uzupełniać wybór, a nie otwierać go od nowa (s. 14, 22).',html:journey('· Sprawdzam koszyk','„Nie szukałam,<br>ale tego mi brakowało.”','Nachosy są.<br>Czegoś do nich brakuje.','Trafne uzupełnienie:<br>dip do nachosów.',app.cart)},
    {id:'dopasowanie',title:'Dopasowanie zwraca uwagę',layout:'relevance',theme:'light',seconds:50,reveals:1,metrics:[27],clock:14,speaker:'Joanna',source:inquiry,notes:'27% badanych z grupy, która zmieniała plany lub zainteresowała się innym produktem, wskazuje dopasowanie do pozostałych zakupów jako powód zwrócenia uwagi na nieplanowany produkt (N=619, s. 41 pełnego raportu; w publikacji s. 15). W tym samym zestawieniu atrakcyjną cenę lub promocję wskazuje 50%. Odsłoń wniosek z historii: dip nie był w planie, ale pasował do koszyka. To deklarowany powód uwagi, nie zmierzony wzrost sprzedaży.',html:heading('Dopasowanie<br>zwraca uwagę.')+'<div class="relevance-metric">'+metric(27,'Zwraca uwagę na nieplanowany produkt,<br>bo pasuje do reszty zakupów')+'</div>'+reveal(1,'<section class="relevance-copy" data-move><p class="kicker" data-edit>W naszej historii</p><h2 data-edit>Dip nie był<br>w planie. Pasował<br>do <span class="red-text">koszyka.</span></h2><span class="relevance-line" aria-hidden="true"></span></section>')},
    {id:'decyzja-sie-domyka',title:'Formaty poznaliście, zanim padły nazwy',layout:'phases',theme:'light',textVersion:2,seconds:60,reveals:2,speaker:'Joanna',source:inquiry,notes:'Teraz nazywamy to, co publiczność już zobaczyła. Banner pokazał możliwość na starcie. Produkt sponsorowany i czytelna karta produktu pomogły wybrać. Rekomendacja przy koszyku pomogła domknąć zakup. Retail Media towarzyszy decyzji na każdym etapie, ale jego rola się zmienia. Nie zakładamy, że reklama zawsze zmienia już domkniętą decyzję.',html:heading('Formaty poznaliście,<br>zanim padły nazwy.','Retail Media działa wewnątrz decyzji')+'<div class="phase-line">'+
      [['01','Pokazać produkt','„Nie wiem, od czego zacząć.”','Banner'],['02','Pomóc wybrać','„Gdzie są przekąski?”<br>„Które kupić?”','Produkt sponsorowany,<br>packshot, wariant, cena'],['03','Domknąć zakup','„Nie szukałam, ale tego mi brakowało.”','Rekomendacja<br>przy koszyku']]
        .map(([n,role,question,format],i)=>{const item='<section class="phase-item active" data-move><span class="phase-number">'+n+'</span><h2 data-edit>'+role+'</h2><span class="phase-dot"></span><p class="phase-question" data-edit>'+question+'</p><p class="phase-format" data-edit>'+format+'</p></section>';return i?reveal(i,item):item;}).join('')+'</div>'},
    {id:'trafnosc',title:'Trafność pomaga',layout:'relevance',theme:'light',seconds:50,reveals:1,metrics:[48],speaker:'Joanna',source:inquiry,notes:'48% użytkowników uważa, że dobrze dopasowane rekomendacje pomagają szybciej znaleźć odpowiedni produkt. To deklarowana pomoc, nie zmierzony wzrost sprzedaży. Odsłoń wniosek: podpowiedź powinna pasować do tego, co klient właśnie robi. W naszej historii: nachosy po wpisaniu „przekąski” i dip przy koszyku z nachosami.',html:heading('Trafność pomaga.')+'<div class="relevance-metric">'+metric(48,'Dopasowane rekomendacje<br>pomagają szybciej znaleźć produkt','ink')+'</div>'+reveal(1,'<section class="relevance-copy" data-move><p class="kicker" data-edit>Właściwy kontekst</p><h2 data-edit>Pasuje do tego,<br>co klient<br>robi <span class="red-text">TERAZ.</span></h2><span class="relevance-line" aria-hidden="true"></span></section>')},
    {id:'wnioski',title:'Nie tylko wyświetlić. Pomóc wybrać.',layout:'takeaways',theme:'light',textVersion:2,seconds:55,reveals:3,speaker:'Obie',source:inquiry,notes:'Uliana: zacznijmy od tego, co konsument chce załatwić, a nie tylko od planu kampanii. Joanna: Retail Media daje marce miejsce w realnym wyborze, jeżeli produkt pasuje do aktualnej potrzeby: banner na spotkanie, nachosy po wpisaniu „przekąski”, dip przy koszyku. Wspólnie: śledźmy widoczność, uwagę, rozważanie i wybór. Sam zakup po ekspozycji nie dowodzi przyczynowego wpływu reklamy.',html:heading('Nie tylko wyświetlić.<br>Pomóc wybrać.')+'<div class="lessons">'+reveal(1,'<section class="lesson" data-move><span>01</span><h2 data-edit>Zacznij od potrzeby</h2></section>')+reveal(2,'<section class="lesson" data-move><span>02</span><h2 data-edit>Bądź w momencie decyzji</h2></section>')+reveal(3,'<section class="lesson" data-move><span>03</span><h2 data-edit>Sprawdź, czy pomagasz</h2></section>')+'</div>'},
    {id:'stol',title:'Marka dostała miejsce przy stole',layout:'story-table',theme:'light',paper:'#fbf7f0',seconds:30,reveals:1,speaker:'Obie',notes:'Dzwonek do drzwi. Goście są, stół jest nakryty: lemoniada, nachosy z dipem i czekolada. Odsłoń hasło i przeczytaj je powoli: „Marka dostała miejsce przy stole, bo pomogła go przygotować”. To puenta całej historii.',html:heading('Goście są.','Dzwonek do drzwi')+reveal(1,'<p class="table-slogan" data-edit>Marka dostała miejsce przy stole,<br>bo pomogła go <span class="red-text">przygotować.</span></p>')+'<div class="table-scene" data-move>'+tableArt+'</div>'},
    {id:'potrzeba-zalatwiona',title:'Mamy to!',layout:'closing',theme:'dark',textVersion:2,seconds:15,reveals:0,speaker:'Obie',notes:'Wróćcie do loadera ze slajdu 3. Teraz jest pełny. Powiedzcie: „To jest doświadczenie, którego potrzebuje Homo Urgens: potrzeba załatwiona”. Kliknięcie przenosi do slajdu organizatora z podziękowaniem i waszymi podpisami.',html:'<div class="closing-content"><div class="closing-meter" data-move><span>100<span>%</span></span></div><h1 data-edit>Mamy to!</h1></div>'},
    {id:'dziekujemy',title:'Dziękujemy!',layout:'thanks',theme:'red',paper:'#892424',seconds:10,reveals:0,heartFit,speaker:'Obie',notes:'Slajd organizatora konferencji I ♥ marketing & technology, wymagany na zakończenie każdego wystąpienia. Serce z okładki rośnie, aż jego fasetki wypełnią ekran. Powiedzcie razem: „Dziękujemy!”. Zostawcie ten slajd na ekranie podczas oklasków i pytań. Scenariusz trwa 15:25, z zapasem 2:35 do limitu 18 minut.',html:thanksBg+thanksPanel+'<div class="thanks-logo"><img src="assets/brand/organizer-thanks-logo.png" alt="I love marketing & technology"></div><div class="thanks-copy" data-move><h1 data-edit>Dziękujemy<span class="thanks-bang">!</span></h1></div><div class="thanks-speakers" data-move><p data-edit>Uliana Jelonek &amp; Joanna Wysocka</p><img src="assets/brand/glovo-logo-white.png" alt="Glovo"></div>'}
  ];
  slides.forEach(slide=>{if(Number.isInteger(slide.clock))slide.html+=storyClock(slide.clock);});
  window.HOMO_DECK={slides,totalDurationSeconds:slides.reduce((a,s)=>a+s.seconds,0),limitSeconds:1080};
})();
