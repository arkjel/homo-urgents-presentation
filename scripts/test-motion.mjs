import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const ctx={};vm.createContext(ctx);vm.runInContext(readFileSync(new URL('../motion.js',import.meta.url),'utf8'),ctx);
const {loaderValue,easing}=ctx.DECK_MOTION;
test('opening loaders start and end exactly on their slide values',()=>{
  for(const [from,to] of [[0,87],[87,99]]){
    assert.equal(loaderValue(0,from,to),from);
    assert.equal(loaderValue(1,from,to),to);
    assert.equal(loaderValue(2,from,to),to);
  }
});
test('the loader never moves backwards and stays within range',()=>{
  for(const [from,to] of [[0,87],[87,99]]){
    let last=from;
    for(let i=0;i<=2000;i++){
      const value=loaderValue(i/2000,from,to);
      assert.ok(value>=last-1e-9&&value<=to+1e-9,'t='+i/2000);
      last=value;
    }
  }
});
test('the loader stalls: some stretches barely move, others jump',()=>{
  const steps=Array.from({length:20},(_,i)=>loaderValue((i+1)/20,0,87)-loaderValue(i/20,0,87));
  assert.ok(Math.min(...steps)<1.5,'a visible stall');
  assert.ok(Math.max(...steps)>8,'a visible burst');
});
test('count-up easing reaches the exact end value',()=>{
  const ease=easing.bezier(.16,1,.3,1);
  assert.equal(ease(0),0);assert.equal(ease(1),1);
  assert.ok(ease(.5)>.85&&ease(.5)<1);
});
