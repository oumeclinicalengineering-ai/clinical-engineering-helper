import {describe,it,expect} from 'vitest';
import {calculatePE} from '../modules/blood/pe';
describe('PE volume conversion',()=>{
 it('converts 1 PV without replacing prescribed volume with prepared volume',()=>{const r=calculatePE(60,30,'pv',1,'ffp',[0,0,7]);expect(r.pv).toBeCloseTo(3.230769);expect(r.units).toBeCloseTo(26.923);expect(r.ffpPrepared).toBe(3360);expect(r.multiple).toBeCloseTo(1);});
 it('keeps albumin preparation rounding separate',()=>{const r=calculatePE(60,30,'volume',3.1,'alb',[0,0,0]);expect(r.albBottles).toBeCloseTo(12.4);expect(r.prepareAlb).toBe(13);expect(r.ml).toBe(3100);expect(r.albGrams).toBe(155);});
 it('calculates FFP product totals',()=>{expect(calculatePE(60,30,'products',5,'ffp',[]).ml).toBe(600);});
 it('rejects invalid patient conditions and bag counts',()=>{expect(()=>calculatePE(60,100,'pv',1,'ffp',[0,0,0])).toThrow();expect(()=>calculatePE(60,30,'pv',1,'ffp',[0,0,.5])).toThrow();expect(()=>calculatePE(0,30,'pv',1,'ffp',[0,0,0])).toThrow();});
});
