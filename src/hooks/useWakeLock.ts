import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
export function useWakeLock(active: boolean) {
  const enabled = useGameStore((s) => s.settings.wakeLock);
  useEffect(() => {
    if (!active || !enabled || !('wakeLock' in navigator)) return;
    let disposed = false;
    let lock: WakeLockSentinel | undefined;
    async function request() {
      if (document.visibilityState !== 'visible') return;
      try {
        const next = await navigator.wakeLock.request('screen');
        if (disposed) await next.release();
        else lock = next;
      } catch {
        /* Browser may refuse for battery or permission reasons. */
      }
    }
    void request();
    document.addEventListener('visibilitychange', request);
    return () => {
      disposed = true;
      void lock?.release().catch(() => {});
      document.removeEventListener('visibilitychange', request);
    };
  }, [active, enabled]);
}
