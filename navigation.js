// The same next/previous semantics as tgc-presentation, independent of rendering.
(function(global){
  function createNavigation(slides) {
    let index=0,step=0;
    const state=()=>({index,step,id:slides[index].id,count:slides.length});
    const show=(i,s=0)=>{
      index=Math.max(0,Math.min(slides.length-1,i));
      const max=slides[index].reveals||0;
      step=s===Infinity?max:Math.max(0,Math.min(max,s));
      return state();
    };
    const next=()=>step<(slides[index].reveals||0)?show(index,step+1):show(index+1,index<slides.length-1?0:step);
    const previous=()=>step>0?show(index,step-1):index>0?show(index-1,Infinity):state();
    return {state,show,next,previous};
  }
  function presentationKey(event) {
    const aliases={Right:'ArrowRight',Left:'ArrowLeft',Down:'ArrowDown',Up:'ArrowUp',Next:'PageDown',Prior:'PageUp',Spacebar:' ',Space:' ',NumpadEnter:'Enter',KeyN:'n',KeyP:'p',N:'n',P:'p'};
    const legacy={8:'Backspace',13:'Enter',32:' ',33:'PageUp',34:'PageDown',35:'End',36:'Home',37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',78:'n',80:'p'};
    const key=[event.key,event.code].find(v=>v&&v!=='Unidentified')||legacy[event.keyCode||event.which]||'';
    return aliases[key]||key;
  }
  global.HomoNavigation={createNavigation,presentationKey};
})(typeof window==='undefined'?globalThis:window);
