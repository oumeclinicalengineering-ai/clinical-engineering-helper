import {numberValue} from '../../core/validation';
export const INNOFLOW={id:'innoflow-ds-800-88',version:'innoflow-ds-800-88-1.0',device:'アイノフローDS',concentration:800,cylinder:'88型',litersPerPsi:0.98,exchangePsi:200,tableFullPsi:2000} as const;
export interface InnoflowInput {pressure:string;concentration:string;flow:string}
export interface InnoflowResult {consumption:number;available:number;minutes:number;hours:number;days:number;wholeDays:number;remainingHours:number;remainingMinutes:number;exchangeRequired:boolean}
export function calculateInnoflow(i:InnoflowInput):{errors:Partial<Record<keyof InnoflowInput|'calculation',string>>;value:InnoflowResult|null}{
 const errors:Partial<Record<keyof InnoflowInput|'calculation',string>>={};
 const pressure=numberValue(i.pressure),concentration=numberValue(i.concentration),flow=numberValue(i.flow);
 if(pressure===null)errors.pressure='現在残圧を0以上の数値（psi）で入力してください。';
 if(concentration===null||concentration<=0||concentration>=800)errors.concentration='NO設定濃度を0より大きく800未満の数値（ppm）で入力してください。';
 if(flow===null||flow<=0)errors.flow='平均回路流量を0より大きい数値（L/min）で入力してください。';
 if(Object.keys(errors).length)return {errors,value:null};
 const consumption=concentration!*flow!/(800-concentration!);
 const available=0.98*Math.max(pressure!-200,0),minutes=available/consumption,hours=minutes/60,days=minutes/1440;
 if(consumption<=0||![consumption,available,minutes,hours,days].every(Number.isFinite)||minutes>Number.MAX_SAFE_INTEGER)return {errors:{calculation:'計算可能な数値範囲を超えています。入力値と単位を確認してください。'},value:null};
 const wholeMinutes=Math.floor(minutes),wholeDays=Math.floor(wholeMinutes/1440),remainingHours=Math.floor(wholeMinutes%1440/60),remainingMinutes=wholeMinutes%60;
 return {errors,value:{consumption,available,minutes,hours,days,wholeDays,remainingHours,remainingMinutes,exchangeRequired:pressure!<=200}};
}
export function approximate(n:number,digits:number){return n>0&&n<10**-digits?`${(10**-digits).toFixed(digits)}未満`:n.toFixed(digits);}
