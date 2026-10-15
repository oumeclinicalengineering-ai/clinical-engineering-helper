import {describe,it,expect} from 'vitest';
import {estimateOxygen,type OxygenInput} from '../modules/transport/referenceModels/transportOxygen';
const base:OxygenInput={device:'monnal-t60',method:'invasive',fio2:'100',mv:'10',leak:'30',flow:'40',pressure:'11',reserve:'1',minutes:'30',highPressure:true,target:'1',candidatePressure:''};
describe('利用者指定の未検証搬送モデル（実機試験ではない）',()=>{
 it('独立参照：100% 15L/min・340L・450L・開始14.2353MPa',()=>{const v=estimateOxygen(base).value!;expect(v.flow).toBe(15);expect(v.available).toBe(340);expect(v.duration).toBeCloseTo(22.6666666667);expect(v.needed).toBe(450);expect(v.startPressure).toBeCloseTo(14.2352941176);expect(v.shortage).toBe(110);});
 it('NIVはMVi+5でLeak%もTot.Leakも加算しない',()=>{const v=estimateOxygen({...base,method:'niv',leak:'999',fio2:'60'}).value!;expect(v.flow).toBeCloseTo(585/79);});
 it('HFNCは追加5を加算せずMVもリークも使わない',()=>{expect(estimateOxygen({...base,method:'hfnc',mv:'',leak:'',flow:'40'}).value?.flow).toBe(40);});
 for(const device of ['art70','v60'])it(device+'独立参照：45L/min・必要1350L',()=>{const v=estimateOxygen({...base,device,method:'nppv'}).value!;expect(v.flow).toBe(45);expect(v.needed).toBe(1350);});
 for(const [key,values] of Object.entries({fio2:['','0.4','20','101','NaN','Infinity'],mv:['','-1','foo','Infinity'],pressure:['','-1','10 MPa','1e309'],reserve:['','-1'],minutes:['','-1','abc'],flow:['','0','-1']}))for(const val of values)it(`${key}不正値 ${val}`,()=>{const method=key==='flow'?'hfnc':'invasive';const r=estimateOxygen({...base,method,[key]:val});expect(r.value).toBeNull();expect(r.errors[key]).toBeDefined();});
 it('21%は無限時間や酸素不要としない',()=>{const v=estimateOxygen({...base,fio2:'21'}).value!;expect(v.flow).toBe(0);expect(v.duration).toBeNull();expect(v.margin).toBeNull();});
 it('残圧が予備以下なら0L・不足を保持',()=>{const v=estimateOxygen({...base,pressure:'0'}).value!;expect(v.available).toBe(0);expect(v.duration).toBe(0);expect(v.shortage).toBe(450);});
 it('準備目標は現在分を一度だけ差引き追加候補実残圧で本数切上げ',()=>{const v=estimateOxygen({...base,target:'2',candidatePressure:'11'}).value!;expect(v.targetNeeded).toBe(900);expect(v.targetShortage).toBe(560);expect(v.additionalCylinders).toBe(2);expect(v.totalCylinders).toBe(3);});
 it('追加候補未入力なら本数を作らない',()=>{expect(estimateOxygen(base).value?.additionalCylinders).toBeNull();});
 it('候補残圧不足・未対応方式・低圧・他機種・目標不正を遮断',()=>{for(const patch of [{candidatePressure:'1'},{method:'nppv'},{highPressure:false},{device:'monnal-t60-advanced'},{target:'3'}])expect(estimateOxygen({...base,...patch}).value).toBeNull();});
 it('有限の入力でも演算オーバーフローを遮断',()=>{expect(estimateOxygen({...base,mv:'1e308',minutes:'1e308'}).value).toBeNull();});
});

describe('予定時間を要求しない使用可能時間API',()=>{
 it('予定時間・目標・候補ボンベは入力せず、時間だけを独立参照と比較',async()=>{const {estimateAvailableTime}=await import('../modules/transport/referenceModels/transportOxygen');const {minutes,target,candidatePressure,...i}=base;expect(minutes).toBe('30');expect(target).toBe('1');expect(candidatePressure).toBe('');const r=estimateAvailableTime(i);expect(r.errors).toEqual({});expect(r.value?.duration).toBeCloseTo(340/15);expect(Object.keys(r.value!)).toEqual(['flow','flow100','available','duration']);});
 it('過去の予定時間はAPIの時間評価に影響せず、21%/残圧不足は維持',async()=>{const {estimateAvailableTime}=await import('../modules/transport/referenceModels/transportOxygen');const prior={...base,minutes:'invalid'};expect(estimateAvailableTime(prior).value?.duration).toBeCloseTo(340/15);expect(estimateAvailableTime({...base,fio2:'21'}).value?.duration).toBeNull();expect(estimateAvailableTime({...base,pressure:'0'}).value?.duration).toBe(0);});
});
