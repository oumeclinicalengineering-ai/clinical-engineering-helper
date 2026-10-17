import assert from 'node:assert/strict';
import {number,urineRate,lactateChange,assess,forrester,makeReport} from '../../public/intensive-care/engine.mjs';
assert.equal(number(''),null);assert.equal(number('x'),null);assert.equal(number(0),0);
assert.equal(urineRate(120,6,60),1/3);assert.equal(urineRate(0,1,60),0);assert.equal(urineRate(20,0,60),null);assert.equal(urineRate('',6,60),null);assert.equal(urineRate(20,1,0),null);
assert.equal(lactateChange(0,4),null);assert(Math.abs(lactateChange(6,4)-100/3)<1e-10);assert.equal(lactateChange(4,''),null);
const base={id:'DEMO-001',device:'VA-ECMO',time:'10:00',map:72,lactate:6,previousLactate:3,urine:15,hours:1,weight:60,cold:'yes',mental:'sedated',response:'unknown',intervention:'yes',escalation:'unknown',urgent:'no',site:'右橈骨動脈'};
assert.equal(assess(base).stage,'C');assert(assess(base).missing.includes('初期治療の内容・時刻・反応'));
assert.equal(assess({...base,response:'worse',escalation:'yes'}).stage,'D');
assert.equal(assess({...base,urgent:'yes',lactate:'',urine:''}).urgent,true);
assert.equal(assess({...base,lactate:'',urine:'',cold:'unknown',mental:'unknown',intervention:'unknown'}).stage,null);
assert.equal(forrester(1.8,24,true).group,'IV');assert.equal(forrester(2.5,12,true).group,'I');assert.equal(forrester(2.5,24,true).group,'II');assert.equal(forrester(1.8,12,true).group,'III');assert.equal(forrester(2.2,18,true).boundary,true);assert.equal(forrester('',18,true),null);assert.equal(forrester(1.8,24,false),null);
const zero={...base,lactate:0,urine:0};assert(makeReport(zero,assess(zero)).includes('→ 0 mmol/L'));assert(makeReport(zero,assess(zero)).includes('尿量 0 mL'));
console.log('Passed: calculations, missing values, escalation, emergency, Forrester quadrants and report zero values.');

assert.equal(assess({...base,site:'不明',response:'worse',escalation:'yes'}).stage,null);
assert.equal(number('  '),null);
