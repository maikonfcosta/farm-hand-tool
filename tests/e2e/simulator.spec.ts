import { test, expect } from '@playwright/test';

test('Solo simulator complete flow: menu access, bidding, playing trick, and scoring', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('menu-card-simulador').click();
  await expect(page).toHaveURL(/\/simulador\/?/);

  // Confirmação de cabeçalhos e placar
  await expect(
    page.getByRole('heading', { name: 'Simulador Solo' }),
  ).toBeVisible();
  await expect(page.getByText('Mac', { exact: true })).toBeVisible();
  await expect(page.getByText('Donald', { exact: true })).toBeVisible();

  // Rodada 1: Fase de Lances
  await expect(page.getByText('Fase de Lances')).toBeVisible();
  await page.getByTestId('bid-option-1').click();
  await page.getByTestId('confirm-bid-button').click();

  // Fase de Vazas: Na R1 o líder é o Mac
  await expect(page.getByText('Vaza 1 de 1')).toBeVisible();
  await expect(page.getByTestId('play-bot-turn-button')).toBeVisible();

  // Mac joga
  await page.getByTestId('play-bot-turn-button').click();

  // Donald joga
  await expect(page.getByTestId('play-bot-turn-button')).toBeVisible();
  await page.getByTestId('play-bot-turn-button').click();

  // Tira print da mesa com cartas jogadas e mão do jogador
  if (test.info().project.name === 'desktop') {
    await page.screenshot({ path: 'docs/images/simulador-desktop.png' });
  } else if (test.info().project.name === 'mobile') {
    await page.screenshot({ path: 'docs/images/simulador-mobile.png' });
  }

  // Vez do humano jogar sua carta
  const humanCardButton = page
    .locator('button[data-testid^="player-card-"]')
    .first();
  await expect(humanCardButton).toBeVisible();
  await humanCardButton.click();

  // Encerramento da rodada 1
  await expect(page.getByText('Encerramento da Rodada 1')).toBeVisible();
  await expect(page.getByTestId('advance-round-button')).toBeVisible();

  // Avança para rodada 2
  await page.getByTestId('advance-round-button').click();
  await expect(page.getByText('Rodada 2 de 6')).toBeVisible();
});
