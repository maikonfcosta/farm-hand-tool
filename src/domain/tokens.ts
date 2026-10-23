import { TOKEN_MAX, TOKEN_MIN, type TokenCounts } from './types';
export const totalPoints = (t: TokenCounts) => 5 * t.saco + t.espiga - t.rato;
export const clampToken = (n: number) =>
  Math.max(TOKEN_MIN, Math.min(TOKEN_MAX, n));
export const emptyTokens = (): TokenCounts => ({ saco: 0, espiga: 0, rato: 0 });
