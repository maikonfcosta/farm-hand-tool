import type {TokenCounts} from './types';
export const scoreRound=(roundValue:number,bid:number,tricks:number)=>bid===tricks?roundValue:-Math.abs(bid-tricks);
export const pointsToTokens=(p:number):TokenCounts=>p>0?{saco:Math.floor(p/5),espiga:p%5,rato:0}:{saco:0,espiga:0,rato:p<0?-p:0};
