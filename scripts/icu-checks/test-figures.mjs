import assert from 'node:assert/strict';import {guideFigure} from '../../public/intensive-care/guide-figures.mjs';
for(const id of ['scai','forrester','nohria','killip']){const h=guideFigure(id);assert(h.includes('<figure '));assert(h.includes('<figcaption>'));assert(h.includes('aria-label='));assert(!h.includes('undefined'));assert(!h.includes('<input'));assert(!h.includes('id="'),'no repeated SVG IDs between inline and modal diagrams')}
const f=guideFigure('forrester');for(const n of ['I','III','II','IV'])assert(f.includes('<span>'+n+'</span>'));assert(f.indexOf('<span>I</span>')<f.indexOf('<span>III</span>'));assert(f.indexOf('<span>III</span>')<f.indexOf('<span>II</span>'));assert(f.includes('CI ≥2.2'));assert(f.includes('PAWP &gt;18'));
const n=guideFigure('nohria');for(const value of ['warm / dry','cold / dry','warm / wet','cold / wet'])assert(n.includes(value));
const s=guideFigure('scai');assert(s.includes('BとCの境目'));assert(s.includes('CとDの境目'));assert(s.includes('全員がAから順番に進むわけではありません'));
const k=guideFigure('killip');assert.equal((k.match(/<svg /g)||[]).length,4);assert(k.includes('模式図'));assert.equal(guideFigure('other'),'');
console.log('Passed: four original figures, textual descriptions, correct matrix ordering, distinct stage boundaries, no duplicate IDs or numerical inputs.');
