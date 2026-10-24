import { test, expect } from '@playwright/test';

test('visual guide opens illustrations, restores focus and preserves seen cards', async ({
  page,
}) => {
  await page.goto('/cartas/');
  await page.getByTestId('card-azul-3').click();
  await page
    .getByRole('link', { name: 'Guia visual: símbolos e cartas de apoio' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Guia visual do Farm Hand' }),
  ).toBeVisible();
  const enlarge = page.getByRole('button', {
    name: 'Ampliar: Frente e verso de uma carta',
  });
  await enlarge.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(enlarge).toBeFocused();
  await page
    .getByRole('button', { name: 'Ampliar: Carta de apoio e pontuação' })
    .click();
  await expect(page.getByRole('dialog')).toContainText(
    'Diferença absoluta × −1 ponto',
  );
  await page.getByRole('button', { name: 'Fechar ilustração' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Seções do guia' })
    .getByRole('link', { name: 'Tokens', exact: true })
    .click();
  await expect(page).toHaveURL(/#tokens$/);
  await expect(page.getByText('= 12 pontos', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole('navigation', { name: 'Menu', exact: true })
    .getByRole('link', { name: 'Cartas', exact: true })
    .click();
  await expect(page.getByTestId('card-azul-3')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('token help is reachable from a game without changing the score', async ({
  page,
}) => {
  await page.goto('/jogo/novo/');
  await page.getByTestId('start-game').click();
  await page.getByTestId('player-0-token-saco-plus').click();
  await page.getByRole('link', { name: 'Entenda os tokens' }).click();
  await expect(page).toHaveURL(/\/guia\/?#tokens$/);
  await expect(
    page.getByRole('heading', { name: 'Tokens: quanto vale cada um?' }),
  ).toBeVisible();
  await page.goto('/jogo/');
  await expect(page.getByTestId('player-0-total')).toHaveText('5 pts');
});
