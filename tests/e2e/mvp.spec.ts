import { test, expect, type Page } from '@playwright/test';
async function start(page: Page) {
  await page.goto('/jogo/novo/');
  await page.getByTestId('start-game').click();
  await expect(page).toHaveURL(/\/jogo\/?$/);
}
test('E1 menu and setup', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid^="menu-card-"]')).toHaveCount(7);
  await page.getByTestId('menu-card-contador').click();
  await expect(page).toHaveURL(/\/jogo\/novo\/?$/);
});
test('E2 player bounds and Mac', async ({ page }) => {
  await page.goto('/jogo/novo/');
  await page.getByTestId('players-minus').click();
  await expect(page.getByTestId('players-minus')).toBeDisabled();
  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('player-2')).toContainText('Mac');
  await page.goto('/jogo/novo/');
  for (let i = 0; i < 2; i++) await page.getByTestId('players-plus').click();
  await expect(page.getByTestId('players-plus')).toBeDisabled();
  await page.getByTestId('start-game').click();
  await page.getByRole('button', { name: 'Substituir', exact: true }).click();
  await expect(page.getByTestId('player-4')).toBeVisible();
});
test('E3 duplicate names', async ({ page }) => {
  await page.goto('/jogo/novo/');
  await page.getByPlaceholder('Jogador 1').fill('Ana');
  await page.getByPlaceholder('Jogador 2').fill('ana');
  await expect(
    page.getByText('Os nomes precisam ser diferentes.'),
  ).toBeVisible();
  await expect(page.getByTestId('start-game')).toBeDisabled();
});
test('E4 tokens and lower bound', async ({ page }) => {
  await start(page);
  await expect(page.getByTestId('player-0-token-rato-minus')).toBeDisabled();
  for (let i = 0; i < 3; i++)
    await page.getByTestId('player-0-token-espiga-plus').click();
  await page.getByTestId('player-0-token-saco-plus').click();
  await page.getByTestId('player-0-token-rato-plus').click();
  await expect(page.getByTestId('player-0-total')).toHaveText('7 pts');
});
test('E5 reload persistence', async ({ page }) => {
  await start(page);
  await page.getByTestId('player-0-token-saco-plus').click();
  await page.reload();
  await expect(page.getByTestId('player-0-total')).toHaveText('5 pts');
});
test('fallback images and dialog focus', async ({ page }) => {
  await page.route('**/assets/tokens/*.png', (route) => route.abort());
  await start(page);
  await expect(
    page.getByTestId('player-0').getByRole('img', { name: 'Saco de 5 pontos' }),
  ).toBeVisible();
  await expect(
    page.getByTestId('player-0').locator('svg[role="img"]'),
  ).toHaveCount(3);
  await page
    .getByTestId('player-0')
    .getByRole('button', { name: 'Zerar', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
