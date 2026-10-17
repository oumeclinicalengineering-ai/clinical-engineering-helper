import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import * as engine from '../../public/intensive-care/engine.mjs';import * as workflow from '../../public/intensive-care/workflow.mjs';import * as selection from '../../public/intensive-care/selection.mjs';import * as education from '../../public/intensive-care/guides.mjs';import * as figures from '../../public/intensive-care/guide-figures.mjs';
const app={innerHTML:''},live={innerHTML:''},error={textContent:''},time={textContent:''};
const context={...engine,...workflow,...selection,...education,...figures,console,Set,Number,String,Array,Date,JSON,Math,document:{getElementById:id=>id==='app'?app:null,querySelectorAll:()=>[],querySelector:s=>({'#results-body':live,'#input-error':error,'#result-time':time}[s]??null)}};
vm.createContext(context);vm.runInContext(fs.readFileSync('public/intensive-care/app.js','utf8').replace(/^import .*;\n/gm,''),context);
const html=()=>app.innerHTML;
assert(html().includes('何を確認したいですか？'));
assert(html().includes('id="input-form"'));assert(html().includes('id="results-body"'));
for(const text of ['改善・離脱','data-step','data-target','data-sim','3ステップ','STEP 01','improvementPage'])assert(!html().includes(text),text);
assert.equal((html().match(/type="number"/g)||[]).length,5);
for(const key of ['map','lactate','urine','hours','weight'])assert(html().includes(`id="${key}"`));
for(const key of ['hr','co','ci','spo2','etco2','ecmoFlow','svv'])assert(!html().includes(`id="${key}"`),key);
assert(!html().includes('id="response"'));
for(const id of ['scai','forrester','nohria','killip']){
 vm.runInContext(`selected=['${id}'];d=selectedData(sample,selected);render()`,context);
 const ids=[...html().matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate id');
 assert(html().includes('id="input-form"'));assert(html().includes('id="results-body"'));
 assert(!html().includes('undefined'));assert(!html().includes('NaN'));
}
vm.runInContext("selected=['forrester'];d=selectedData(sample,selected);d.hemoValid=true;d.pawpValid=true;render()",context);assert(html().includes('区分 IV'));assert(!html().includes('<h2>SCAI SHOCK</h2>'));
vm.runInContext("d.ci=2.3;d.pawp=16;refreshResults()",context);assert(live.innerHTML.includes('区分 I'));
vm.runInContext("selected=['scai'];d=selectedData(sample,selected);d.hours=0;refreshResults()",context);assert(live.innerHTML.includes('入力内容を確認してください'));assert(!live.innerHTML.includes('class-state'));assert(error.textContent.includes('集計時間'));
vm.runInContext("d.hours=1;refreshResults()",context);assert(live.innerHTML.includes('SCAI SHOCK'));assert.equal(error.textContent,'');
vm.runInContext("selected=['scai','nohria'];render()",context);assert.equal((html().match(/id="cold"/g)||[]).length,1);assert(html().includes('id="wet"'));
vm.runInContext("selected=['scai','forrester','nohria','killip'];d=selectedData(sample,selected);render()",context);assert.equal((html().match(/class="classification-card"/g)||[]).length,4);
assert(html().includes('分類の意味と各段階をやさしく見る'));assert(html().includes('よく出てくる言葉'));assert.equal((html().match(/data-guide=/g)||[]).length,4);assert.equal((html().match(/data-guide-details=/g)||[]).length,4);
assert.equal((html().match(/<figure /g)||[]).length,4);assert(html().includes('肺側の圧は低い側'));assert(html().includes('肺側の圧は高い側'));
console.log('Passed: unified form/results, no improvement outputs, plain-language choices, 5 default numeric fields, selected-class rendering, live result updates and invalid-input gating. Browser QA not run.');
