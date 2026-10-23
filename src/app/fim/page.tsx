'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Trophy} from 'lucide-react';
import {AppShell} from '@/components/AppShell';
import {RankingList} from '@/components/RankingList';
import {panel,primary,secondary} from '@/components/ui';
import {rankPlayers} from '@/domain/ranking';
import {totalPoints} from '@/domain/tokens';
import {useGameStore} from '@/store/gameStore';
import {text} from '@/content/ptbr';
export default function Finish(){const game=useGameStore(s=>s.game);const tiebreak=useGameStore(s=>s.startTiebreak);const router=useRouter();const winners=game?rankPlayers(game.players).filter(p=>p.position===1):[];return <AppShell title={text.finished}>{game&&<><section className={`${panel} text-center`}><Trophy className="mx-auto mb-4 text-[#a85b16]" size={44}/><h2 className="text-[var(--teal-dark)]">{text.winner(winners.map(w=>w.player.name))}</h2></section><RankingList players={game.players}/>{game.mode==='solo'&&<section className={`${panel} mt-5 space-y-3`}><p>{text.beatDummies(game.players.slice(1).every(p=>totalPoints(game.players[0].tokens)>totalPoints(p.tokens)))}</p><p>{text.goal(totalPoints(game.players[0].tokens)>=21)}</p></section>}<div className="mt-6 flex flex-wrap gap-3">{game.finished&&winners.length>1&&<button className={primary} onClick={()=>{tiebreak();router.push('/rodada/');}}>{text.tiebreak}</button>}<Link className={secondary} href="/jogo/">{text.backTokens}</Link><Link className={secondary} href="/jogo/novo/">{text.newGame}</Link><Link className={secondary} href="/">{text.backMenu}</Link></div></>}</AppShell>;}
