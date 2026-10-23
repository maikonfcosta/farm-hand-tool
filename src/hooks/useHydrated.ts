import {useGameStore} from '@/store/gameStore';
export const useHydrated=()=>useGameStore(s=>s.hydrated);
