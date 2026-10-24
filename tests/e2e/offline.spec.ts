import { test, expect } from '@playwright/test';
test('E13 offline reload and unvisited routes', async ({
  page,
  context,
}, info) => {
  test.skip(
    info.project.name !== 'mobile',
    'Offline acceptance runs at mobile size.',
  );
  await page.goto('/jogo/novo/');
  await page.getByTestId('start-game').click();
  await page.getByTestId('player-0-token-saco-plus').click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => resolve(),
          { once: true },
        ),
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
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Cartas', exact: true })
    .click();
  await page.getByTestId('card-azul-3').click();
  await expect(page.getByText('Vistas: 1 de 21')).toBeVisible();
  await page.goto('/guia/');
  await expect(
    page.getByRole('heading', { name: 'Guia visual do Farm Hand' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Ampliar: Carta de apoio e pontuação' })
    .click();
  await expect(page.getByRole('dialog')).toContainText(
    'Número da rodada × 1 ponto',
  );
  await page.getByRole('button', { name: 'Fechar ilustração' }).click();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Seis símbolos, seis naipes' }),
  ).toBeVisible();
  await page.goto('/ajustes/');
  await expect(
    page.getByRole('button', { name: 'Apagar todos os dados' }),
  ).toBeVisible();
});
test('settings supported controls and wipe confirmation', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: () => true,
      configurable: true,
    });
  });
  await page.goto('/jogo/novo/');
  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('player-0-total')).toBeVisible();
  await page.goto('/ajustes/');
  const vibrate = page.getByRole('switch', { name: 'Vibração ao tocar' });
  await expect(vibrate).toBeChecked();
  await vibrate.uncheck();
  await page.reload();
  await expect(vibrate).not.toBeChecked();
  await page.getByRole('button', { name: 'Apagar todos os dados' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cancelar' })
    .click();
  await page.getByRole('button', { name: 'Apagar todos os dados' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirmar' })
    .click();
  await expect(page.getByTestId('menu-card-contador')).toBeVisible();
  await page.getByTestId('menu-card-contador').click();
  await expect(page.getByTestId('start-game')).toBeVisible();
});
