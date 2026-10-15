import {cpSync,existsSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const docs=fileURLToPath(new URL('../docs/',import.meta.url));
if(!existsSync(new URL('../dist/index.html',import.meta.url)))throw new Error('先にnpm run buildを実行してください');
rmSync(docs,{recursive:true,force:true});mkdirSync(docs,{recursive:true});cpSync(dist,docs,{recursive:true});writeFileSync(new URL('../docs/.nojekyll',import.meta.url),'');
console.log('GitHub Pages用のdocsを更新しました。');
