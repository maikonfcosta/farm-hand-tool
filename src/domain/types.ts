export type TokenType = 'saco' | 'espiga' | 'rato';
export const TOKEN_ORDER: TokenType[] = ['saco', 'espiga', 'rato'];
export const TOKEN_VALUE: Record<TokenType, number> = {
  saco: 5,
  espiga: 1,
  rato: -1,
};
export const TOKEN_MIN = 0;
export const TOKEN_MAX = 99;
export type TokenCounts = Record<TokenType, number>;
export type Mode = 'standard' | 'solo';
export type PlayerKind = 'human' | 'mac' | 'donald';
export type RoundNumber = 1 | 2 | 3 | 4 | 5 | 6;
export interface Player {
  id: string;
  name: string;
  kind: PlayerKind;
  tokens: TokenCounts;
}
export interface Draft {
  bid: number;
  tricks: number;
}
export interface RoundResult {
  round: RoundNumber;
  tiebreak: number;
  entries: { playerId: string; bid: number; tricks: number; points: number }[];
  delta: Record<string, TokenCounts>;
}
export interface GameState {
  schemaVersion: 1;
  mode: Mode;
  players: Player[];
  firstDealerId: string | null;
  currentRound: RoundNumber;
  tiebreakCount: number;
  draft: Record<string, Draft>;
  history: RoundResult[];
  finished: boolean;
}
export interface Settings {
  vibrate: boolean;
  wakeLock: boolean;
}
export interface RootState {
  game: GameState | null;
  seenCards: string[];
  settings: Settings;
}
export interface GameConfig {
  mode: Mode;
  names: string[];
  firstDealerIndex?: number;
}
