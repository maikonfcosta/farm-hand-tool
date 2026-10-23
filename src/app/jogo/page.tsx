'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoundBar } from '@/components/RoundBar';
import { PlayerCard } from '@/components/PlayerCard';
import { RankingList } from '@/components/RankingList';
import { ConfirmDialog, type DialogAction } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { text } from '@/content/ptbr';
export default function Tokens() {
  const game = useGameStore((s) => s.game);
  const reset = useGameStore((s) => s.resetAllTokens);
  const finish = useGameStore((s) => s.finishGame);
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [menu, setMenu] = useState(false);
  return (
    <AppShell
      title={text.menuCards[0].title}
      actions={
        <div className="relative">
          <button
            aria-label={text.more}
            aria-expanded={menu}
            className="flex size-12 items-center justify-center rounded-full border border-[#cfae95]"
            onClick={() => setMenu(!menu)}
          >
            <MoreHorizontal />
          </button>
          {menu && (
            <div className="absolute right-0 top-14 z-30 w-60 rounded-2xl border border-[#d9bda8] bg-[var(--surface)] p-2 shadow-xl">
              {[
                {
                  label: text.resetAll,
                  title: text.resetAllConfirm,
                  run: reset,
                },
                {
                  label: text.end,
                  title: text.endConfirm,
                  run: () => {
                    finish();
                    router.push('/fim/');
                  },
                },
                {
                  label: text.newGame,
                  title: text.newConfirm,
                  run: () => router.push('/jogo/novo/'),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  className="block min-h-12 w-full rounded-lg p-3 text-left hover:bg-[#25756d12]"
                  onClick={() => {
                    setMenu(false);
                    setDialog({ title: item.title, onConfirm: item.run });
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      }
    >
      {game && (
        <>
          <RoundBar game={game} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {game.players.map((p, i) => (
              <PlayerCard key={p.id} player={p} index={i} open={setDialog} />
            ))}
          </div>
          <RankingList players={game.players} />
        </>
      )}
      {dialog && (
        <ConfirmDialog action={dialog} onClose={() => setDialog(null)} />
      )}
    </AppShell>
  );
}
