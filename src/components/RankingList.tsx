import {rankPlayers} from '@/domain/ranking';
import type {Player} from '@/domain/types';
import {text} from '@/content/ptbr';
import {panel} from './ui';
export function RankingList({players}:{players:Player[]}){return <section className={`${panel} mt-7`}><h2 className="mb-4 text-[var(--teal-dark)]">{text.ranking}</h2><ol className="space-y-2">{rankPlayers(players).map(({player,total,position})=><li key={player.id} className={`flex items-center gap-3 rounded-xl p-3 ${position===1?'bg-[#25756d12]':''}`}><span className="flex size-9 items-center justify-center rounded-full bg-[var(--teal)] font-bold text-white">{position}</span><span className="flex-1 font-bold">{player.name}</span><span className="tabular-nums">{total} {text.points}</span></li>)}</ol></section>;}
