import { test, expect, type Page } from '@playwright/test';
async function start(page: Page, solo = false) {
  await page.goto('/jogo/novo/');
  if (solo)
    await page.getByRole('button', { name: 'Solitário', exact: true }).click();
  await page.getByTestId('start-game').click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Rodada', exact: true })
    .click();
}
async function apply(page: Page) {
  await page.getByTestId('apply-round').click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirmar', exact: true })
    .click();
}
test('E8 exact bids apply points', async ({ page }) => {
  await start(page);
  await page.getByTestId('round-0-bid-plus').click();
  await page.getByTestId('round-0-tricks-plus').click();
  await apply(page);
  await expect(
    page.getByText('Rodada 2 de 6', { exact: false }).first(),
  ).toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Tokens', exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await expect(page.getByTestId(`player-${i}-total`)).toHaveText('1 pts');
});
test('E9 excess tricks blocks apply', async ({ page }) => {
  await start(page);
  await page.getByTestId('round-0-tricks-plus').click();
  await page.getByTestId('round-1-tricks-plus').click();
  await expect(page.getByTestId('apply-round')).toBeDisabled();
  await expect(
    page.getByText('A soma das vazas não pode passar de 1.'),
  ).toBeVisible();
});
test('E10 undo restores tokens and draft', async ({ page }) => {
  await start(page);
  await page.getByTestId('round-0-bid-plus').click();
  await page.getByTestId('round-0-tricks-plus').click();
  await apply(page);
  await page.getByTestId('undo-round').click();
  await expect(
    page.getByText('Rodada 1 de 6', { exact: false }).first(),
  ).toBeVisible();
  await expect(page.getByTestId('round-0-bid-plus')).toBeDisabled();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Tokens', exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await expect(page.getByTestId(`player-${i}-total`)).toHaveText('0 pts');
});
test('E11 solo dummy bids locked', async ({ page }) => {
  await start(page, true);
  await expect(page.getByText('Começa: Mac', { exact: false })).toBeVisible();
  await expect(page.getByTestId('round-2-bid-plus')).toBeDisabled();
  await expect(page.getByTestId('round-2-bid-minus')).toBeDisabled();
  await expect(page.getByTestId('round-player-2')).toContainText('Donald');
  await expect(
    page.getByTestId('round-player-2').locator('output').first(),
  ).toHaveText('1');
});
test('E12 six rounds tie then tiebreak', async ({ page }) => {
  await start(page);
  for (let r = 1; r <= 6; r++) {
    await expect(
      page.getByText(`Rodada ${r} de 6`, { exact: false }).first(),
    ).toBeVisible();
    await apply(page);
  }
  await expect(page).toHaveURL(/\/fim\/?$/);
  await expect(
    page.getByText('Empate: Jogador 1 e Jogador 2 e Jogador 3'),
  ).toBeVisible();
  await expect(page.getByText('21 pts', { exact: true })).toHaveCount(3);
  await page
    .getByRole('button', { name: 'Rejogar rodada 6 (desempate)' })
    .click();
  await expect(
    page.getByText('Rodada 6 · Desempate #1', { exact: false }).first(),
  ).toBeVisible();
});
