import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'slides.js'),'utf8'),ctx);
const {slides,totalDurationSeconds,limitSeconds}=ctx.window.HOMO_DECK;
assert.equal(slides.length,20);assert.equal(new Set(slides.map(s=>s.id)).size,20);
assert.equal(totalDurationSeconds,940);assert.equal(limitSeconds,1080);
const expected={'kontrola':[78,48],'koszt-czekania':[53,20],'wybor-w-aplikacji':[55,41],trafnosc:[48]};
for(const slide of slides){
  assert.ok(slide.notes&&slide.speaker&&slide.seconds>0,slide.id+': speaker notes and timing');
  const steps=Array.from(slide.html.matchAll(/data-reveal="(\d+)"/g),m=>Number(m[1]));
  assert.equal(Math.max(0,...steps),slide.reveals,slide.id+': reveal count');
  for(let i=1;i<=slide.reveals;i++)assert.ok(steps.includes(i),slide.id+': continuous reveals');
  if(expected[slide.id]){
    assert.deepEqual(Array.from(slide.metrics),expected[slide.id]);
    assert.deepEqual(Array.from(slide.html.matchAll(/data-value="(\d+)"/g),m=>Number(m[1])),expected[slide.id]);
    assert.ok(slide.source.includes('Inquiry / Glovo'));
  }
}
assert.equal(slides[0].loader.duration+slides[1].loader.duration,10000);
assert.equal(slides[1].loader.to,99);
assert.ok(slides.at(-1).html.includes('100'));
const all=[fs.readFileSync(path.join(root,'index.html'),'utf8'),fs.readFileSync(path.join(root,'styles.css'),'utf8'),...slides.map(s=>s.html)].join('\n');
const files=new Set([...Array.from(all.matchAll(/(?:src|href)="([^"#]+)"/g),m=>m[1]),...Array.from(all.matchAll(/url\("([^"]+)"\)/g),m=>m[1])]);
for(const file of files){assert.ok(!/^https?:/.test(file),'offline asset: '+file);assert.ok(fs.existsSync(path.join(root,file)),'missing: '+file);}
console.log('Validated: '+slides.length+' slides, '+slides.reduce((n,s)=>n+1+s.reveals,0)+' states, 15:40 speaking time, 10-second opening, research values and '+files.size+' local resources.');
