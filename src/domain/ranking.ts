import type { Player } from './types';
import { totalPoints } from './tokens';
export function rankPlayers(players: Player[]) {
  let position = 0;
  let previous: number | undefined;
  return players
    .map((player) => ({ player, total: totalPoints(player.tokens) }))
    .sort((a, b) => b.total - a.total)
    .map((entry, i) => {
      if (entry.total !== previous) position = i + 1;
      previous = entry.total;
      return { ...entry, position };
    });
}
