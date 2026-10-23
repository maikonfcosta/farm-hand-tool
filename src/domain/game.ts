import {TOKEN_ORDER,type Draft,type GameConfig,type GameState,type Player,type RoundNumber,type TokenType} from './types';
import {clampToken,emptyTokens} from './tokens';
import {dummyBid} from './dummies';
import {cardsPerPlayer} from './rounds';
import {pointsToTokens,scoreRound} from './scoring';
import {rankPlayers} from './ranking';
export function makeDraft(players:Player[],r:RoundNumber):Record<string,Draft>{return Object.fromEntries(players.map(p=>[p.id,{bid:p.kind==='human'?0:dummyBid(p.kind,r),tricks:0}]));}
export function createGame(c:GameConfig):GameState {
 const players:Player[]=c.names.map((name,i)=>({id:crypto.randomUUID(),name:name.trim()||(c.mode==='solo'?'Você':`Jogador ${i+1}`),kind:'human',tokens:emptyTokens()}));
 if(c.mode==='solo'||players.length===2)players.push({id:'mac',name:'Mac',kind:'mac',tokens:emptyTokens()});
 if(c.mode==='solo')players.push({id:'donald',name:'Donald',kind:'donald',tokens:emptyTokens()});
 return {schemaVersion:1,mode:c.mode,players,firstDealerId:c.mode==='solo'?null:players[c.names.length===2?0:c.firstDealerIndex??0].id,currentRound:1,tiebreakCount:0,draft:makeDraft(players,1),history:[],finished:false};
}
export function setTokens(g:GameState,id:string,type:TokenType,delta:number){const p=g.players.find(p=>p.id===id);if(!p||p.tokens[type]+delta<0||p.tokens[type]+delta>99)return g;return {...g,players:g.players.map(p=>p.id===id?{...p,tokens:{...p.tokens,[type]:p.tokens[type]+delta}}:p)};}
export function setDraft(g:GameState,id:string,field:keyof Draft,value:number){const p=g.players.find(p=>p.id===id);if(g.finished||!p||(field==='bid'&&p.kind!=='human')||!Number.isInteger(value)||value<0||value>cardsPerPlayer(g.currentRound,g.players.length))return g;return {...g,draft:{...g.draft,[id]:{...g.draft[id],[field]:value}}};}
export function applyRound(g:GameState):GameState {
 if(g.finished||Object.values(g.draft).reduce((n,d)=>n+d.tricks,0)>cardsPerPlayer(g.currentRound,g.players.length))return g;
 const entries=g.players.map(p=>({playerId:p.id,...g.draft[p.id],points:scoreRound(g.currentRound,g.draft[p.id].bid,g.draft[p.id].tricks)}));
 const delta:Record<string,ReturnType<typeof emptyTokens>>={};
 const players=g.players.map(p=>{const requested=pointsToTokens(entries.find(e=>e.playerId===p.id)!.points);const tokens={...p.tokens};delta[p.id]=emptyTokens();for(const key of TOKEN_ORDER){tokens[key]=clampToken(p.tokens[key]+requested[key]);delta[p.id][key]=tokens[key]-p.tokens[key];}return {...p,tokens};});
 const round=Math.min(g.currentRound+1,6) as RoundNumber;
 return {...g,players,history:[...g.history,{round:g.currentRound,tiebreak:g.tiebreakCount,entries,delta}],currentRound:round,draft:makeDraft(players,round),finished:g.currentRound===6};
}
export function undoLastRound(g:GameState):GameState {const last=g.history.at(-1);if(!last)return g;return {...g,players:g.players.map(p=>({...p,tokens:Object.fromEntries(TOKEN_ORDER.map(k=>[k,Math.max(0,p.tokens[k]-last.delta[p.id][k])])) as Player['tokens']})),currentRound:last.round,tiebreakCount:last.tiebreak,draft:Object.fromEntries(last.entries.map(e=>[e.playerId,{bid:e.bid,tricks:e.tricks}])),history:g.history.slice(0,-1),finished:false};}
export function startTiebreak(g:GameState):GameState {if(!g.finished||rankPlayers(g.players).filter(p=>p.position===1).length<2)return g;return {...g,currentRound:6,tiebreakCount:g.tiebreakCount+1,finished:false,draft:makeDraft(g.players,6)};}
