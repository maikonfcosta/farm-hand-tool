import { describe, it, expect } from 'vitest';
import { totalPoints, clampToken } from '@/domain/tokens';
import { scoreRound, pointsToTokens } from '@/domain/scoring';
import {
  cardsPerPlayer,
  unusedCards,
  dealerId,
  leaderId,
} from '@/domain/rounds';
import { dummyBid } from '@/domain/dummies';
import { rankPlayers } from '@/domain/ranking';
import { SUITS, cardKeys } from '@/domain/cards';
import {
  createGame,
  applyRound,
  undoLastRound,
  startTiebreak,
  setTokens,
  setDraft,
} from '@/domain/game';
import type { RoundNumber } from '@/domain/types';
const rounds = [1, 2, 3, 4, 5, 6] as RoundNumber[];
const config = {
  mode: 'standard' as const,
  names: ['J1', 'J2', 'J3'],
  firstDealerIndex: 0,
};
describe('tokens and scoring', () => {
  it('calculates positive and negative totals', () => {
    expect(totalPoints({ saco: 2, espiga: 3, rato: 4 })).toBe(9);
    expect(totalPoints({ saco: 0, espiga: 0, rato: 3 })).toBe(-3);
    expect([clampToken(-1), clampToken(100), clampToken(4)]).toEqual([
      0, 99, 4,
    ]);
  });
  it.each([
    [3, 3, 4],
    [2, 0, -2],
    [0, 1, -1],
    [0, 0, 4],
  ])('official R4 example %s %s', (bid, tricks, result) =>
    expect(scoreRound(4, bid, tricks)).toBe(result),
  );
  it('penalizes both directions', () => {
    expect(scoreRound(6, 1, 3)).toBe(-2);
    expect(scoreRound(6, 3, 1)).toBe(-2);
  });
  it.each([
    [6, 1, 1, 0],
    [4, 0, 4, 0],
    [-3, 0, 0, 3],
    [0, 0, 0, 0],
    [11, 2, 1, 0],
  ])('converts %s to tokens', (p, saco, espiga, rato) =>
    expect(pointsToTokens(p)).toEqual({ saco, espiga, rato }),
  );
});
describe('rounds and cards', () => {
  it.each([
    [5, 3, 5],
    [6, 3, 6],
    [5, 4, 5],
    [6, 4, 5],
    [5, 5, 4],
    [6, 5, 4],
  ])('cards R%s / %s', (r, n, c) =>
    expect(cardsPerPlayer(r as RoundNumber, n)).toBe(c),
  );
  it.each([
    [1, 5, 16],
    [6, 3, 3],
    [6, 4, 1],
    [5, 5, 1],
  ])('unused R%s / %s', (r, n, c) =>
    expect(unusedCards(r as RoundNumber, n)).toBe(c),
  );
  it('uses fixed dummy bids', () => {
    expect(rounds.map((r) => dummyBid('mac', r))).toEqual([0, 1, 0, 2, 0, 3]);
    expect(rounds.map((r) => dummyBid('donald', r))).toEqual([
      1, 0, 1, 0, 2, 0,
    ]);
  });
  it('rotates seats with Mac', () => {
    const g = createGame({ ...config, names: ['J1', 'J2'] });
    const names = (id: string | null) =>
      g.players.find((p) => p.id === id)?.name;
    expect(rounds.map((r) => names(dealerId(g, r)))).toEqual([
      'J1',
      'J2',
      'Mac',
      'J1',
      'J2',
      'Mac',
    ]);
    expect(rounds.map((r) => names(leaderId(g, r)))).toEqual([
      'J2',
      'Mac',
      'J1',
      'J2',
      'Mac',
      'J1',
    ]);
  });
  it('rotates four humans and respects first dealer', () => {
    const g = createGame({ ...config, names: ['P1', 'P2', 'P3', 'P4'] });
    expect(
      rounds.map((r) => g.players.find((p) => p.id === dealerId(g, r))?.name),
    ).toEqual(['P1', 'P2', 'P3', 'P4', 'P1', 'P2']);
    expect(
      rounds.map((r) => g.players.find((p) => p.id === leaderId(g, r))?.name),
    ).toEqual(['P2', 'P3', 'P4', 'P1', 'P2', 'P3']);
    const other = createGame({ ...config, firstDealerIndex: 2 });
    expect(dealerId(other, 1)).toBe(other.players[2].id);
  });
  it('solo has no dealer', () => {
    const g = createGame({ mode: 'solo', names: ['Você'] });
    expect(rounds.map((r) => dealerId(g, r))).toEqual(Array(6).fill(null));
    expect(
      rounds.map((r) => g.players.find((p) => p.id === leaderId(g, r))?.name),
    ).toEqual(['Mac', 'Donald', 'Você', 'Mac', 'Donald', 'Você']);
  });
  it('has exactly three of each number and 21 keys', () => {
    expect(cardKeys).toHaveLength(21);
    for (let n = 1; n <= 7; n++)
      expect(SUITS.filter((s) => s.numbers.includes(n))).toHaveLength(3);
  });
});
describe('game transitions', () => {
  it('creates defaults and dummy drafts', () => {
    expect(createGame({ mode: 'solo', names: [''] }).players[0].name).toBe(
      'Você',
    );
    expect(createGame({ ...config, names: ['', ''] }).players[0].name).toBe(
      'Jogador 1',
    );
    const g = createGame({ mode: 'solo', names: ['Você'] });
    expect(g.draft.donald.bid).toBe(1);
  });
  it('ignores token bounds and invalid players', () => {
    let g = createGame(config);
    const id = g.players[0].id;
    expect(setTokens(g, id, 'espiga', -1)).toBe(g);
    expect(setTokens(g, 'missing', 'espiga', 1)).toBe(g);
    g = {
      ...g,
      players: g.players.map((p) => ({
        ...p,
        tokens: { saco: 0, espiga: 99, rato: 0 },
      })),
    };
    expect(setTokens(g, id, 'espiga', 1)).toBe(g);
    expect(setTokens(g, id, 'rato', 1).players[0].tokens.rato).toBe(1);
  });
  it('validates draft and locks dummy bids', () => {
    const g = createGame({ ...config, names: ['A', 'B'] });
    expect(setDraft(g, 'mac', 'bid', 1)).toBe(g);
    expect(setDraft(g, 'missing', 'bid', 1)).toBe(g);
    expect(setDraft(g, g.players[0].id, 'bid', 2)).toBe(g);
    expect(setDraft(g, g.players[0].id, 'tricks', -1)).toBe(g);
    expect(setDraft(g, g.players[0].id, 'bid', NaN)).toBe(g);
  });
  it('applies official R1 and restores draft on undo', () => {
    let g = createGame(config);
    const id = g.players[0].id;
    g = setDraft(setDraft(g, id, 'bid', 1), id, 'tricks', 1);
    const before = g;
    g = applyRound(g);
    expect(g.players.map((p) => p.tokens.espiga)).toEqual([1, 1, 1]);
    expect(g.currentRound).toBe(2);
    expect(undoLastRound(g)).toEqual(before);
    expect(undoLastRound(before)).toBe(before);
  });
  it('rejects excess tricks and finished edits', () => {
    let g = createGame(config);
    for (const p of g.players.slice(0, 2)) g = setDraft(g, p.id, 'tricks', 1);
    expect(applyRound(g)).toBe(g);
    g = { ...g, finished: true };
    expect(applyRound(g)).toBe(g);
    expect(setDraft(g, g.players[0].id, 'bid', 1)).toBe(g);
  });
  it('finishes and replays ties without losing scores', () => {
    let g = createGame(config);
    for (let i = 0; i < 6; i++) g = applyRound(g);
    expect(g.finished).toBe(true);
    expect(g.players.map((p) => totalPoints(p.tokens))).toEqual([21, 21, 21]);
    expect(startTiebreak({ ...g, finished: false })).toEqual({
      ...g,
      finished: false,
    });
    const extra = startTiebreak(g);
    expect(extra).toMatchObject({
      currentRound: 6,
      tiebreakCount: 1,
      finished: false,
    });
    expect(dealerId(extra, 6)).toBe(dealerId(g, 6));
    expect(applyRound(extra).players.map((p) => totalPoints(p.tokens))).toEqual(
      [27, 27, 27],
    );
    expect(undoLastRound(applyRound(extra))).toEqual(extra);
  });
  it('does not start a tiebreak with one winner', () => {
    let g = createGame(config);
    g = {
      ...g,
      finished: true,
      players: g.players.map((p, i) => ({
        ...p,
        tokens: { saco: 0, espiga: i, rato: 0 },
      })),
    };
    expect(startTiebreak(g)).toBe(g);
    expect(rankPlayers(g.players).map((p) => p.position)).toEqual([1, 2, 3]);
    expect(rankPlayers([])).toEqual([]);
  });
  it('shares ranks and stores actual clamped delta for undo', () => {
    const g = createGame(config);
    const players = g.players.map((p, i) => ({
      ...p,
      tokens: { saco: 0, espiga: i === 2 ? 7 : 10, rato: 0 },
    }));
    expect(rankPlayers(players).map((p) => p.position)).toEqual([1, 1, 3]);
    const full = {
      ...g,
      players: g.players.map((p) => ({
        ...p,
        tokens: { saco: 0, espiga: 99, rato: 0 },
      })),
    };
    expect(undoLastRound(applyRound(full))).toEqual(full);
  });
});
