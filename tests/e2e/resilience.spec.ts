import { test, expect } from '@playwright/test';
test('protected routes without a game redirect to setup', async ({ page }) => {
  for (const route of ['/jogo/', '/rodada/', '/fim/']) {
    await page.goto(route);
    await expect(page.getByTestId('start-game')).toBeVisible();
  }
});
test('corrupt local JSON recovers with visible notice', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('farmhand-tracker:v1', '{broken'),
  );
  await page.goto('/');
  await expect(
    page.getByText(
      'Não foi possível recuperar os dados locais. Verifique as permissões de armazenamento do navegador.',
    ),
  ).toBeVisible();
  await expect(page.getByTestId('menu-card-contador')).toBeVisible();
});
test('applying a round clears seen cards', async ({ page }) => {
  await page.goto('/jogo/novo/');
  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('player-0-total')).toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Cartas', exact: true })
    .click();
  await page.getByTestId('card-azul-3').click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Rodada', exact: true })
    .click();
  await page.getByTestId('apply-round').click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirmar' })
    .click();
  await expect(
    page.getByText('Rodada 2 de 6', { exact: false }).first(),
  ).toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Cartas', exact: true })
    .click();
  await expect(page.getByText('Vistas: 0 de 21')).toBeVisible();
});
