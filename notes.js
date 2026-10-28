// Speaker notes markup shared by the O dialog and the presenter window: one paragraph per line,
// **key line** from the script, „AKT …” act heading.
(function(global){
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function toHtml(notes){
    return String(notes||'').split('\n').filter(line=>line.trim()).map(line=>{
      const text=escape(line).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
      if(/^AKT [IVX]+\./.test(line))return '<p class="note-act">'+text+'</p>';
      return '<p>'+text+'</p>';
    }).join('');
  }
  global.HomoNotes={toHtml};
})(typeof window==='undefined'?globalThis:window);
