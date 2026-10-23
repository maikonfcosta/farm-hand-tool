import type { RoundNumber } from './types';
export const dummyBid = (kind: 'mac' | 'donald', round: RoundNumber) =>
  ({ mac: [0, 1, 0, 2, 0, 3], donald: [1, 0, 1, 0, 2, 0] })[kind][round - 1];
