import {useGameStore} from '@/store/gameStore';
export function useHaptics(){const enabled=useGameStore(s=>s.settings.vibrate);return ()=>{if(enabled&&typeof navigator!=='undefined'&&navigator.vibrate)navigator.vibrate(10);};}
