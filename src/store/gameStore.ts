import {create} from 'zustand';
import {createJSONStorage,persist} from 'zustand/middleware';
import type {Draft,GameConfig,RootState,Settings,TokenType} from '@/domain/types';
import * as game from '@/domain/game';
import {emptyTokens} from '@/domain/tokens';
import {cardKeys} from '@/domain/cards';
export const defaults=():RootState=>({game:null,seenCards:[],settings:{vibrate:true,wakeLock:true}});
interface Actions {hydrated:boolean;storageError:boolean;setHydrated:()=>void;startGame:(c:GameConfig)=>void;setTokens:(id:string,type:TokenType,delta:number)=>void;resetPlayerTokens:(id:string)=>void;resetAllTokens:()=>void;renamePlayer:(id:string,name:string)=>void;setDraft:(id:string,field:keyof Draft,value:number)=>void;applyRound:()=>void;undoLastRound:()=>void;startTiebreak:()=>void;finishGame:()=>void;toggleSeenCard:(key:string)=>void;clearSeenCards:()=>void;setSetting:(key:keyof Settings,value:boolean)=>void;clearAllData:()=>void;}
export const useGameStore=create<RootState&Actions>()(persist((set)=>({
 ...defaults(),hydrated:false,storageError:false,setHydrated:()=>set({hydrated:true}),
 startGame:(c)=>set({game:game.createGame(c),seenCards:[]}),
 setTokens:(id,type,delta)=>set(s=>s.game?{game:game.setTokens(s.game,id,type,delta)}:{}),
 resetPlayerTokens:(id)=>set(s=>s.game?{game:{...s.game,players:s.game.players.map(p=>p.id===id?{...p,tokens:emptyTokens()}:p)}}:{}),
 resetAllTokens:()=>set(s=>s.game?{game:{...s.game,players:s.game.players.map(p=>({...p,tokens:emptyTokens()}))}}:{}),
 renamePlayer:(id,name)=>set(s=>{const trimmed=name.trim();if(!s.game||!trimmed||trimmed.length>16||s.game.players.some(p=>p.id!==id&&p.name.toLocaleLowerCase('pt-BR')===trimmed.toLocaleLowerCase('pt-BR')))return {};return {game:{...s.game,players:s.game.players.map(p=>p.id===id&&p.kind==='human'?{...p,name:trimmed}:p)}};}),
 setDraft:(id,field,value)=>set(s=>s.game?{game:game.setDraft(s.game,id,field,value)}:{}),
 applyRound:()=>set(s=>{if(!s.game)return {};const updated=game.applyRound(s.game);return updated===s.game?{}:{game:updated,seenCards:[]};}),
 undoLastRound:()=>set(s=>s.game?{game:game.undoLastRound(s.game)}:{}),
 startTiebreak:()=>set(s=>s.game?{game:game.startTiebreak(s.game)}:{}),
 finishGame:()=>set(s=>s.game?{game:{...s.game,finished:true}}:{}),
 toggleSeenCard:(key)=>set(s=>!cardKeys.includes(key)?{}:{seenCards:s.seenCards.includes(key)?s.seenCards.filter(k=>k!==key):[...s.seenCards,key]}),
 clearSeenCards:()=>set({seenCards:[]}),setSetting:(key,value)=>set(s=>({settings:{...s.settings,[key]:value}})),clearAllData:()=>set(defaults()),
}),{name:'farmhand-tracker:v1',version:1,storage:createJSONStorage(()=>localStorage),skipHydration:true,partialize:({game,seenCards,settings})=>({game,seenCards,settings}),onRehydrateStorage:()=> (state,error)=>{if(state)state.setHydrated();if(error)useGameStore.setState({...defaults(),hydrated:true,storageError:true});}}));
