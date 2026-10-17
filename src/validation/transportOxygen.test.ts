import {describe,it,expect} from 'vitest';
import {estimateAvailableTime,type UsageInput} from '../modules/transport/referenceModels/transportOxygen';
const base:UsageInput={device:'v60',method:'nppv',fio2:'100',mv:'10',leak:'30',flow:'40',pressure:'11',factor:'0.8',highPressure:true};
describe('追加フローなし・残す圧力0の参考推算（実機試験ではない）',()=>{
 for(const device of ['v60','art70'])it(device+' 独立参照：40L/min、374L、7.48分',()=>{const v=estimateAvailableTime({...base,device}).value!;expect(v.flow).toBe(40);expect(v.available).toBe(374);expect(v.rawDuration).toBeCloseTo(9.35);expect(v.duration).toBeCloseTo(7.48);});
 for(const method of ['invasive','niv'])it('MONNAL '+method+' 追加5なし・リーク加算なし',()=>{const v=estimateAvailableTime({...base,device:'monnal-t60',method}).value!;expect(v.flow).toBe(10);expect(v.duration).toBeCloseTo(29.92);});
 it('HFNCは設定流量のみ',()=>{expect(estimateAvailableTime({...base,device:'monnal-t60',method:'hfnc',mv:'',leak:''}).value?.duration).toBeCloseTo(7.48);});
 it('40%は百分率を正しく換算',()=>{const v=estimateAvailableTime({...base,fio2:'40'}).value!;expect(v.flow).toBeCloseTo(760/79);expect(v.duration).toBeCloseTo(31.1010526316);});
 it('係数は時間に一回だけ適用し消費量・ガス量を変えない',()=>{for(const factor of ['1','0.5','0.8']){const v=estimateAvailableTime({...base,factor}).value!;expect(v.flow).toBe(40);expect(v.available).toBe(374);expect(v.duration).toBeCloseTo(9.35*Number(factor));}});
 for(const [key,values] of Object.entries({factor:['','0','-1','1.01','80','NaN','Infinity','abc'],fio2:['','0.4','20','101','NaN','Infinity'],mv:['','-1','foo','Infinity'],leak:['','-1','20%'],pressure:['','-1','10 MPa','1e309']}))for(const value of values)it(key+' 不正値 '+value,()=>{const r=estimateAvailableTime({...base,[key]:value});expect(r.value).toBeNull();expect(r.errors[key]).toBeDefined();});
 it('残圧0は時間0、21%は時間未評価',()=>{expect(estimateAvailableTime({...base,pressure:'0'}).value?.duration).toBe(0);expect(estimateAvailableTime({...base,fio2:'21'}).value?.duration).toBeNull();});
 it('旧予備圧力・予定時間を引き継がない',()=>{const prior={...base,reserve:'10',minutes:'invalid'};expect(estimateAvailableTime(prior).value?.duration).toBeCloseTo(7.48);});
 it('対象外機種・方式・低圧・演算オーバーフローを遮断',()=>{for(const patch of [{device:'monnal-t60-advanced'},{method:'niv'},{highPressure:false},{pressure:'1e308'},{mv:'1e308',leak:'1e308'}])expect(estimateAvailableTime({...base,...patch}).value).toBeNull();});
});
