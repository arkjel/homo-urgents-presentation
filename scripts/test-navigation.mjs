import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const ctx={};vm.createContext(ctx);vm.runInContext(readFileSync(new URL('../navigation.js',import.meta.url),'utf8'),ctx);
const {createNavigation,presentationKey}=ctx.HomoNavigation;
const fixture=()=>createNavigation([{id:'wait',reveals:0},{id:'data',reveals:2},{id:'end',reveals:1}]);
test('rapid forward presses preserve each reveal and slide',()=>{
  const n=fixture(),states=[];
  for(let i=0;i<5;i++){n.next();states.push([n.state().index,n.state().step]);}
  assert.deepEqual(states,[[1,0],[1,1],[1,2],[2,0],[2,1]]);
  n.next();assert.deepEqual([n.state().index,n.state().step],[2,1]);
});
test('back restores the final state of the preceding slide',()=>{
  const n=fixture();n.show(2);n.previous();
  assert.deepEqual([n.state().index,n.state().step],[1,2]);
  n.previous();n.previous();n.previous();
  assert.deepEqual([n.state().index,n.state().step],[0,0]);
  n.previous();assert.equal(n.state().index,0);
});
test('jump clamps out-of-range slide and reveal positions',()=>{
  const n=fixture();n.show(100,Infinity);assert.equal(n.state().step,1);
  n.show(-50,-2);assert.equal(n.state().id,'wait');assert.equal(n.state().step,0);
});
test('common and legacy clicker signals normalize consistently',()=>{
  for(const e of [{key:'Down'},{key:'Unidentified',code:'ArrowDown'},{keyCode:40},{which:40}])assert.equal(presentationKey(e),'ArrowDown');
  for(const e of [{key:'Up'},{code:'ArrowUp'},{keyCode:38}])assert.equal(presentationKey(e),'ArrowUp');
  assert.equal(presentationKey({key:'Spacebar'}),' ');
  assert.equal(presentationKey({key:'a',code:'PageDown'}),'a');
});
