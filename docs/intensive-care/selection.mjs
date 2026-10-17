import {defaults} from './workflow.mjs';
export const classificationOptions=[{id:'scai',name:'SCAI SHOCK',label:'ショックの重さを確認したい',description:'SCAI分類 ／ 血液の巡りと治療への反応'},{id:'forrester',name:'Forrester',label:'心拍出量と肺うっ血を確認したい',description:'Forrester分類 ／ CI・PAWPを測定している場合'},{id:'nohria',name:'Nohria–Stevenson',label:'体の所見から血液の巡り・うっ血を確認したい',description:'Nohria–Stevenson分類 ／ チームで確認した所見を使用'},{id:'killip',name:'Killip',label:'心筋梗塞に伴う心不全の程度を確認したい',description:'Killip分類 ／ 担当医の評価を表示'}];
export const classificationFields={scai:['map','lactate','site','urine','hours','weight','cold','mental','intervention','response','escalation','urgent'],forrester:['ci','pawp','hemoMode','hemoValid','pawpValid'],nohria:['cold','wet'],killip:['ami','killip']};
export const commonFields=['time','ecmo','ecmoMode','iabp','impella'];
export function activeFields(selected){return new Set([...commonFields,...selected.flatMap(id=>classificationFields[id]||[])])}
export function selectedData(data,selected){const out={...defaults};for(const key of activeFields(selected))out[key]=data[key]??defaults[key];return out}
