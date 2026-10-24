import { SUITS } from './cards';
import { dummyBid } from './dummies';
import { scoreRound, pointsToTokens } from './scoring';
import { clampToken, emptyTokens } from './tokens';
import type { RoundNumber, TokenType } from './types';

export interface Card {
  id: string; // e.g. "azul-3"
  suitId: string;
  suitColor: string;
  suitName: string;
  number: number;
}

export type SoloPlayerId = 'human' | 'mac' | 'donald';

export interface PlayedCard {
  playerId: SoloPlayerId;
  card: Card;
}

export interface TrickResult {
  trickNumber: number;
  leadPlayerId: SoloPlayerId;
  leadSuitId: string;
  played: PlayedCard[];
  winnerId: SoloPlayerId | null; // null se todas empatarem/anularem
}

export interface SoloRoundState {
  round: RoundNumber;
  playerHand: Card[]; // mão do jogador humano aberta
  macHand: Card[]; // cartas de Mac (ordem importa: índice 0 é topo)
  donaldHand: Card[]; // cartas de Donald (ordem importa: índice 0 é topo)
  unplayedCards: Card[]; // cartas fora da rodada
  bids: Record<SoloPlayerId, number>;
  tricksWon: Record<SoloPlayerId, number>;
  currentTrickNumber: number; // 1 até R
  trickLeadPlayerId: SoloPlayerId;
  currentTurnPlayerId: SoloPlayerId;
  currentTrickCards: PlayedCard[];
  completedTricks: TrickResult[];
  phase: 'bidding' | 'playing' | 'round_end';
  roundPoints: Record<SoloPlayerId, number>;
}

export interface SoloGameState {
  currentRound: RoundNumber;
  playerName: string;
  tokens: Record<SoloPlayerId, Record<TokenType, number>>;
  roundHistory: {
    round: RoundNumber;
    bids: Record<SoloPlayerId, number>;
    tricksWon: Record<SoloPlayerId, number>;
    points: Record<SoloPlayerId, number>;
  }[];
  currentRoundState: SoloRoundState;
  finished: boolean;
}

export const ALL_CARDS: Card[] = SUITS.flatMap((s) =>
  s.numbers.map((n) => ({
    id: `${s.id}-${n}`,
    suitId: s.id,
    suitColor: s.color,
    suitName: s.id.charAt(0).toUpperCase() + s.id.slice(1),
    number: n,
  })),
);

