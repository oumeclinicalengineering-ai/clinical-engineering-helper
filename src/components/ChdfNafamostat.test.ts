import {describe,it,expect} from 'vitest';
describe('CHDF nafamostat arithmetic reference cases',()=>{
 it('prepares 40 mg/h for six hours using 50 mg vials',()=>{
  const dose=40,hours=6,vials=Math.ceil(dose*hours/50),total=vials*50,volume=50;
  expect(vials).toBe(5);expect(total).toBe(250);
  expect(dose*volume/total).toBe(8);expect(total/dose).toBe(6.25);
 });
 it('calculates 50 mg/h after a rate change with 20 mL remaining',()=>{
  const concentration=250/50;
  expect(40/concentration).toBe(8);
  expect(50/concentration).toBe(10);
  expect(20*concentration/50).toBe(2);
 });
 it('supports 20 mL preparation and 10 mg vial quantities',()=>{
  const total=3*50+2*10;
  expect(total).toBe(170);
  expect(40*20/total).toBeCloseTo(4.70588235,6);
 });
});
