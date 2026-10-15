import {useState,useId} from 'react';
import type {Plan} from '../core/types';
import {displayAmount,displayAvailable,displayTime} from '../core/validation';
import {estimateAvailableTime,MODEL_VERSION,type UsageInput} from '../modules/transport/referenceModels/transportOxygen';
export const usesTransportReference=(p:Plan)=>p.mode==='clinical'&&['monnal-t60','v60','art70'].includes(p.profileId);
function input(p:Plan):UsageInput{return {device:p.profileId,method:p.profileId==='monnal-t60'?(p.fields.transportMethod??'invasive'):'nppv',fio2:p.fields.fio2??'',mv:p.fields.vent??'',leak:p.fields.leak??'',flow:p.fields.transportFlow??'',pressure:p.fields.cylinderPressure??'',reserve:p.fields.transportReserve??'',highPressure:true};}
const names:Record<string,string>={'monnal-t60':'MONNAL T60（通常型）',v60:'Philips V60',art70:'アコマ ART-70'};
export function TransportOxygenInputs({plan,change,settings=false}:{plan:Plan;change:(p:Plan)=>void;settings?:boolean}){
 const id=useId(),i=input(plan),[attempted,setAttempted]=useState(false);const errors=attempted?estimateAvailableTime(i).errors:{};
 function update(k:string,v:string){change({...plan,fields:{...plan.fields,[k]:v}});}
 function field(k:string,label:string,unit:string,errorKey=k){return <div className="field"><label htmlFor={id+k}>{label}</label><div className="input-unit"><input id={id+k} inputMode="decimal" value={plan.fields[k]??''} onBlur={()=>setAttempted(true)} onChange={e=>update(k,e.target.value)} aria-invalid={!!errors[errorKey]}/><span>{unit}</span></div>{errors[errorKey]&&<small className="error">{errors[errorKey]}</small>}</div>;}
 if(settings)return <section><h3>固定値</h3><p>500 L型ボンベ／容器内容積 3.4 L（固定）／換算係数 34 L/MPa（概算）</p><p>追加フロー 5 L/min（固定）。MONNALのHFNCには加算しません。従来V60の80%係数はこのモデルに適用しません。</p></section>;
 return <section className="reference-input"><h3>搬送用酸素の参考推算</h3><p>搬送区分：<strong>院外搬送</strong></p>{plan.profileId==='monnal-t60'&&<label className="field">使用方法<select aria-label="使用方法" value={i.method} onChange={e=>change({...plan,fields:{...plan.fields,transportMethod:e.target.value,vent:'',transportFlow:'',leak:''}})}><option value="invasive">挿管換気</option><option value="niv">NIV・CPAP・Duo-Levels</option><option value="hfnc">HFNC・酸素療法</option></select></label>}<div className="grid">{field('fio2','FiO₂','%','fio2')}{i.method==='hfnc'?field('transportFlow','設定流量','L/min','flow'):field('vent',i.method==='niv'?'吸気分時換気量（MVi）':'分時換気量（MV）','L/min','mv')}{i.method==='nppv'&&field('leak','総リーク量（Tot.Leak）','L/min','leak')}</div><small>{i.method==='niv'?'MViは実機の吸気分時換気量を読む。Leak%は加算しません。':i.method==='hfnc'?'酸素療法画面の設定流量を読む。追加5 L/minは使いません。':i.method==='nppv'?'MVとTot.Leakを実機から読む。Leak%は入力しません。両値の定義・重複は実機で未検証。':'実機で測定された分時換気量を読む。'}</small><div className="grid">{field('transportReserve','計算で残す圧力（施設の予備圧力）','MPa','reserve')}</div><small>施設基準の値を入力してください。</small></section>;
}
export function TransportOxygenResults({plan}:{plan:Plan}){
 const [copied,setCopied]=useState('');const [calculatedAt]=useState(()=>new Date().toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'}));
 const i=input(plan),r=estimateAvailableTime(i),v=r.value;
 const partial=i.method==='nppv'?estimateAvailableTime({...i,pressure:'0',reserve:'0',highPressure:true}).value:null;
 const report=v?[`${names[plan.profileId]}／${i.method}／院外搬送／${MODEL_VERSION}`,'参考推算・未検証・臨床使用未承認・搬送可否は判定しない',`計算時刻 ${calculatedAt} JST`,`FiO₂ ${i.fio2}%／MV ${i.mv||'対象外'} L/min／Tot.Leak ${i.leak||'対象外'} L/min／設定流量 ${i.flow||'対象外'} L/min`,`残圧 ${i.pressure} MPa／予備 ${i.reserve} MPa／内容積3.4 L／追加5 L/min（HFNCは0）`,`推定消費量 ${displayAmount(v.flow)} L/min／使用可能酸素量 ${displayAvailable(v.available)} L／酸素の使用可能時間 ${v.duration===null?'未評価':displayTime(v.duration)}`,'搬送予定時間は使用せず、搬送可否・必要量・余裕/不足は評価しない。','減圧弁付き酸素供給が共通前提。NPPVのMVとTot.Leakは重複しないと仮定。未検証。','NIVは呼気時のリーク補償による追加消費が未確定。HFNCの内部追加消費は未確定。'].join('\n'):'';
 async function copy(){try{await navigator.clipboard.writeText(report);setCopied('コピーしました（患者情報なし）');}catch{setCopied('コピーできませんでした。ブラウザのクリップボード権限をご確認ください。');}}
 return <section className="reference-result" aria-label="搬送用酸素の参考結果">
 <div className="usage-time" aria-label="酸素の使用可能時間"><h3>酸素の使用可能時間</h3><strong>{v?v.duration===null?'未評価':displayTime(v.duration):'未計算'}</strong><p>現在の入力条件による参考値</p></div>
 {!v?<div role="alert"><p>使用可能時間を表示するには、次の項目を入力してください。</p>{Object.entries(r.errors).map(([k,msg])=><p className="error" key={k}>{({fio2:'FiO₂',pressure:'酸素ボンベ残圧',reserve:'予備圧力',mv:'分時換気量',flow:'設定流量',leak:'Tot.Leak'} as Record<string,string>)[k]??k}：{msg}</p>)}</div>:<>{v.available===0&&<p className="error" role="alert">現在残圧が予備圧力以下です。使用可能酸素量は0 Lです。</p>}{v.duration===null&&<p className="notice">FiO₂ 21%は式上の消費量が0となるため、使用可能時間を評価しません。無限時間や酸素不要を示しません。</p>}</>}
 {(v||partial)&&<div className="result-metrics"><div><small>推定酸素消費量</small><strong><span className="metric-number">{displayAmount((v||partial)!.flow)}</span>{' '}<span className="metric-unit">L/min</span></strong></div>{v&&<div><small>使用可能酸素量</small><strong><span className="metric-number">{displayAvailable(v.available)}</span>{' '}<span className="metric-unit">L</span></strong></div>}</div>}
 {v&&<><button onClick={copy}>計算条件と結果をコピー</button><p role="status">{copied}</p></>}
 {i.method==='nppv'&&<p className="notice">計算の仮定：MVとTot.Leakは重複しないものとし、追加フロー5 L/minを加算。高圧酸素入力を想定。</p>}
 <p>電源・必要な空気・供給能力は別確認。院外では車両電源・固定方法・切替・到着先接続も確認してください。</p>
 <details hidden><summary>100%時の参考値・予備酸素の準備目標</summary><p>搬送予定時間を使わないため、準備目標は評価しません。</p></details>
 <details hidden><summary>コピー用の記録を表示</summary><textarea readOnly value={report}/></details>
 <details hidden><summary>仮定と利用上の注意</summary><p>未検証の参考推算・臨床使用未承認。搬送可否を自動判定しません。</p><p>保証性能や承認式ではありません。NIVでは呼気時のリーク補償による追加消費が未確定、HFNCでは内部追加消費は未確定です。</p></details>
 <details hidden><summary>式・出典・未確認事項</summary><p>式・出典はソース付属READMEに記載。モデル版 {MODEL_VERSION}。使用可能量34×max(残圧−予備,0)÷推定酸素消費量。搬送予定時間は使用しません。時間は0.1分切捨て。</p></details>
 </section>;
}
