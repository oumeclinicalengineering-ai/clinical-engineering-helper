import {useState} from 'react';
export function PeCalciumRate(){
 const [mode,setMode]=useState<'direct'|'ratio'>('direct');
 const [qb,setQb]=useState('100'),[ratio,setRatio]=useState('20'),[ffp,setFfp]=useState('20'),[dose,setDose]=useState('5');
 const num=(v:string)=>v.trim()===''?NaN:Number(v);
 const flow=mode==='direct'?num(ffp):num(qb)*num(ratio)/100;
 const valid=Number.isFinite(flow)&&flow>0&&(mode==='direct'||(num(qb)>0&&num(ratio)>0&&num(ratio)<=100));
 const hourly=flow*60*Number(dose)/480;
 return <section className="card"><h2>PE カルチコール持続投与速度</h2>
 <p className="notice">FFP 4U（約480mL）あたりカルチコール原液5mLまたは6mLを均等投与する医師指示の算術換算です。投与の適否を判断するものではありません。</p>
 <label className="field">計算方法<select value={mode} onChange={e=>setMode(e.target.value as 'direct'|'ratio')}><option value="direct">FFP置換速度を直接入力（推奨）</option><option value="ratio">QBと分離率から計算</option></select></label>
 {mode==='direct'?<label className="field">FFP置換速度（mL/min）<input type="number" min="0" step="any" value={ffp} onChange={e=>setFfp(e.target.value)}/></label>:<div className="grid"><label className="field">血流量 QB（mL/min）<input type="number" min="0" step="any" value={qb} onChange={e=>setQb(e.target.value)}/></label><label className="field">分離率（対QB・%）<input type="number" min="0" max="100" step="any" value={ratio} onChange={e=>setRatio(e.target.value)}/></label></div>}
 <label className="field">医師指示（FFP 4Uあたり）<select value={dose} onChange={e=>setDose(e.target.value)}><option value="5">カルチコール原液 5mL</option><option value="6">カルチコール原液 6mL</option></select></label>
 {valid?<div className="overall" aria-live="polite"><strong>シリンジポンプ計算値：{hourly.toFixed(2)} mL/h</strong><p>FFP置換速度：{flow.toFixed(2)} mL/min（{(flow*60).toFixed(1)} mL/h）</p><p>計算式：FFP置換速度 × 60 × {dose} ÷ 480</p></div>:<p className="error" role="alert">正しい正の数値を入力してください。</p>}
 <p className="notice">原液・無希釈が前提です。分離速度とFFP補充速度が異なる場合は必ずFFP補充速度を入力してください。停止・速度変更時は再計算し、iCa・心電図・添付文書・医師指示を確認してください。FFPバッグへの混注はしないでください。</p>
 </section>;
}
