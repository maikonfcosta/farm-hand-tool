import {dealerId,leaderId,cardsPerPlayer} from '@/domain/rounds';
import type {GameState} from '@/domain/types';
import {text} from '@/content/ptbr';
export function RoundBar({game}:{game:GameState}){const name=(id:string|null)=>game.players.find(p=>p.id===id)?.name??'';return <div className="sticky top-0 z-10 mb-6 rounded-2xl border border-[#25756d30] bg-[#f5eadb] p-4 text-[var(--teal-dark)]"><p className="font-bold">{text.roundLabel(game.currentRound,game.tiebreakCount)} · {text.cardsEach(cardsPerPlayer(game.currentRound,game.players.length))}</p><p className="mt-1 text-sm">{game.mode!=='solo'&&<>{text.dealer(name(dealerId(game,game.currentRound)))} · </>}{text.leader(name(leaderId(game,game.currentRound)))}</p></div>;}
