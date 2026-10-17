import assert from 'node:assert/strict';import {guides,glossary} from '../../public/intensive-care/guides.mjs';
assert.deepEqual(Object.keys(guides),['scai','forrester','nohria','killip']);
assert.deepEqual(guides.scai.rows.map(r=>r[0]),['A','B','C','D','E']);
assert.deepEqual(guides.forrester.rows.map(r=>r[0]),['I','II','III','IV']);
assert.deepEqual(guides.nohria.rows.map(r=>r[0]),['A','B','L','C']);
assert.deepEqual(guides.killip.rows.map(r=>r[0]),['I','II','III','IV']);
for(const g of Object.values(guides)){for(const k of ['one','look','point','caution','example'])assert(g[k]?.length>0);assert(g.sources.length>0);for(const [title,url] of g.sources){assert(title);assert(new URL(url).protocol==='https:')}}
assert(guides.forrester.caution.includes('CVP'));assert(guides.killip.caution.includes('自動採点せず'));assert(guides.nohria.example.includes('SCAIのCとは別'));assert(glossary.some(g=>g[0].includes('低灌流')));
console.log('Passed: four guides, stage ordering, sources, terminology and interpretation cautions. Clinical wording still needs local review.');
