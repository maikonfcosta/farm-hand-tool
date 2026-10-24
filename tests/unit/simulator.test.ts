import { describe, it, expect } from 'vitest';
import {
  ALL_CARDS,
  getRoundLeader,
  getTurnOrder,
  startSoloGame,
  setHumanBid,
  chooseBotCard,
  resolveTrick,
  playCard,
  advanceToNextRound,
  type Card,
  type PlayedCard,
} from '@/domain/simulator';

describe('Solo Simulator Domain', () => {
  it('deck has 21 unique cards across 6 suits and 3 copies of 1..7', () => {
    expect(ALL_CARDS).toHaveLength(21);
    const numbersCount: Record<number, number> = {};
    for (const card of ALL_CARDS) {
      numbersCount[card.number] = (numbersCount[card.number] || 0) + 1;
    }
    for (let n = 1; n <= 7; n++) {
      expect(numbersCount[n]).toBe(3);
    }
  });

  it('determines round leader correctly (R1..R6)', () => {
    expect(getRoundLeader(1)).toBe('mac');
    expect(getRoundLeader(2)).toBe('donald');
    expect(getRoundLeader(3)).toBe('human');
    expect(getRoundLeader(4)).toBe('mac');
    expect(getRoundLeader(5)).toBe('donald');
    expect(getRoundLeader(6)).toBe('human');
  });

  it('determines turn order in clockwise table cycle', () => {
    expect(getTurnOrder('human')).toEqual(['human', 'mac', 'donald']);
    expect(getTurnOrder('mac')).toEqual(['mac', 'donald', 'human']);
    expect(getTurnOrder('donald')).toEqual(['donald', 'human', 'mac']);
  });

  it('resolves tricks: highest value wins, identical numbers cancel out', () => {
    const c1: Card = { id: 'azul-4', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 4 };
    const c2: Card = { id: 'laranja-2', suitId: 'laranja', suitColor: '#f80', suitName: 'Laranja', number: 2 };
    const c3: Card = { id: 'menta-1', suitId: 'menta', suitColor: '#0f8', suitName: 'Menta', number: 1 };

    const played1: PlayedCard[] = [
      { playerId: 'mac', card: c1 },
      { playerId: 'donald', card: c2 },
      { playerId: 'human', card: c3 },
    ];
    // 4 é o maior
    expect(resolveTrick(played1)).toBe('mac');

    // Teste de anulação: dois 4 se anulam, o 2 vence
    const c4_dupe: Card = { id: 'amarelo-4', suitId: 'amarelo', suitColor: '#ff0', suitName: 'Amarelo', number: 4 };
    const playedTied: PlayedCard[] = [
      { playerId: 'mac', card: c1 }, // 4
      { playerId: 'donald', card: c4_dupe }, // 4 (anula com mac)
      { playerId: 'human', card: c2 }, // 2
    ];
    expect(resolveTrick(playedTied)).toBe('human');

    // Teste onde todos se anulam (ex: 3 cartas de mesmo número)
    const c4_third: Card = { id: 'menta-4', suitId: 'menta', suitColor: '#0f8', suitName: 'Menta', number: 4 };
    const playedAllTied: PlayedCard[] = [
      { playerId: 'mac', card: c1 },
      { playerId: 'donald', card: c4_dupe },
      { playerId: 'human', card: c4_third },
    ];
    expect(resolveTrick(playedAllTied)).toBeNull();
  });

  it('bot follows lead suit when possible, else plays top card', () => {
    const hand: Card[] = [
      { id: 'laranja-2', suitId: 'laranja', suitColor: '#f80', suitName: 'Laranja', number: 2 },
      { id: 'azul-5', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 5 },
      { id: 'azul-1', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 1 },
    ];

    // Se é líder (sem leadSuitId), joga o topo (índice 0)
    expect(chooseBotCard(hand).id).toBe('laranja-2');

    // Se naipe pedido for azul, joga o primeiro azul (topo do naipe: azul-5)
    expect(chooseBotCard(hand, 'azul').id).toBe('azul-5');

    // Se naipe pedido for menta (não tem), joga o topo da mão (laranja-2)
    expect(chooseBotCard(hand, 'menta').id).toBe('laranja-2');
  });

  it('simulates a complete round from bidding to scoring', () => {
    const state = startSoloGame('Maikon');
    expect(state.currentRound).toBe(1);
    expect(state.currentRoundState.phase).toBe('bidding');
    expect(state.currentRoundState.bids.mac).toBe(0); // R1 Mac bid = 0
    expect(state.currentRoundState.bids.donald).toBe(1); // R1 Donald bid = 1

    // Humano dá lance 1
    const withBid = setHumanBid(state, 1);
    expect(withBid.currentRoundState.phase).toBe('playing');
    expect(withBid.currentRoundState.bids.human).toBe(1);

    // Em R1, Mac é líder
    expect(withBid.currentRoundState.currentTurnPlayerId).toBe('mac');

    // Mac joga
    const afterMac = playCard(withBid);
    expect(afterMac.currentRoundState.currentTrickCards).toHaveLength(1);
    expect(afterMac.currentRoundState.currentTurnPlayerId).toBe('donald');

    // Donald joga
    const afterDonald = playCard(afterMac);
    expect(afterDonald.currentRoundState.currentTrickCards).toHaveLength(2);
    expect(afterDonald.currentRoundState.currentTurnPlayerId).toBe('human');

    // Humano joga sua única carta
    const humanCard = afterDonald.currentRoundState.playerHand[0];
    const afterHuman = playCard(afterDonald, humanCard.id);

    // Vaza resolvida e rodada 1 concluída
    expect(afterHuman.currentRoundState.phase).toBe('round_end');
    expect(afterHuman.roundHistory).toHaveLength(1);

    // Avança para rodada 2
    const round2State = advanceToNextRound(afterHuman);
    expect(round2State.currentRound).toBe(2);
    expect(round2State.currentRoundState.round).toBe(2);
    expect(round2State.currentRoundState.playerHand).toHaveLength(2);
  });

  it('validates must-follow suit and handles multi-trick rounds and game completion', () => {
    // Teste de validação de naipe na mão do humano
    const state = startSoloGame();
    // Força mão do humano para teste controlado
    const blueCard: Card = { id: 'azul-3', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 3 };
    const mintCard: Card = { id: 'menta-5', suitId: 'menta', suitColor: '#0f8', suitName: 'Menta', number: 5 };
    const macCard: Card = { id: 'azul-7', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 7 };

    const customRound = {
      ...state.currentRoundState,
      round: 2 as const,
      phase: 'playing' as const,
      playerHand: [blueCard, mintCard],
      trickLeadPlayerId: 'mac' as const,
      currentTurnPlayerId: 'human' as const,
      currentTrickCards: [{ playerId: 'mac' as const, card: macCard }],
    };
    const playingState = { ...state, currentRoundState: customRound };

    // Humano tenta jogar menta tendo azul (deve bloquear e retornar mesmo state)
    const blocked = playCard(playingState, mintCard.id);
    expect(blocked).toBe(playingState);

    // Humano joga azul (válido)
    const allowed = playCard(playingState, blueCard.id);
    expect(allowed.currentRoundState.playerHand).toHaveLength(1);

    // Teste de guardas quando phase inválida ou cardId ausente
    expect(playCard(state)).toBe(state); // phase is 'bidding', not playing
    expect(playCard(playingState)).toBe(playingState); // human turn without cardId
    expect(playCard(playingState, 'card-inexistente')).toBe(playingState);

    // Teste de encerramento em round 6
    const r6State = {
      ...state,
      currentRound: 6 as const,
      currentRoundState: {
        ...state.currentRoundState,
        round: 6 as const,
        phase: 'round_end' as const,
      },
    };
    const finishedGame = advanceToNextRound(r6State);
    expect(finishedGame.finished).toBe(true);
  });

  it('progresses tricks inside a multi-trick round', () => {
    // Inicia rodada 2 onde há 2 vazas
    const game = startSoloGame();
    const withBid = setHumanBid(game, 1);
    // Avança para rodada 2 artificialmente com bids
    const r2Game = {
      ...withBid,
      currentRound: 2 as const,
      currentRoundState: {
        ...withBid.currentRoundState,
        round: 2 as const,
        phase: 'playing' as const,
        currentTrickNumber: 1,
        trickLeadPlayerId: 'donald' as const,
        currentTurnPlayerId: 'donald' as const,
        donaldHand: [{ id: 'azul-1', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 1 }],
        macHand: [{ id: 'azul-2', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 2 }],
        playerHand: [{ id: 'azul-3', suitId: 'azul', suitColor: '#00f', suitName: 'Azul', number: 3 }],
      },
    };
    // Turn order for donald is: donald -> human -> mac
    // Donald joga
    const s1 = playCard(r2Game);
    // Humano joga
    const s2 = playCard(s1, 'azul-3');
    // Mac joga
    const s3 = playCard(s2);
    // Deve transicionar para vaza 2 (linha 321 coberta), não round_end
    expect(s3.currentRoundState.currentTrickNumber).toBe(2);
    expect(s3.currentRoundState.phase).toBe('playing');
  });
});
