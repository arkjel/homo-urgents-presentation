(() => {
  const edition = window.DECK_EDITION;
  const tr = window.DECK_I18N.text;
  // This deck keeps independent text and layout caches.
  const storageKey = edition.editor.texts;
  const layoutStorageKey = edition.editor.positions;
  const supplied = window.DECK_EDITOR_OVERRIDES || { edition: edition.id, texts: {}, positions: {} };
  const bundled = supplied.edition === edition.id ? supplied : {texts:{},positions:{}};
  let editing = false;
  let minimized = false;
  let moving = false;
  let selected = null;
  let drag = null;
  let overrides = { ...bundled.texts };
  let positions = { ...bundled.positions };
  try { overrides = { ...overrides, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; } catch { /* File overrides still work without local storage. */ }
  try { positions = { ...positions, ...JSON.parse(localStorage.getItem(layoutStorageKey) || '{}') }; } catch { /* Keep bundled positions. */ }
  const originals = new Map();
  const copyPrefix = id => {
    const slide = window.HOMO_DECK.slides.find(item => item.id === id);
    return slide?.textVersion ? `${id}-v${slide.textVersion}` : id;
  };
  const stage = document.querySelector('#stage');
  const panel = document.createElement('aside');
  panel.className = 'text-editor';
  panel.hidden = true;
  panel.setAttribute('aria-label', tr('Edytor prezentacji'));
  panel.innerHTML = window.DECK_I18N.html(`<div class="editor-top"><strong>Edycja slajdu</strong><div class="editor-top-actions"><button type="button" data-action="minimize" aria-expanded="true">Zwiń</button><button type="button" data-action="close">Gotowe · Esc</button></div></div>
    <div class="editor-modes" role="group" aria-label="Tryb edycji"><button type="button" data-action="text" aria-pressed="true">Tekst</button><button type="button" data-action="move" aria-pressed="false">Przesuwaj</button></div>
    <p class="editor-hint">Kliknij tekst. Zmiany zapisują się w tej przeglądarce.</p>
    <label>Slajd <select data-editor="slide" aria-label="Slajd do edycji"></select></label>
    <div class="editor-position-controls" hidden><label>Element <select data-editor="element" aria-label="Element do przesunięcia"></select></label><button type="button" data-action="reset-position" disabled>Wyzeruj pozycję elementu</button></div>
    <div class="editor-actions"><button type="button" data-action="export">Eksportuj zmiany</button><button type="button" data-action="pptx">Eksportuj PPTX</button><button type="button" data-action="pptx-google">PPTX dla Google</button><button type="button" data-action="import">Importuj</button><button type="button" data-action="reset">Przywróć teksty</button><button type="button" data-action="reset-layout">Przywróć układ</button></div>
    <small role="status">Teksty i pozycje zapisują się lokalnie. Eksport zachowuje je w pliku text-overrides.js.</small>`);
  document.body.append(panel);
  const select = panel.querySelector('[data-editor="slide"]');
  const elementSelect = panel.querySelector('[data-editor="element"]');
  window.HOMO_DECK.slides.forEach((slide, index) => {
    const option = document.createElement('option');
    option.value = index;
    const fallback = null;
    option.textContent = `${index + 1}. ${slide.title || (fallback ? tr(fallback) : slide.id)}`;
    select.append(option);
  });
  select.addEventListener('change', () => window.DECK_NAV.show(Number(select.value)));
  elementSelect.addEventListener('change', () => {
    selectElement(stage.querySelector(`[data-move-key="${elementSelect.value}"]`));
    selected?.focus({ preventScroll: true });
  });
  function status(message) { panel.querySelector('[role="status"]').textContent = tr(message); }
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(overrides));
      localStorage.setItem(layoutStorageKey, JSON.stringify(positions));
      status('Zapisano teksty i pozycje w tej przeglądarce. Eksport zachowuje je w pliku.');
    } catch { status('Pamięć przeglądarki jest niedostępna. Eksportuj zmiany, aby je zachować.'); }
  }
  function editLeaves(root) {
    // Preserve inline emphasis and line breaks, as well as existing text override keys.
    root.querySelectorAll('h1,h2,h3,p,figcaption').forEach(el => {
      if (el.closest('[data-edit]') || el.querySelector('[data-edit]')) return;
      if (!el.children.length) { el.dataset.edit = ''; return; }
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walk.nextNode()) if (walk.currentNode.textContent.trim()) nodes.push(walk.currentNode);
      nodes.forEach(node => { const span = document.createElement('span'); span.className = 'editable-fragment'; span.dataset.edit = ''; node.replaceWith(span); span.textContent = node.textContent; });
    });
  }
  const moveGroups = '[data-move],.slide-heading,.metric,.phase-item,.lesson,.shopping-frame,.conference-art';
  function validPosition(value) { return value && Number.isFinite(value.x) && Number.isFinite(value.y) && Math.abs(value.x) <= 3840 && Math.abs(value.y) <= 2160; }
  function getPosition(el) { const value = positions[el.dataset.moveKey]; return validPosition(value) ? value : { x: 0, y: 0 }; }
  function applyPosition(el) { const { x, y } = getPosition(el); el.style.translate = `${x}px ${y}px`; }
  function setPosition(el, x, y) {
    positions[el.dataset.moveKey] = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    applyPosition(el);
  }
  function selectElement(el) {
    selected?.classList.remove('move-selected');
    selected = el;
    selected?.classList.add('move-selected');
    elementSelect.value = selected?.dataset.moveKey || '';
    panel.querySelector('[data-action="reset-position"]').disabled = !selected;
  }
  function bindMovables(root, id) {
    const candidates = new Set();
    root.querySelectorAll(moveGroups).forEach(el => { if (!el.parentElement.closest(moveGroups)) candidates.add(el); });
    root.querySelectorAll('[data-edit]').forEach(el => {
      if (el.closest(moveGroups)) return;
      candidates.add(el.classList.contains('editable-fragment') ? el.closest('h1,h2,h3,p,a') || el : el);
    });
    const elements = Array.from(root.querySelectorAll('*')).filter(el => candidates.has(el));
    elementSelect.replaceChildren(new Option(tr('Wybierz na slajdzie lub z listy'), ''));
    selected = null;
    panel.querySelector('[data-action="reset-position"]').disabled = true;
    elements.forEach((el, index) => {
      el.dataset.moveKey = `${id}::move-${index}`;
      if (getComputedStyle(el).position === 'static') el.classList.add('movable-static');
      if (editing && moving) el.tabIndex = -1;
      const copy = el.getAttribute('alt') || Array.from(el.querySelectorAll('[data-edit]'), node => node.textContent).join(' ') || el.textContent;
      const label = (el.matches('.speech') ? tr('Dymek: ') : el.matches('img') ? tr('Grafika: ') : '') + copy.trim().replace(/\s+/g, ' ').slice(0, 58);
      elementSelect.append(new Option(label || `${tr('Element')} ${index + 1}`, el.dataset.moveKey));
      applyPosition(el);
    });
  }
  function bindSlide(root, id) {
    drag = null;
    editLeaves(root);
    root.querySelectorAll('[data-edit]').forEach((el, index) => {
      const key = `${copyPrefix(id)}::${index}`;
      el.dataset.copyKey = key;
      if (!originals.has(key)) originals.set(key, el.textContent);
      if (Object.hasOwn(overrides, key) && overrides[key] !== originals.get(key)) el.textContent = overrides[key];
      el.contentEditable = editing && !moving ? 'true' : 'false';
      el.spellcheck = editing && !moving;
      if (editing && !moving) el.setAttribute('aria-label', tr('Edytuj tekst'));
      else el.removeAttribute('aria-label');
      el.addEventListener('input', () => {
        overrides[key] = el.innerText.replaceAll('\r', '');
        persist();
        el.classList.toggle('text-overflow', el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4);
      });
      el.addEventListener('paste', event => {
        event.preventDefault();
        document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
      });
      el.addEventListener('click', event => { if (editing) event.preventDefault(); });
    });
    bindMovables(root, id);
    select.value = window.DECK_NAV ? window.DECK_NAV.getState().index : 0;
  }
  function syncMode() {
    document.body.classList.toggle('editing-text', editing);
    document.body.classList.toggle('moving-elements', editing && moving);
    panel.querySelector('[data-action="text"]').setAttribute('aria-pressed', String(!moving));
    panel.querySelector('[data-action="move"]').setAttribute('aria-pressed', String(moving));
    panel.querySelector('.editor-position-controls').hidden = !moving;
    panel.querySelector('.editor-hint').textContent = tr(moving
      ? 'Przeciągnij element. Strzałki przesuwają o 1 px, Shift + strzałka o 10 px.'
      : 'Kliknij tekst. Zmiany zapisują się w tej przeglądarce.');
    window.DECK_NAV.refresh();
  }
  function syncMinimized() {
    panel.classList.toggle('is-minimized', minimized);
    const button = panel.querySelector('[data-action="minimize"]');
    button.textContent = tr(minimized ? 'Rozwiń' : 'Zwiń');
    button.setAttribute('aria-expanded', String(!minimized));
  }
  function toggle() {
    editing = !editing;
    if (editing) minimized = false;
    panel.hidden = !editing;
    syncMinimized();
    syncMode();
    if (!editing) document.activeElement?.blur();
  }
  // Work in slide coordinates: the canvas itself is scaled to fit the window.
  function moveLimits(el) {
    const bounds = stage.querySelector('.slide').getBoundingClientRect();
    const scale = bounds.width / 1920;
    let clip = bounds;
    for (let parent = el.parentElement; parent && parent !== stage; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (/(hidden|clip)/.test(style.overflowX + style.overflowY)) { clip = parent.getBoundingClientRect(); break; }
    }
    const rect = el.getBoundingClientRect();
    const visible = 40 * scale;
    return {
      scale,
      minX: rect.width <= clip.width ? clip.left - rect.left : clip.left + visible - rect.right,
      maxX: rect.width <= clip.width ? clip.right - rect.right : clip.right - visible - rect.left,
      minY: rect.height <= clip.height ? clip.top - rect.top : clip.top + visible - rect.bottom,
      maxY: rect.height <= clip.height ? clip.bottom - rect.bottom : clip.bottom - visible - rect.top,
    };
  }
  const clamp = (value, min, max) => Math.max(Math.min(0, min), Math.min(Math.max(0, max), value));
  stage.addEventListener('pointerdown', event => {
    if (!editing || !moving || event.button !== 0) return;
    const el = event.target.closest('[data-move-key]');
    selectElement(el);
    if (!el) return;
    event.preventDefault();
    el.focus({ preventScroll: true });
    drag = { el, pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: { ...getPosition(el) }, ...moveLimits(el) };
    el.classList.add('move-dragging');
    el.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const dx = clamp(event.clientX - drag.x, drag.minX, drag.maxX) / drag.scale;
    const dy = clamp(event.clientY - drag.y, drag.minY, drag.maxY) / drag.scale;
    setPosition(drag.el, drag.start.x + dx, drag.start.y + dy);
  });
  function endDrag(cancel = false) {
    if (!drag) return;
    const current = drag;
    drag = null;
    if (cancel) setPosition(current.el, current.start.x, current.start.y);
    current.el.classList.remove('move-dragging');
    if (current.el.hasPointerCapture(current.pointerId)) current.el.releasePointerCapture(current.pointerId);
    persist();
  }
  stage.addEventListener('pointerup', () => endDrag());
  stage.addEventListener('pointercancel', () => endDrag(true));
  stage.addEventListener('lostpointercapture', () => endDrag(true));
  stage.addEventListener('dragstart', event => { if (editing && moving) event.preventDefault(); });
  stage.addEventListener('click', event => { if (editing && moving) { event.preventDefault(); event.stopPropagation(); } }, true);
  async function exportChanges() {
    const source = '// Editable slide text and positions. Generated by the presentation editor.\nwindow.DECK_EDITOR_OVERRIDES = ' + JSON.stringify({ version: 1, edition: edition.id, texts: overrides, positions }, null, 2) + ';\n';
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `text-overrides-${edition.id}.js`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('Wyeksportowano poprawki. Zapisz pobrany plik jako text-overrides.js obok index.html.');
  }
  function importChanges() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.js,.json';
    input.onchange = async () => {
      if (!input.files.length) return;
      try {
        const {texts, positions: importedPositions} = window.DECK_OVERRIDE_FORMAT.parse(await input.files[0].text(), edition.id);
        overrides = { ...overrides, ...texts };
        positions = { ...positions, ...importedPositions };
        persist(); window.DECK_NAV.refresh(); status('Zaimportowano teksty i pozycje.');
      } catch (error) { status(error.message === 'edition' ? 'Plik pochodzi z innej wersji prezentacji.' : 'Nieprawidłowy format tekstów lub pozycji.'); }
    };
    input.click();
  }
  panel.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'close') toggle();
    if (action === 'minimize') { minimized = !minimized; syncMinimized(); }
    if (action === 'text' || action === 'move') { moving = action === 'move'; syncMode(); }
    if (action === 'export') void exportChanges();
    if (action === 'pptx' || action === 'pptx-google') window.DECK_PPTX?.export({target: action === 'pptx-google' ? 'google' : 'powerpoint'}).catch(() => status('Eksport PPTX się nie udał. Szczegóły w konsoli przeglądarki.'));
    if (action === 'import') importChanges();
    if (action === 'reset-position' && selected) { setPosition(selected, 0, 0); persist(); }
    if (action === 'reset' || action === 'reset-layout') {
      const id = window.DECK_NAV.getState().id;
      if (action === 'reset') Object.keys(overrides).filter(k => k.startsWith(`${copyPrefix(id)}::`)).forEach(k => { overrides[k] = originals.get(k) || ''; });
      else Object.keys(positions).filter(k => k.startsWith(`${id}::`)).forEach(k => { positions[k] = { x: 0, y: 0 }; });
      persist(); window.DECK_NAV.refresh(); status(action === 'reset' ? 'Przywrócono teksty tego slajdu.' : 'Przywrócono układ tego slajdu.');
    }
  });
  document.addEventListener('keydown', event => {
    if (!editing) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); if (drag) endDrag(true); else toggle(); return; }
    if (!moving || !selected || event.target.closest('input,textarea,select,button') || event.ctrlKey || event.metaKey || event.altKey) return;
    const direction = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }[event.key];
    if (!direction) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const distance = event.shiftKey ? 10 : 1;
    const limits = moveLimits(selected);
    const start = getPosition(selected);
    setPosition(selected, start.x + clamp(direction[0] * distance * limits.scale, limits.minX, limits.maxX) / limits.scale, start.y + clamp(direction[1] * distance * limits.scale, limits.minY, limits.maxY) / limits.scale);
    persist();
  }, true);
  window.DECK_EDITOR = { bindSlide, toggle, isEditing: () => editing };
})();
