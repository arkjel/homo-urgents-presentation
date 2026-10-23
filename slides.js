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

  // Inside the fridge of the next slide, seen from its back shelf. One vanishing point; the back wall is the screen scaled by k.
  // The lemon sits at (960,700): motion.js zooms the drawn fridge 6× onto its lemon and lands exactly here.
  const fridgeInside=()=>{
    const k=.42,back=([x,y])=>[960+(x-960)*k,540+(y-540)*k],mirror=list=>list.map(([x,y])=>[1920-x,y]);
    const rib=y=>{const [,b]=back([0,y]);return [[[0,y],[557,b],[557,b+30*k],[0,y+30]],[[0,y-10],[557,b-10*k],[557,b],[0,y]]];};
    const ribs=[120,300,480].flatMap(y=>{const [shade,light]=rib(y);return [poly(shade,'#ddd2b8'),poly(light,'#fcf8ee'),poly(mirror(shade),'#d9ceb3'),poly(mirror(light),'#fbf6ea')];}).join('');
    // A faceted lemon: an outer and an inner ring of facets, lit from the top left, darker towards the shelf.
    const a=-6*Math.PI/180,at=([x,y])=>[960+x*Math.cos(a)-y*Math.sin(a),700+x*Math.sin(a)+y*Math.cos(a)];
    const rim=[[-165,-4],[-142,-58],[-92,-102],[-24,-118],[48,-112],[108,-84],[148,-40],[166,2],[146,52],[98,92],[30,112],[-44,110],[-106,84],[-146,44]];
    const H=[-24,-30],inner=rim.map(([x,y])=>[H[0]+(x-H[0])*.56,H[1]+(y-H[1])*.56]);
    const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(p,q,t)=>'#'+rgb(p).map((v,i)=>Math.round(v+(rgb(q)[i]-v)*t).toString(16).padStart(2,'0')).join('');
    const shade=(tri,i)=>{const cx=tri.reduce((s,p)=>s+p[0],0)/3/166,cy=tri.reduce((s,p)=>s+p[1],0)/3/118;
      const b=Math.min(1,Math.max(0,.5+.5*(-.55*cx-.83*cy)*1.25+(i%2?.05:-.05)));return b<.5?mix('#cf980c','#f4cf3c',b*2):mix('#f4cf3c','#fdeb98',(b-.5)*2);};
    const facets=rim.flatMap((p,i)=>{const n=(i+1)%rim.length;return [[p,rim[n],inner[n]],[p,inner[n],inner[i]],[H,inner[i],inner[n]]];});
    const lemon=facets.map((tri,i)=>poly(tri.map(at),shade(tri,i))).join('');
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
      +ellipse(960,820,150,18,'#d4c8ab')+'<g class="inside-lemon">'+lemon+'</g></svg>';
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
  const pack=(kind,brand='')=>'<span class="pack pack-'+kind+(brand?' brand-'+brand.toLowerCase():'')+'" aria-hidden="true">'+(brand?'<b>'+brand+'</b>':'')+'</span>';
  const bar=(brand,label)=>'<span class="choc brand-'+brand.toLowerCase()+'" aria-hidden="true"><b>'+brand+'</b><i>'+label+'</i></span>';
  const row=(kind,brand,name,detail,price,cls='')=>'<div class="product-row '+cls+'">'+pack(kind,brand)+'<div><strong data-edit>'+name+'</strong><span class="product-detail" data-edit>'+detail+'</span></div><b data-edit>'+price+'</b><span class="product-add" aria-hidden="true">+</span></div>';
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
  const app={
    home:frame('home',top('Dzień dobry!','Czego dziś potrzebujesz?')+
      '<div class="shop-search"><span aria-hidden="true">⌕</span><span data-edit>Szukaj produktów</span></div>'+
      '<div class="app-banner">'+ad+'<strong data-edit>Spotkanie ze znajomymi?</strong><span class="banner-cta" data-edit>Zobacz produkty →</span>'+nachosArt+'</div>'+
      '<p class="app-section" data-edit>Kategorie</p><div class="app-cats">'+
      [['bottle','Napoje'],['bag','Przekąski'],['bar','Słodycze'],['fruit','Owoce']].map(([kind,name])=>'<span class="app-cat"><span class="cat-icon">'+pack(kind)+'</span><span data-edit>'+name+'</span></span>').join('')+'</div>'),
    search:frame('search',top('Na spotkanie','Znajdź produkt')+
      '<div class="shop-search"><span aria-hidden="true">⌕</span><span class="type-query" data-edit>przekąski</span></div>'+
      reveal(1,'<div class="relevant-offer">'+pack('bag','A')+'<div>'+ad+'<strong data-edit>Nachosy solone · marka A</strong><span data-edit>200 g</span></div><b data-edit>8,99 zł</b><span class="product-add" aria-hidden="true">+</span></div>'+
        row('bag','B','Chipsy paprykowe · marka B','150 g','6,99 zł')+row('bag','C','Paluszki solone · marka C','200 g','4,49 zł')+row('bag','D','Popcorn maślany · marka D','90 g','5,49 zł'),'shop-results')+
      '<div class="shop-bottom"><span data-edit>Szukam kategorii. Marka jest otwarta.</span></div>'),
    shelf:frame('shelf',top('Słodycze','Czekolady')+'<div class="app-grid">'+
      [['B','Czekolada z orzechami','Z ORZECHAMI','marka B · 100 g','6,49 zł','sponsored selected'],['A','Czekolada gorzka 70%','GORZKA 70%','marka A · 100 g','7,29 zł',''],['C','Czekolada mleczna','MLECZNA','marka C · 90 g','5,49 zł',''],['D','Czekolada z karmelem','Z KARMELEM','marka D · 100 g','6,99 zł','']]
        .map(([brand,name,label,detail,price,cls])=>'<div class="app-tile '+cls+'">'+(cls.includes('sponsored')?'<span class="tile-tag" data-edit>Sponsorowane</span>':'')+'<div class="tile-shot">'+bar(brand,label)+'</div><strong data-edit>'+name+'</strong><span class="product-detail" data-edit>'+detail+'</span><div class="tile-foot"><b data-edit>'+price+'</b><span class="product-add" aria-hidden="true">+</span></div></div>').join('')+'</div>'+
      reveal(1,'<p class="selection-feedback" data-edit>Dodano do koszyka: czekolada z orzechami</p>')),
    cart:frame('cart',top('Mój koszyk','Twój koszyk')+
      row('bottle','C','Lemoniada · marka C','1 l','7,99 zł')+row('bag','A','Nachosy solone · marka A','200 g','8,99 zł')+row('bar','B','Czekolada z orzechami · marka B','100 g','6,49 zł')+
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

  // The guests on their way (slide 12): a faceted red estate car with three friends inside, lit from the top left like the heart.
  // Its ground line (y = 176) lands on the top edge of the red band; motion.js spins the wheels, rocks the body and blows the exhaust.
  const guestCar=(()=>{
    const facet=(list,fill)=>poly(list,fill,' stroke="'+fill+'" stroke-width=".8" stroke-linejoin="round"');
    const reds=['#7d1118','#95161d','#b51a22','#cf1723','#e0262a','#ee312f','#f25553','#f6716d'];
    // The lower body: two strips of facets (beltline to crease, crease to sill), brighter on top and towards the rear.
    const xs=[26,56,86,116,146,176,206,236,266,296,326,356,386,414,442];
    const belt=[96,94,94,94,94,94,94,94,94,94,94,96.5,99,103,122],crease=[122,120,120,120,120,120,120,120,120,120,120,120,121,123,128],sill=[146,154,154,154,154,154,154,154,154,154,154,154,154,152,144];
    const strip=(top,bottom,base)=>xs.slice(1).flatMap((x,i)=>{const a=[xs[i],top[i]],b=[x,top[i+1]],c=[x,bottom[i+1]],d=[xs[i],bottom[i]];return i%2?[[a,b,d],[b,c,d]]:[[a,b,c],[a,c,d]];})
      .map((t,i)=>facet(t,reds[Math.max(0,Math.min(7,Math.round((base+.18*(1-(t[0][0]+t[1][0]+t[2][0])/1380)+(i%2?.07:-.07))*7)))])).join('');
    // Friends in profile, facing the road; faces in the heroine's grey facets (mascot.js). The frame drawn after them hides any bounce past the glass.
    const head=[[0,-14],[12.5,-9],[13,7],[0,14],[-13,7],[-12.5,-9]],skin=['#ececec','#dadada','#cecece','#e2e2e2','#f3f3f3','#fbfbfb'];
    const guest=(cx,shirt,look)=>{const at=list=>list.map(([x,y])=>[cx+x,68+y]);
      return '<g class="car-guest">'+poly(at([[-17,30],[-14,18],[-5,14],[6,14],[14,18],[17,30]]),shirt)+head.map((p,i)=>facet(at([p,head[(i+1)%6],[0,0]]),skin[i])).join('')+
        facet(at([[13,-1],[17,4],[13,6]]),'#dadada')+poly(at([[5,-4],[8,-4],[8,0],[5,0]]),'#151515')+poly(at([[4,8],[10,7],[8,10]]),'#8e1219')+look.map(([list,fill])=>facet(at(list),fill)).join('')+'</g>';};
    const wheel=cx=>{const rim=arc(cx,151,15,15,0,360,10);
      return '<g class="car-wheel">'+poly(arc(cx,151,25,25,0,360,10).slice(0,-1),'#1f1f1f')+poly(arc(cx,151,19,19,0,360,10).slice(0,-1),'#3a3a3a')+
        rim.slice(0,-1).map((p,i)=>facet([[cx,151],p,rim[i+1]],i%2?'#9aa1ab':'#e6e9ed')).join('')+poly(arc(cx,151,5,5,0,360,8).slice(0,-1),'#5a5a5a')+'</g>';};
    // A static trail for Google Slides and still frames; in motion the same puffs leave the pipe one after another.
    const puff=gem(0,0,10,8.5,['#fbfbfb','#e4e4e4','#c2c2c2'],7);
    const exhaust='<g class="car-exhaust" data-x="12" data-y="152">'+[[-2,149,.55,.85],[-24,143,.8,.7],[-52,135,1.05,.5],[-86,126,1.3,.32],[-124,117,1.55,.16]]
      .map(([x,y,s,o])=>'<g class="car-puff" transform="translate('+x+' '+y+') scale('+s+')" opacity="'+o+'">'+puff+'</g>').join('')+'</g>';
    return '<svg class="car-art" viewBox="0 0 460 190" aria-hidden="true">'+ellipse(232,176,212,6,'#151515',' fill-opacity=".14" class="car-shadow"')+exhaust+
      '<g class="car-body">'+poly([[30,94],[40,50],[52,40],[262,40],[326,94]],'#9fc3db')+
        guest(86,'#e9a72f',[[[[-14,-6],[-9,-6],[-11,5],[-14.5,3]],'#7a4627'],[[[-14,-6],[-11,-14],[0,-19],[10,-15],[14,-7]],'#2c6f98'],[[[-11,-14],[0,-19],[-2,-12]],'#3a8fc2'],[[[10,-9],[25,-6],[24,-3],[12,-5]],'#1f5577']])+
        guest(161,'#2f7d5b',[[[[-14,-9],[-5,-17],[-1,-6],[-5,17],[-16,19]],'#c9922f'],[[[-5,-17],[6,-18],[14,-10],[4,-8],[-1,-6]],'#e0b04f'],[[[12,16],[18,13],[28,27],[22,29]],'#2f7d5b']])+
        guest(244,'#3a3a3a',[[[[-13.5,-8],[-5,-16],[-3,-5],[-13,5]],'#2b2b2b'],[[[-5,-16],[6,-17],[13.5,-9],[3,-8],[-3,-5]],'#3d3d3d']])+
        // The passenger waves inside her window; it turns about the elbow below the sill, and the frame drawn after it keeps the hand in the glass.
        '<g class="car-arm" data-pivot="186,96">'+facet([[181,98],[186,98],[187,69],[183,69]],'#2f7d5b')+facet([[186,98],[191,98],[191,69],[187,69]],'#276b4d')+
          facet([[182,69],[187,69],[187,57],[184,57],[181,62]],'#dadada')+facet([[187,69],[192,69],[194,62],[192,57],[187,57]],'#c4c4c4')+
          facet([[182.5,58],[183.5,51],[185.5,57]],'#cecece')+facet([[185.5,57],[187.5,50],[189.5,57]],'#dadada')+facet([[189.5,58],[192,52],[193,59]],'#c4c4c4')+facet([[181,63],[176,58],[182,60]],'#cecece')+'</g>'+
        poly([[270,72],[275,70],[285,90],[280,92]],'#151515')+poly([[52,58],[60,50],[52,90],[45,90]],'#fff',' fill-opacity=".35"')+poly([[266,50],[274,50],[300,82],[292,82]],'#fff',' fill-opacity=".35"')+
        facet([[40,50],[52,40],[262,40],[271.5,48],[58,48],[48,54]],'#f25553')+facet([[52,40],[262,40],[150,45]],'#f6716d')+facet([[40,50],[48,54],[39,94],[30,94]],'#cf1723')+
        facet(box(114,48,124,94),'#e0262a')+facet(box(198,48,208,94),'#e0262a')+facet([[258,48],[271.5,48],[326,94],[310.4,94]],'#f25553')+
        strip(belt,crease,.62)+strip(crease,sill,.34)+
        poly(box(119,96,121,152),'#95161d')+poly(box(203,96,205,153),'#95161d')+poly([[311,96],[313,96],[316,140],[314,140]],'#95161d')+
        poly(box(176,101,190,105),'#e6e9ed')+poly(box(262,101,276,105),'#e6e9ed')+facet([[316,84],[330,80],[334,90],[320,94]],'#b51a22')+
        poly(box(26,100,34,118),'#5d0f14')+poly(box(27,102,33,111),'#ff6b5e')+poly([[422,112],[437,119],[440,128],[424,124]],'#fbe78a')+poly([[426,114],[433,117.5],[428,118]],'#fff6d6')+
        [112,350].map(cx=>poly([...arc(cx,151,32,32,180,360,10),[cx+32,154],[cx-32,154]],'#4a0c10')).join('')+
        poly(box(12,149,32,155),'#8a8a8a')+ellipse(12,152,2.2,3,'#3a3a3a')+poly([[18,134],[30,134],[30,152],[20,150]],'#9aa1ab')+poly([[434,136],[447,138],[447,150],[432,153]],'#c9ccd2')+
      '</g>'+wheel(112)+wheel(350)+'</svg>';
  })();

  // The finale: a laid table in the conference heart's facet language.
  const nachos=[[[600,206],[652,130],[690,200]],[[640,200],[700,118],[742,196]],[[690,204],[758,134],[790,206]],[[742,206],[800,150],[836,210]],[[566,212],[598,160],[632,214]],[[620,176],[676,150],[650,214]],[[700,170],[742,150],[728,214]],[[760,180],[812,176],[790,214]]];
  const nachoShades=['#f6c453','#eeb33b','#f8d77a','#e7a12c'];
  const tableArt='<svg class="table-art" viewBox="0 0 1660 440" aria-hidden="true">'+
    '<g class="table-top">'+poly([[110,170],[1550,170],[1660,340],[0,340]],'#c8925e')+poly([[0,340],[1660,340],[1660,382],[0,382]],'#9c6438')+
      poly([[60,382],[112,382],[112,440],[60,440]],'#8a5631')+poly([[1548,382],[1600,382],[1600,440],[1548,440]],'#8a5631')+
      poly([[560,170],[1100,170],[1180,340],[480,340]],'#fffaf2')+poly([[560,170],[590,170],[512,340],[480,340]],'#ee312f')+poly([[1070,170],[1100,170],[1180,340],[1148,340]],'#ee312f')+'</g>'+
    '<g class="table-item">'+ellipse(300,262,124,34,'#fff')+ellipse(300,262,88,24,'#f1ece4')+ellipse(1380,262,124,34,'#fff')+ellipse(1380,262,88,24,'#f1ece4')+'</g>'+
    '<g class="table-item">'+poly([[392,82],[488,82],[500,262],[380,262]],'#f3e2a0')+poly([[400,96],[420,96],[414,250],[392,250]],'#fbf1c8')+poly([[488,110],[530,124],[524,200],[494,214]],'#e9d48a')+ellipse(440,82,48,10,'#fff6d6')+'<circle cx="452" cy="150" r="22" fill="#f4d03f"/><circle cx="452" cy="150" r="14" fill="#fbe78a"/></g>'+
    '<g class="table-item">'+poly(arc(700,212,150,92,0,180,24),'#cf1723')+ellipse(700,212,150,30,'#95161d')+'</g>'+
    nachos.map((t,i)=>poly(t,nachoShades[i%4],' class="nacho"')).join('')+
    '<g class="table-item">'+poly(arc(930,262,70,44,0,180,16),'#fff')+ellipse(930,262,70,16,'#ee312f')+poly([[904,258],[922,252],[916,266]],'#95161d')+poly([[940,256],[958,262],[944,268]],'#95161d')+'</g>'+
    '<g class="table-item">'+poly([[1060,236],[1214,214],[1236,272],[1082,294]],'#23305e')+poly([[1060,236],[1096,231],[1118,289],[1082,294]],'#d6b15e')+
      poly([[1206,286],[1246,280],[1254,306],[1214,312]],'#5a3321')+poly([[1252,292],[1292,286],[1300,312],[1260,318]],'#6d4029')+poly([[1226,252],[1262,246],[1270,272],[1234,278]],'#6d4029')+'</g>'+
    '<g class="table-item">'+poly([[1474,150],[1528,150],[1520,250],[1482,250]],'#f3e2a0')+ellipse(1501,150,27,6,'#fff6d6')+poly([[1556,166],[1606,166],[1598,256],[1564,256]],'#f3e2a0')+ellipse(1581,166,25,6,'#fff6d6')+'</g>'+
    '</svg>';

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

  const slides=[
    {id:'tytul',title:'Homo Urgens: Wychowaliśmy pokolenie natychmiastowości. Co na to Retail Media onsite?',layout:'cover',theme:'light',textVersion:2,seconds:30,reveals:0,coverHeart,speaker:'Obie',notes:'To pierwszy slajd. Ustaw go przed wejściem na scenę; po wejściu naciśnij R, aby serce złożyło się jeszcze raz. Przedstawcie się krótko. Powiedzcie, że opowiecie jedną historię zakupową i pokażecie na niej, co z badania Inquiry wynika dla Retail Media onsite.',html:coverTemplate+'<div class="cover-copy"><p class="kicker" data-edit>Tryb: TERAZ</p><h1 data-edit>Homo<br>Urgens</h1><p class="cover-subtitle" data-edit>Wychowaliśmy pokolenie natychmiastowości.<br>Co na to Retail Media onsite?</p><p class="speakers" data-edit>Uliana Jelonek<br>Joanna Wysocka</p><img class="speakers-logo" src="assets/brand/glovo-logo-black.png" alt="Glovo"></div>'},
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
    {id:'pusta-lodowka',title:'o-shit commerce',layout:'fridge-inside',theme:'light',seconds:10,reveals:0,clock:1,speaker:'Uliana',notes:'O-shit commerce: goście za 20 minut, a w lodówce tylko cytryna. Krótka pauza na reakcję sali. To moment, w którym zaczyna się pilna potrzeba. Kliknięcie: kamera odjeżdża od lodówki i widzimy bohaterkę.',html:'<div class="inside-scene">'+fridgeInside()+'</div><h1 class="inside-title" data-edit>o-shit commerce</h1>'},
    {id:'lodowka',title:'To nie jest moment na długą historię marki',layout:'fridge',theme:'dark',seconds:30,reveals:1,clock:2,speaker:'Uliana',notes:'Otwarta lodówka, prawie pusta. To nie jest moment na długą historię marki. Bohaterka potrzebuje napojów, przekąsek i czegoś słodkiego. Odsłoń jej listę. Potrzeba plus brak czasu: tryb TERAZ.',html:heading('To nie jest moment<br>na długą historię<br>marki.','Otwieram lodówkę')+
      reveal(1,'<p class="fridge-need" data-edit>Potrzebuję napojów, przekąsek<br>i czegoś słodkiego. <span class="red-text">Teraz.</span></p>')+
      '<div class="fridge" data-move aria-hidden="true"><i class="fridge-glow"></i><div class="fridge-body"><div class="fridge-inside"><i class="shelf s1"></i><i class="shelf s2"></i><i class="shelf s3"></i><span class="fridge-item item-jar"></span><span class="fridge-item item-lemon"></span><span class="fridge-item item-sauce"></span></div></div>'+
      '<svg class="fridge-door" viewBox="0 0 170 780">'+poly([[0,0],[170,70],[170,720],[0,780]],'#d4d4d9')+poly([[16,36],[154,94],[154,680],[16,738]],'#e9e9ed')+poly([[30,120],[140,160],[140,190],[30,152]],'#f4f4f6')+poly([[30,330],[140,350],[140,380],[30,362]],'#f4f4f6')+poly([[56,96],[72,98],[72,122],[56,118]],'#ee312f')+'</svg></div>'},
    {id:'dwa-plany',title:'Dwa plany. Jeden moment.',layout:'worlds',theme:'dark',textVersion:3,seconds:50,reveals:2,clock:3,speaker:'Uliana',notes:'Marka ma swój plan: launch, awareness, zaangażowanie i główny produkt. Konsumentka też ma plan: goście za 20 minut i coś słodkiego na stół. Najpierw widać tylko markę. Pierwsze kliknięcie odsłania konsumentkę i jej plan, drugie: rolę Retail Media jako miejsca spotkania tych dwóch planów. Nie przeciwstawiamy celów marki klientce: szukamy momentu, w którym produkt marki pomaga wykonać jej zadanie.',html:'<div class="world-brand" data-move><p class="kicker" data-edit>Marka</p><h1 data-edit>Ma swój plan.</h1><div class="brand-goals"><p data-edit>Launch</p><p data-edit>Awareness</p><p data-edit>Zaangażowanie</p><p data-edit>Główny produkt</p></div><p class="world-quote" data-edit>Chce, żebyś wybrała jej produkt.</p></div>'+reveal(1,'<div class="world-consumer" data-move><p class="kicker" data-edit>Konsumentka</p><h1 data-edit>Też ma plan.</h1><p class="consumer-need" data-edit>Goście<br>za 20 minut.</p><p class="world-quote" data-edit>Potrzebuje czegoś słodkiego. <span class="red-text">TERAZ.</span></p></div>')+reveal(2,'<div class="world-bridge" data-move><span class="bridge-icon" aria-hidden="true">↔</span><h2 data-edit>Retail Media łączy te dwa plany.</h2></div>')+reveal(1,'<div class="guest-car" data-move>'+guestCar+'</div>')},
    {id:'potrzeba-teraz',title:'Potrzebuję czekolady',layout:'scenario',theme:'light',seconds:40,reveals:1,clock:4,speaker:'Uliana',notes:'Coś słodkiego dla gości: czekolada. Bohaterka zna produkt, ale nie wybrała marki. Nie przypisujemy tej historii konkretnej osobie z badania. Odsłoń różnicę między znaną potrzebą a otwartym wyborem marki.',html:heading('Potrzebuję<br>czekolady.','Plan konsumentki')+'<p class="scenario-question" data-edit>Coś słodkiego dla gości. Teraz.</p>'+
      '<div class="hero-chocolate" data-move aria-hidden="true"><i class="choc-shadow"></i><span class="choc-piece p1"></span><span class="choc-piece p2"></span><div class="choc-pack"><svg class="choc-foil" viewBox="0 0 220 80">'+poly([[0,80],[0,34],[28,18],[46,36],[78,6],[104,30],[136,10],[162,34],[192,14],[220,30],[220,80]],'#c9ccd2')+poly([[0,80],[0,50],[30,36],[52,52],[84,26],[110,48],[140,30],[166,52],[196,36],[220,48],[220,80]],'#e8eaee')+'</svg><div class="choc-bar"><span class="choc-brand">?</span><span class="choc-label">CZEKOLADA</span></div></div></div>'+
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
