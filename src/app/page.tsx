'use client';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Coins,
  Layers3,
  ListChecks,
  Plus,
  Settings,
  Sprout,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { panel } from '@/components/ui';
import { text } from '@/content/ptbr';
import { useGameStore } from '@/store/gameStore';
const icons = [Coins, BookOpen, ListChecks, Layers3, Plus, Settings];
export default function Menu() {
  const game = useGameStore((s) => s.game);
  return (
    <AppShell>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-[var(--teal)] px-6 py-9 text-white sm:px-10 sm:py-12">
        <Sprout
          className="absolute -right-5 bottom-0 size-40 -rotate-12 opacity-10 sm:right-8 sm:size-52"
          strokeWidth={1}
        />
        <h1 className="relative max-w-lg text-3xl leading-tight sm:text-4xl">
          {text.title}
        </h1>
        <p className="relative mt-4 text-lg">{text.subtitle}</p>
      </section>
      {game && !game.finished && (
        <Link
          href="/jogo/"
          className="mb-6 flex items-center justify-between rounded-2xl border border-[var(--teal)] p-4 text-[var(--teal-dark)]"
        >
          <span>
            <strong className="block">{text.continue}</strong>
            <span className="text-sm">
              {text.roundInfo(
                game.currentRound,
                game.players.length,
                game.mode === 'solo',
              )}
            </span>
          </span>
          <ArrowUpRight />
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {text.menuCards.map((card, i) => {
          const Icon = icons[i];
          return (
            <Link
              key={card.id}
              href={
                !game && (card.id === 'contador' || card.id === 'rodada')
                  ? '/jogo/novo/'
                  : card.href
              }
              data-testid={`menu-card-${card.id}`}
              className={`${panel} group flex min-h-32 items-center gap-4 hover:border-[var(--teal)]`}
            >
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${i % 2 === 0 ? 'bg-[#f26d3d18] text-[#a93d16]' : 'bg-[#25756d12] text-[var(--teal-dark)]'}`}
              >
                <Icon size={26} />
              </div>
              <div className="flex-1">
                <h2 className="text-base leading-relaxed sm:text-lg">
                  {card.title}
                </h2>
                <p className="mt-1 text-[var(--muted)]">{card.description}</p>
              </div>
              <ArrowUpRight size={20} className="shrink-0 text-[var(--teal)]" />
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
