'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import {
  ConfirmDialog,
  panel,
  secondary,
  type DialogAction,
} from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { text } from '@/content/ptbr';
export default function Settings() {
  const settings = useGameStore((s) => s.settings);
  const setSetting = useGameStore((s) => s.setSetting);
  const clear = useGameStore((s) => s.clearAllData);
  const router = useRouter();
  const [supported, setSupported] = useState({
    vibrate: false,
    wakeLock: false,
  });
  const [dialog, setDialog] = useState<DialogAction | null>(null);
  useEffect(
    () =>
      setSupported({
        vibrate: 'vibrate' in navigator,
        wakeLock: 'wakeLock' in navigator,
      }),
    [],
  );
  return (
    <AppShell title={text.menuCards[5].title}>
      <section className={`${panel} mb-6 divide-y divide-[#d9bda8]`}>
        {(['vibrate', 'wakeLock'] as const)
          .filter((key) => supported[key])
          .map((key) => (
            <label
              key={key}
              className="flex min-h-18 items-center justify-between gap-4 py-3 font-bold"
            >
              <span>{key === 'vibrate' ? text.vibrate : text.wakeLock}</span>
              <input
                role="switch"
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => setSetting(key, e.target.checked)}
                className="!min-h-7 !w-7 accent-[var(--teal)]"
              />
            </label>
          ))}
        <div className="py-4">
          <button
            className={secondary}
            onClick={() =>
              setDialog({
                title: text.clearConfirm,
                onConfirm: () => {
                  clear();
                  router.push('/');
                },
              })
            }
          >
            {text.clearData}
          </button>
        </div>
      </section>
      <section className={panel}>
        <h2 className="mb-4 text-[var(--teal-dark)]">{text.about}</h2>
        <p className="leading-relaxed text-[var(--muted)]">{text.aboutText}</p>
      </section>
      {dialog && (
        <ConfirmDialog action={dialog} onClose={() => setDialog(null)} />
      )}
    </AppShell>
  );
}
