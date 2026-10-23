import { beforeEach, it, expect } from 'vitest';
import { useGameStore, defaults } from '@/store/gameStore';
beforeEach(() => useGameStore.setState({ ...defaults(), hydrated: true }));
it('resets, renames and validates names', () => {
  const s = useGameStore.getState();
  s.startGame({ mode: 'standard', names: ['A', 'B', 'C'] });
  const id = useGameStore.getState().game!.players[0].id;
  s.renamePlayer(id, 'B');
  expect(useGameStore.getState().game!.players[0].name).toBe('A');
  s.renamePlayer(id, 'D');
  s.setTokens(id, 'espiga', 1);
  expect(useGameStore.getState().game!.players[0]).toMatchObject({
    name: 'D',
    tokens: { espiga: 1 },
  });
  s.resetPlayerTokens(id);
  expect(useGameStore.getState().game!.players[0].tokens.espiga).toBe(0);
  s.setTokens(id, 'saco', 1);
  s.resetAllTokens();
  expect(useGameStore.getState().game!.players[0].tokens.saco).toBe(0);
});
it('clears seen cards only when applying valid round', () => {
  const s = useGameStore.getState();
  s.startGame({ mode: 'standard', names: ['A', 'B', 'C'] });
  s.toggleSeenCard('azul-3');
  s.toggleSeenCard('invalid');
  expect(useGameStore.getState().seenCards).toEqual(['azul-3']);
  s.applyRound();
  expect(useGameStore.getState().seenCards).toEqual([]);
  s.undoLastRound();
  expect(useGameStore.getState().game!.currentRound).toBe(1);
  s.setSetting('vibrate', false);
  s.finishGame();
  expect(useGameStore.getState().game!.finished).toBe(true);
  s.startTiebreak();
  expect(useGameStore.getState().game!.tiebreakCount).toBe(1);
  s.clearAllData();
  expect(useGameStore.getState()).toMatchObject(defaults());
});
