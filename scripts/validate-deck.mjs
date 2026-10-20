import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'slides.js'),'utf8'),ctx);
const {slides,totalDurationSeconds,limitSeconds}=ctx.window.HOMO_DECK;
assert.equal(slides.length,24);assert.equal(new Set(slides.map(s=>s.id)).size,24);
assert.equal(totalDurationSeconds,925);assert.equal(limitSeconds,1080);
const expected={'kontrola':[78],'wybor-w-aplikacji':[55,41],dopasowanie:[27],trafnosc:[48]};
assert.equal(slides.reduce((n,s)=>n+(s.metrics?.length||0),0),5,'exactly five research metrics');
for(const slide of slides){
  assert.ok(slide.notes&&slide.speaker&&slide.seconds>0,slide.id+': speaker notes and timing');
  const steps=Array.from(slide.html.matchAll(/data-reveal="(\d+)"/g),m=>Number(m[1]));
  assert.equal(Math.max(0,...steps),slide.reveals,slide.id+': reveal count');
  for(let i=1;i<=slide.reveals;i++)assert.ok(steps.includes(i),slide.id+': continuous reveals');
  if(expected[slide.id]){
    assert.deepEqual(Array.from(slide.metrics),expected[slide.id]);
    assert.deepEqual(Array.from(slide.html.matchAll(/data-value="(\d+)"/g),m=>Number(m[1])),expected[slide.id]);
    assert.ok(slide.source.includes('Badanie Inquiry'));
  }
}
const waiting=slides.filter(s=>s.loader);
assert.deepEqual(Array.from(waiting,s=>s.id),['prosze-czekac','jeszcze-chwila']);
assert.equal(waiting[0].loader.duration+waiting[1].loader.duration,10000);
assert.equal(waiting[1].loader.to,99);
assert.equal(slides[0].id,'tytul','the deck opens on the cover with the speakers');
// The story clock runs from the guests' message to the 27% result, always forward, never with digits.
const clocked=slides.filter(s=>Number.isInteger(s.clock));
assert.equal(clocked[0].id,'goscie');assert.equal(clocked.at(-1).id,'dopasowanie');
assert.equal(clocked.length,slides.indexOf(clocked.at(-1))-slides.indexOf(clocked[0])+1,'clock on every story slide');
clocked.forEach((s,i)=>{assert.ok(!i||s.clock>clocked[i-1].clock,s.id+': clock moves forward');assert.ok(s.clock<20);assert.equal((s.html.match(/class="story-clock"/g)||[]).length,1);});
assert.ok(slides.filter(s=>!Number.isInteger(s.clock)).every(s=>!s.html.includes('story-clock')));
// The app mock-up carries no platform name or logo.
for(const slide of slides)for(const m of slide.html.matchAll(/<section class="shopping-frame[\s\S]*?<\/section>/g))assert.ok(!/glovo/i.test(m[0]),slide.id+': no platform name in the app mock-up');
assert.ok(slides.find(s=>s.id==='potrzeba-zalatwiona').html.includes('100'),'the loader completes at 100%');
// The organizer requires its own closing slide, last: thanks, its logo, no deck chrome or reveals.
const thanks=slides.at(-1);
assert.equal(thanks.id,'dziekujemy');assert.equal(thanks.layout,'thanks');assert.equal(thanks.reveals,0);
assert.ok(thanks.html.includes('Dziękujemy')&&thanks.html.includes('assets/brand/organizer-thanks-logo.png'));
assert.equal((thanks.html.match(/data-facet="/g)||[]).length,8,'eight heart facets');
for(const m of thanks.html.matchAll(/points="([^"]+)"/g))for(const pair of m[1].split(' ')){const [x,y]=pair.split(',').map(Number);assert.ok(x>=0&&x<=1920&&y>=0&&y<=1080,'thanks shapes stay inside the slide');}
const all=[fs.readFileSync(path.join(root,'index.html'),'utf8'),fs.readFileSync(path.join(root,'styles.css'),'utf8'),...slides.map(s=>s.html)].join('\n');
const files=new Set([...Array.from(all.matchAll(/(?:src|href)="([^"#]+)"/g),m=>m[1]),...Array.from(all.matchAll(/url\("([^"]+)"\)/g),m=>m[1])]);
for(const file of files){assert.ok(!/^https?:/.test(file),'offline asset: '+file);assert.ok(fs.existsSync(path.join(root,file)),'missing: '+file);}
const time=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
console.log('Validated: '+slides.length+' slides, '+slides.reduce((n,s)=>n+1+s.reveals,0)+' states, '+time(totalDurationSeconds)+' speaking time, 10-second loader, story clock on '+clocked.length+' slides, research values and '+files.size+' local resources.');
