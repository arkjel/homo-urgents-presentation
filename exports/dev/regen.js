async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.clearBrowserCache');
  await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
  await page.goto('http://127.0.0.1:8765/index.html?v=' + Date.now() + '#prosze-czekac');
  await page.waitForTimeout(600);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const waiting = page.waitForEvent('download', {timeout: 180000});
  const started = Date.now();
  await page.evaluate(() => { window.DECK_PPTX.export(); });
  const download = await waiting;
  await download.saveAs('/Users/ajelonek/Desktop/homo-urgents-presentation/exports/Homo-Urgens.pptx');
  await page.evaluate(async () => { await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'exports/dev/preview.js'; s.onload = res; s.onerror = rej; document.head.append(s); }); });
  return {seconds: (Date.now() - started) / 1000, errors};
}
