// Shared, edition-aware import rules. Parsing never executes an imported file.
window.DECK_OVERRIDE_FORMAT = {
  parse(source, edition) {
    const data = JSON.parse(source.replace(/^(?:\s*\/\/[^\n]*(?:\n|$))*/, '').replace(/^\s*window\.(?:DECK_TEXT_OVERRIDES|DECK_EDITOR_OVERRIDES)\s*=\s*/, '').replace(/;\s*$/, ''));
    const record = value => value && !Array.isArray(value) && typeof value === 'object';
    if (!record(data)) throw new Error('format');
    const combined = Object.hasOwn(data,'version');
    if (data.edition !== edition) throw new Error('edition');
    const texts = combined ? data.texts : data;
    const positions = combined ? data.positions : {};
    if ((combined && data.version !== 1) || !record(texts) || !record(positions)
      || Object.entries(texts).some(([key,value]) => !/^[a-z0-9-]+::\d+$/.test(key) || typeof value !== 'string')
      || Object.entries(positions).some(([key,value]) => !/^[a-z0-9-]+::move-\d+$/.test(key) || !value || !Number.isFinite(value.x) || !Number.isFinite(value.y) || Math.abs(value.x)>3840 || Math.abs(value.y)>2160)) throw new Error('format');
    return {texts, positions};
  }
};