// Shuffle array com RNG puro ou injetado
export function shuffleCards(
  cards: Card[] = ALL_CARDS,
  rng: () => number = Math.random,
): Card[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRoundLeader(r: RoundNumber): SoloPlayerId {
  // R1, R4: Mac
  // R2, R5: Donald
  // R3, R6: Human
  return (['mac', 'donald', 'human'] as const)[(r - 1) % 3];
}

export function getTurnOrder(lead: SoloPlayerId): SoloPlayerId[] {
  // Ordem de jogo física: Você (human) -> Mac (à sua esquerda) -> Donald (à direita/terceiro)
  // Sentido horário: Human -> Mac -> Donald -> Human...
  const cycle: SoloPlayerId[] = ['human', 'mac', 'donald'];
  const startIdx = cycle.indexOf(lead);
  return [
    cycle[startIdx],
    cycle[(startIdx + 1) % 3],
    cycle[(startIdx + 2) % 3],
  ];
}

export function setupSoloRound(
  round: RoundNumber,
  shuffledDeck: Card[] = shuffleCards(),
): SoloRoundState {
  const cardsCount = round; // em 3 jogadores, cartas por jogador = rodada (1..6)
  const deck = [...shuffledDeck];

  const playerHand = deck.splice(0, cardsCount);
  const macHand = deck.splice(0, cardsCount);
  const donaldHand = deck.splice(0, cardsCount);
  const unplayedCards = deck;

  // Ordem da mão do humano ordenada por naipe e número para boa UX
  playerHand.sort((a, b) =>
    a.suitId === b.suitId
      ? a.number - b.number
      : a.suitId.localeCompare(b.suitId),
  );

  const leader = getRoundLeader(round);

  return {
    round,
    playerHand,
    macHand,
    donaldHand,
    unplayedCards,
    bids: {
      human: 0,
      mac: dummyBid('mac', round),
      donald: dummyBid('donald', round),
    },
    tricksWon: {
      human: 0,
      mac: 0,
      donald: 0,
    },
    currentTrickNumber: 1,
    trickLeadPlayerId: leader,
    currentTurnPlayerId: leader,
    currentTrickCards: [],
    completedTricks: [],
    phase: 'bidding',
    roundPoints: { human: 0, mac: 0, donald: 0 },
  };
}

export function startSoloGame(
  playerName: string = 'Você',
  shuffledDeck?: Card[],
): SoloGameState {
  const initialRound = setupSoloRound(1, shuffledDeck);
  return {
    currentRound: 1,
    playerName: playerName.trim() || 'Você',
    tokens: {
      human: emptyTokens(),
      mac: emptyTokens(),
      donald: emptyTokens(),
    },
    roundHistory: [],
    currentRoundState: initialRound,
    finished: false,
  };
}

export function setHumanBid(state: SoloGameState, bid: number): SoloGameState {
  if (state.currentRoundState.phase !== 'bidding') return state;
  const maxBid = state.currentRoundState.round;
  const clampedBid = Math.max(0, Math.min(maxBid, Math.round(bid)));

  const updatedRound: SoloRoundState = {
    ...state.currentRoundState,
    bids: {
      ...state.currentRoundState.bids,
      human: clampedBid,
    },
    phase: 'playing',
  };

  return {
    ...state,
    currentRoundState: updatedRound,
  };
}

// Bot joga carta da mão: do topo da mão, ou do topo do naipe pedido
export function chooseBotCard(hand: Card[], leadSuitId?: string): Card {
  if (!leadSuitId) {
    // É o líder: joga a carta do topo
    return hand[0];
  }
  // Deve seguir o naipe se tiver
  const matchingIndex = hand.findIndex((c) => c.suitId === leadSuitId);
  if (matchingIndex !== -1) {
    return hand[matchingIndex];
  }
  // Se não tem o naipe pedido, joga a carta do topo da mão
  return hand[0];
}

// Avalia vencedor de uma vaza de 3 cartas
export function resolveTrick(played: PlayedCard[]): SoloPlayerId | null {
  if (played.length === 0) return null;

  // Agrupa por número para checar anulação
  const counts: Record<number, PlayedCard[]> = {};
  for (const p of played) {
    counts[p.card.number] = counts[p.card.number] || [];
    counts[p.card.number].push(p);
  }

  // Cartas que não se anulam (apareceram apenas 1 vez)
  const nonTied = played.filter((p) => counts[p.card.number].length === 1);

  if (nonTied.length === 0) {
    // Todas as cartas se anularam (ex: empate duplo ou todos iguais)
    return null;
  }

  // Vence a de maior número, de qualquer naipe
  nonTied.sort((a, b) => b.card.number - a.card.number);
  return nonTied[0].playerId;
}

export function playCard(
  state: SoloGameState,
  cardId?: string, // Necessário se for a vez do humano
): SoloGameState {
  const roundState = state.currentRoundState;
  if (roundState.phase !== 'playing') return state;

  const currentTurn = roundState.currentTurnPlayerId;
  const leadSuitId =
    roundState.currentTrickCards.length > 0
      ? roundState.currentTrickCards[0].card.suitId
      : undefined;

  let cardToPlay: Card | undefined;

  if (currentTurn === 'human') {
    if (!cardId) return state;
    const hand = roundState.playerHand;
    const chosen = hand.find((c) => c.id === cardId);
    if (!chosen) return state;

    // Validação de obrigação de seguir o naipe
    if (leadSuitId && chosen.suitId !== leadSuitId) {
      const hasLeadSuit = hand.some((c) => c.suitId === leadSuitId);
      if (hasLeadSuit) {
        // Bloqueado: deve seguir o naipe
        return state;
      }
    }
    cardToPlay = chosen;
  } else if (currentTurn === 'mac') {
    cardToPlay = chooseBotCard(roundState.macHand, leadSuitId);
  } else if (currentTurn === 'donald') {
    cardToPlay = chooseBotCard(roundState.donaldHand, leadSuitId);
  }

  if (!cardToPlay) return state;

  // Remove carta da mão
  const newPlayerHand =
    currentTurn === 'human'
      ? roundState.playerHand.filter((c) => c.id !== cardToPlay!.id)
      : roundState.playerHand;
  const newMacHand =
    currentTurn === 'mac'
      ? roundState.macHand.filter((c) => c.id !== cardToPlay!.id)
      : roundState.macHand;
  const newDonaldHand =
    currentTurn === 'donald'
      ? roundState.donaldHand.filter((c) => c.id !== cardToPlay!.id)
      : roundState.donaldHand;

  const newCurrentTrickCards = [
    ...roundState.currentTrickCards,
    { playerId: currentTurn, card: cardToPlay },
  ];

  // Se a vaza ainda não completou 3 cartas
  if (newCurrentTrickCards.length < 3) {
    const turnOrder = getTurnOrder(roundState.trickLeadPlayerId);
    const nextTurn = turnOrder[newCurrentTrickCards.length];

    return {
      ...state,
      currentRoundState: {
        ...roundState,
        playerHand: newPlayerHand,
        macHand: newMacHand,
        donaldHand: newDonaldHand,
        currentTrickCards: newCurrentTrickCards,
        currentTurnPlayerId: nextTurn,
      },
    };
  }

  // Vaza completou 3 cartas: resolve vencedor
  const winner = resolveTrick(newCurrentTrickCards);
  const nextLead = winner ?? roundState.trickLeadPlayerId;

  const trickResult: TrickResult = {
    trickNumber: roundState.currentTrickNumber,
    leadPlayerId: roundState.trickLeadPlayerId,
    leadSuitId: newCurrentTrickCards[0].card.suitId,
    played: newCurrentTrickCards,
    winnerId: winner,
  };

  const newTricksWon = { ...roundState.tricksWon };
  if (winner) {
    newTricksWon[winner] += 1;
  }

  const isRoundOver = roundState.currentTrickNumber >= roundState.round;

  if (!isRoundOver) {
    // Próxima vaza
    return {
      ...state,
      currentRoundState: {
        ...roundState,
        playerHand: newPlayerHand,
        macHand: newMacHand,
        donaldHand: newDonaldHand,
        currentTrickCards: [],
        completedTricks: [...roundState.completedTricks, trickResult],
        currentTrickNumber: roundState.currentTrickNumber + 1,
        trickLeadPlayerId: nextLead,
        currentTurnPlayerId: nextLead,
        tricksWon: newTricksWon,
      },
    };
  }

  // Fim da rodada: calcula pontuações
  const roundPoints: Record<SoloPlayerId, number> = {
    human: scoreRound(
      roundState.round,
      roundState.bids.human,
      newTricksWon.human,
    ),
    mac: scoreRound(roundState.round, roundState.bids.mac, newTricksWon.mac),
    donald: scoreRound(
      roundState.round,
      roundState.bids.donald,
      newTricksWon.donald,
    ),
  };

  // Atualiza tokens
  const newTokens = { ...state.tokens };
  for (const pid of ['human', 'mac', 'donald'] as const) {
    const pts = roundPoints[pid];
    const delta = pointsToTokens(pts);
    const current = { ...newTokens[pid] };
    for (const tokenType of ['saco', 'espiga', 'rato'] as const) {
      current[tokenType] = clampToken(current[tokenType] + delta[tokenType]);
    }
    newTokens[pid] = current;
  }

  const finishedRoundState: SoloRoundState = {
    ...roundState,
    playerHand: newPlayerHand,
    macHand: newMacHand,
    donaldHand: newDonaldHand,
    currentTrickCards: [],
    completedTricks: [...roundState.completedTricks, trickResult],
    tricksWon: newTricksWon,
    phase: 'round_end',
    roundPoints,
  };

  return {
    ...state,
    tokens: newTokens,
    roundHistory: [
      ...state.roundHistory,
      {
        round: roundState.round,
        bids: roundState.bids,
        tricksWon: newTricksWon,
        points: roundPoints,
      },
    ],
    currentRoundState: finishedRoundState,
    finished: roundState.round === 6,
  };
}

// Avança para a próxima rodada após a visualização do encerramento da rodada
export function advanceToNextRound(
  state: SoloGameState,
  shuffledDeck?: Card[],
): SoloGameState {
  if (state.currentRoundState.phase !== 'round_end') return state;
  if (state.currentRound >= 6) {
    return {
      ...state,
      finished: true,
    };
  }

  const nextRound = (state.currentRound + 1) as RoundNumber;
  const newRoundState = setupSoloRound(nextRound, shuffledDeck);

  return {
    ...state,
    currentRound: nextRound,
    currentRoundState: newRoundState,
  };
}
