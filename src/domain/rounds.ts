import type { GameState, RoundNumber } from './types';
export const cardsPerPlayer = (r: RoundNumber, n: number) =>
  n <= 3 ? r : n === 4 ? Math.min(r, 5) : Math.min(r, 4);
export const unusedCards = (r: RoundNumber, n: number) =>
  21 - n * cardsPerPlayer(r, n);
const dealerIndex = (g: GameState, r: RoundNumber) =>
  (g.players.findIndex((p) => p.id === g.firstDealerId) + r - 1) %
  g.players.length;
export const dealerId = (g: GameState, r: RoundNumber) =>
  g.mode === 'solo' ? null : g.players[dealerIndex(g, r)].id;
export const leaderId = (g: GameState, r: RoundNumber) =>
  g.mode === 'solo'
    ? ['mac', 'donald', g.players[0].id][(r - 1) % 3]
    : g.players[(dealerIndex(g, r) + 1) % g.players.length].id;
