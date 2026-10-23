import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const origin = process.argv[2];
if (!origin?.startsWith('https://'))
  throw new Error('Pass the production HTTPS URL.');
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const statuses = {};
  for (const route of [
    '/',
    '/jogo/',
    '/jogo/novo/',
    '/rodada/',
    '/cartas/',
    '/regras/',
    '/ajustes/',
    '/fim/',
    '/manifest.webmanifest',
    '/sw.js',
    '/precache.json',
  ]) {
    const response = await context.request.get(`${origin}${route}`);
    statuses[route] = response.status();
    if (response.status() !== 200)
      throw new Error(`${route}: ${response.status()}`);
  }
  await page.goto(origin);
  await expect(page.locator('[data-testid^="menu-card-"]')).toHaveCount(6);
  await page.getByTestId('menu-card-contador').click();
  await page.getByTestId('start-game').click();
  await page.getByTestId('player-0-token-saco-plus').click();
  await expect(page.getByTestId('player-0-total')).toHaveText('5 pts');
  await expect(
    page.getByTestId('player-0').locator('svg[role="img"]'),
  ).toHaveCount(3);
  await page.reload();
  await expect(page.getByTestId('player-0-total')).toHaveText('5 pts');
  await page.evaluate(async () => {
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Service worker activation timed out')),
          30000,
        ),
      ),
    ]);
    if (!navigator.serviceWorker.controller)
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('player-0-total')).toHaveText('5 pts');
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Regras', exact: true })
    .click();
  await expect(page.getByRole('searchbox')).toBeVisible();
  const result = {
    origin,
    statuses,
    menu: true,
    counters: true,
    persistence: true,
    svgFallback: true,
    offline: true,
    checkedAt: new Date().toISOString(),
  };
  await writeFile('docs/qa/deploy-smoke.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
