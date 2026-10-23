import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [320, 390, 640, 768, 1024, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto('http://127.0.0.1:4173/');
    await page.waitForSelector('[data-testid="menu-card-contador"]');
    if (width === 390 || width === 1280)
      await page.screenshot({
        path: `docs/qa/menu-${width}.png`,
        fullPage: true,
      });
    await page.goto('http://127.0.0.1:4173/jogo/novo/');
    await page.getByTestId('start-game').click();
    await page.getByTestId('player-0-total').waitFor();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    results.push({ width, screen: 'tokens', overflow });
    if (width === 390 || width === 1280)
      await page.screenshot({
        path: `docs/qa/tokens-${width}.png`,
        fullPage: true,
      });
    await page.goto('http://127.0.0.1:4173/cartas/');
    await page.getByTestId('card-azul-3').waitFor();
    results.push({
      width,
      screen: 'cards',
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
    await page.close();
  }
  await writeFile('docs/qa/responsive.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  if (results.some((r) => r.overflow)) process.exitCode = 1;
} finally {
  await browser.close();
}
