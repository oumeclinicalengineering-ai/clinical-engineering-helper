import {numberValue} from '../../../core/validation';
export const MODEL_VERSION='transport-oxygen-reference-2026-10-17.1';
export type Method='invasive'|'niv'|'hfnc'|'nppv';
export interface OxygenInput {device:string;method:string;fio2:string;mv:string;leak:string;flow:string;pressure:string;reserve:string;minutes:string;highPressure:boolean;target:string;candidatePressure:string}
export interface OxygenEstimate {flow:number;flow100:number;available:number;duration:number|null;needed:number;startPressure:number;margin:number|null;shortage:number;targetNeeded:number;targetStart:number;targetShortage:number;additionalCylinders:number|null;totalCylinders:number|null}
export function estimateOxygen(i:OxygenInput):{errors:Record<string,string>;value:OxygenEstimate|null}{
 const errors:Record<string,string>={};
 if(!['monnal-t60','v60','art70'].includes(i.device))errors.device='この機種は参考モデルの対象外です';
 if(i.device==='monnal-t60'?!['invasive','niv','hfnc'].includes(i.method):i.method!=='nppv')errors.method='この機種と使用方法の組合せは対象外です';
 if(!i.highPressure)errors.highPressure='高圧酸素入力の構成を確認してください（低圧入力は対象外）';
 function n(key:string,raw:string,min=0,max?:number){const v=numberValue(raw,min,max);if(v===null)errors[key]=`未入力・不正値・範囲外です${key==='fio2'?'。FiO₂は21〜100%で入力（0.4は不可）':''}`;return v??0;}
 const fio=n('fio2',i.fio2,21,100),pressure=n('pressure',i.pressure),reserve=n('reserve',i.reserve),minutes=n('minutes',i.minutes);
 const base=i.method==='hfnc'?n('flow',i.flow):n('mv',i.mv)+(i.method==='nppv'?n('leak',i.leak):0);
 if(base===0)errors[i.method==='hfnc'?'flow':'mv']='流量は0より大きい値を入力してください';
 if(!['1','2'].includes(i.target))errors.target='準備目標は1倍または2倍を選択してください';
 const candidate=i.candidatePressure.trim()===''?null:n('candidatePressure',i.candidatePressure);
 if(candidate!==null&&candidate<=reserve)errors.candidatePressure='追加候補の残圧は予備圧力より高い値が必要です';
 if(Object.keys(errors).length)return {errors,value:null};
 const flow=base*(fio-21)/79,available=34*Math.max(pressure-reserve,0),needed=flow*minutes,targetNeeded=needed*Number(i.target),targetShortage=Math.max(targetNeeded-available,0);
 const duration=flow>0?available/flow:null;
 const additionalCylinders=targetShortage===0?0:candidate===null?null:Math.ceil(targetShortage/(34*(candidate-reserve)));
 const v:OxygenEstimate={flow,flow100:base,available,duration,needed,startPressure:reserve+needed/34,margin:duration===null?null:duration-minutes,shortage:Math.max(needed-available,0),targetNeeded,targetStart:reserve+targetNeeded/34,targetShortage,additionalCylinders,totalCylinders:additionalCylinders===null?null:1+additionalCylinders};
 if(Object.values(v).some(x=>x!==null&&!Number.isFinite(x)))return {errors:{calculation:'計算可能な数値範囲を超えています'},value:null};
 return {errors,value:v};
}

// 持続時間の評価には搬送計画を使わない。既存の共通検証・消費式を利用し、
// 計画関連の中間値を返さない専用API。
export type UsageInput=Omit<OxygenInput,'minutes'|'target'|'candidatePressure'|'reserve'>&{factor:string};
export function estimateAvailableTime(i:UsageInput){
 const factor=numberValue(i.factor,0,1);
 if(factor===null||factor===0)return {errors:{factor:'0より大きく1以下の数値を入力してください'},value:null};
 const r=estimateOxygen({...i,reserve:'0',minutes:'0',target:'1',candidatePressure:''});
 return {errors:r.errors,value:r.value?{flow:r.value.flow,flow100:r.value.flow100,available:r.value.available,rawDuration:r.value.duration,duration:r.value.duration===null?null:r.value.duration*factor,factor}:null};
}
