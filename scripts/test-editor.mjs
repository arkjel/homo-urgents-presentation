import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(readFileSync(new URL('../editor-data.js',import.meta.url),'utf8'),ctx);
const parse=source=>ctx.window.DECK_OVERRIDE_FORMAT.parse(source,'homo-urgens');
test('export preserves text and slide-coordinate positions',()=>{
  const value={version:1,edition:'homo-urgens',texts:{'potrzeba-teraz::0':'Potrzebuję antyperspirantu'},positions:{'potrzeba-teraz::move-0':{x:18,y:-7}}};
  const parsed=parse('// export\nwindow.DECK_EDITOR_OVERRIDES = '+JSON.stringify(value)+';');
  assert.equal(parsed.texts['potrzeba-teraz::0'],value.texts['potrzeba-teraz::0']);
  assert.equal(parsed.positions['potrzeba-teraz::move-0'].y,-7);
});
test('edits from other decks cannot overwrite this presentation',()=>{
  assert.throws(()=>parse(JSON.stringify({version:1,edition:'tgc',texts:{},positions:{}})),/edition/);
  assert.throws(()=>parse(JSON.stringify({'cover::0':'Legacy TGC export'})),/edition/);
});
test('imports reject executable scripts, unsafe shapes and invalid positions',()=>{
  for(const source of ['alert(1)',JSON.stringify({version:2,edition:'homo-urgens',texts:{},positions:{}}),JSON.stringify({version:1,edition:'homo-urgens',texts:{},positions:{'potrzeba-teraz::move-0':{x:10000,y:0}}})])assert.throws(()=>parse(source));
});
