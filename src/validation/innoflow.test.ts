import {describe,it,expect} from 'vitest';
import {calculateInnoflow,approximate} from '../modules/equipment/innoflow';
const base={pressure:'2000',concentration:'20',flow:'10'};
describe('アイノフローDS 800ppm・88型・交換200psi（ソフト参照値）',()=>{
 it('独立参照：1764L/0.2564102564=6879.6分',()=>{const r=calculateInnoflow(base);expect(r.errors).toEqual({});const v=r.value!;expect(v.consumption).toBeCloseTo(0.2564102564102564,12);expect(v.available).toBe(1764);expect(v.minutes).toBeCloseTo(6879.6,9);expect(v.hours).toBeCloseTo(114.66,10);expect(v.days).toBeCloseTo(4.7775,10);expect([v.wholeDays,v.remainingHours,v.remainingMinutes]).toEqual([4,18,39]);expect(approximate(v.days,2)).toBe('4.78');expect(approximate(v.hours,1)).toBe('114.7');});
 it('1000psi独立参照：50.96時間・2.123333日',()=>{const v=calculateInnoflow({...base,pressure:'1000'}).value!;expect(v.available).toBe(784);expect(v.hours).toBeCloseTo(50.96,10);expect(v.days).toBeCloseTo(2.1233333333333,10);expect(approximate(v.days,2)).toBe('2.12');});
 it('回路流量2倍なら時間半分',()=>{const a=calculateInnoflow(base).value!,b=calculateInnoflow({...base,flow:'20'}).value!;expect(b.minutes).toBe(a.minutes/2);expect(b.consumption).toBe(a.consumption*2);});
 for(const pressure of ['0','199','200'])it('交換圧以下 '+pressure,()=>{const v=calculateInnoflow({...base,pressure}).value!;expect(v.minutes).toBe(0);expect(v.available).toBe(0);expect(v.exchangeRequired).toBe(true);});
 it('交換圧直上・800直下の数学的境界',()=>{const v=calculateInnoflow({...base,pressure:'200.01',concentration:'799.999'}).value!;expect(v.minutes).toBeGreaterThan(0);expect(v.exchangeRequired).toBe(false);});
 for(const key of ['pressure','concentration','flow'] as const)for(const val of ['',' ','abc','NaN','Infinity','-Infinity','1e309','-1','10 psi'])it(key+'不正 '+val,()=>{const r=calculateInnoflow({...base,[key]:val});expect(r.value).toBeNull();expect(r.errors[key]).toBeDefined();});
 for(const concentration of ['0','800','801','4880'])it('NO範囲外 '+concentration,()=>{expect(calculateInnoflow({...base,concentration}).value).toBeNull();});
 it('流量0で除算しない',()=>{expect(calculateInnoflow({...base,flow:'0'}).value).toBeNull();});
 it('計算途中の非有限値・アンダーフローを遮断',()=>{for(const patch of [{pressure:'1e308'},{concentration:'1e-300',flow:'1e-300'}])expect(calculateInnoflow({...base,...patch}).errors.calculation).toBeDefined();});
 it('2000psiは早見表の条件であって数学的上限ではない',()=>{expect(calculateInnoflow({...base,pressure:'2001'}).value).not.toBeNull();});
});
