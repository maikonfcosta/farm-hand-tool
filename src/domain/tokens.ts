import { TOKEN_MAX, TOKEN_MIN, TOKEN_VALUE, type TokenCounts } from './types';
export const totalPoints = (t: TokenCounts) =>
  TOKEN_VALUE.saco * t.saco +
  TOKEN_VALUE.espiga * t.espiga +
  TOKEN_VALUE.rato * t.rato;
export const clampToken = (n: number) =>
  Math.max(TOKEN_MIN, Math.min(TOKEN_MAX, n));
export const emptyTokens = (): TokenCounts => ({ saco: 0, espiga: 0, rato: 0 });
