import {test,expect} from '@playwright/test';
async function demo(page:import('@playwright/test').Page){await page.goto('/#respiratory');await page.getByText('開発・動作確認',{exact:true}).click();await page.getByRole('button',{name:'デモを試す',exact:true}).click();await page.getByRole('button',{name:'デモ例を読み込む',exact:true}).click();}
test('一画面の入力・結果・5項目と変更時リセット',async({page})=>{await demo(page);await page.getByRole('button',{name:'デモ結果を見る →'}).click();await expect(page.getByText('総合：計算上の資源余裕あり',{exact:true})).toBeVisible();const check=page.getByRole('checkbox').first();await check.check();await page.getByLabel('⑤ 搬送予定時間',{exact:true}).fill('11');await expect(check).not.toBeChecked();await expect(page.getByText('総合：計算上の資源余裕あり',{exact:true})).toHaveCount(0);await page.reload();await expect(page.getByLabel('① 酸素ボンベ残圧',{exact:true})).toHaveValue('');});
test('保留中も不足を表示',async({page})=>{await demo(page);await page.getByLabel('① 酸素ボンベ残圧',{exact:true}).fill('1');await page.getByText('デモの追加条件',{exact:true}).click();await page.getByLabel('架空電源の使用可能時間',{exact:true}).fill('');await page.getByRole('button',{name:'デモ結果を見る →'}).click();await expect(page.getByText('総合：判定保留',{exact:true})).toBeVisible();await expect(page.getByText('酸素：140 L不足',{exact:true})).toBeVisible();});
test('実機3機種のみ・5入力・機種切替・デモ分離',async({page})=>{await demo(page);await page.getByRole('button',{name:'実機の準備確認へ戻る',exact:true}).click();await expect(page.getByLabel('使用する機器').locator('option')).toHaveCount(3);await expect(page.getByLabel('使用する機器').locator('option')).toHaveText(['MONNAL T60','Philips V60','アコマ ART-70']);await expect(page.getByLabel('計算方法',{exact:true})).toHaveCount(0);await page.getByLabel('使用する機器').selectOption('art70');await expect(page.getByLabel('FiO₂',{exact:true})).toHaveValue('');await page.getByRole('button',{name:'酸素の使用可能時間を計算する →'}).click();await expect(page.getByRole('region',{name:'搬送用酸素の参考結果'})).toBeVisible();});
test('レスポンシブと外部保存なし',async({page})=>{await demo(page);for(const width of [320,375,768,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}await page.getByRole('button',{name:'デモ結果を見る →'}).click();expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);expect(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length)).toBe(0);await page.screenshot({path:'docs/demo-result.png',fullPage:true});});

test('スマートフォンではデモを隠し、主要入力を一列表示',async({page})=>{await page.setViewportSize({width:375,height:812});await page.goto('/#respiratory');await expect(page.getByRole('button',{name:'デモを試す',exact:true})).not.toBeVisible();const fields=page.locator('.grid').first().locator('.field');const boxes=await fields.evaluateAll(nodes=>nodes.map(n=>({x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y})));expect(new Set(boxes.map(b=>b.x)).size).toBe(1);expect(boxes.every((b,i)=>i===0||b.y>boxes[i-1].y)).toBe(true);await page.getByLabel('① 酸素ボンベ残圧',{exact:true}).fill('10');await page.getByText('開発・動作確認',{exact:true}).click();await page.getByRole('button',{name:'デモを試す',exact:true}).click();await page.getByRole('button',{name:'実機の準備確認へ戻る',exact:true}).click();await expect(page.getByLabel('① 酸素ボンベ残圧',{exact:true})).toHaveValue('');await page.screenshot({path:'docs/mobile-layout.png',fullPage:true});});


async function fill(page:import('@playwright/test').Page,id:string){await page.getByLabel('使用する機器').selectOption(id);await page.getByLabel('FiO₂',{exact:true}).fill('100');await page.getByLabel('分時換気量（MV）',{exact:true}).fill('10');if(id!=='monnal-t60')await page.getByLabel('総リーク量（Tot.Leak）',{exact:true}).fill('30');await page.getByLabel('① 酸素ボンベ残圧',{exact:true}).fill('11');}
async function calculate(page:import('@playwright/test').Page){await page.getByRole('button',{name:'酸素の使用可能時間を計算する →'}).click();}
test('3機種の追加フローなし・予備圧欄なし・安全係数0.8初期値',async({page})=>{
 await page.goto('/#respiratory');
 for(const id of ['v60','art70','monnal-t60']){
  await fill(page,id);await expect(page.getByLabel('計算で残す圧力（施設の予備圧力）',{exact:true})).toHaveCount(0);
  await page.getByText('安全係数・固定条件',{exact:true}).click();await expect(page.getByLabel('安全係数',{exact:true})).toHaveValue('0.8');
  await calculate(page);const r=page.getByRole('region',{name:'搬送用酸素の参考結果'});
  await expect(r.locator('.usage-time')).toContainText(id==='monnal-t60'?'29.9分':'7.4分');await expect(r.locator('.result-metrics')).toContainText(id==='monnal-t60'?'10 L/min':'40 L/min');
  await page.getByRole('checkbox').last().check();await page.getByLabel('安全係数',{exact:true}).fill('0.5');await expect(r).toHaveCount(0);await expect(page.getByRole('checkbox').last()).not.toBeChecked();await calculate(page);await expect(r.locator('.usage-time')).toContainText(id==='monnal-t60'?'18.7分':'4.6分');
  await page.getByLabel('安全係数',{exact:true}).fill('');await calculate(page);await expect(r.locator('.usage-time')).toContainText('未計算');await expect(r.getByRole('alert')).toContainText('安全係数');
  await page.getByText('安全係数・固定条件',{exact:true}).click();
 }
});
test('MONNAL方式切替・コピー・入力変更時無効化',async({page})=>{
 await page.goto('/#respiratory');await fill(page,'monnal-t60');await calculate(page);
 const r=page.getByRole('region',{name:'搬送用酸素の参考結果'});
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);await r.getByRole('button',{name:'計算条件と結果をコピー',exact:true}).click();const report=await page.evaluate(()=>navigator.clipboard.readText());expect(report).toContain('残す圧力0 MPa');expect(report).toContain('安全係数 0.8');expect(report).not.toContain('追加5');
 await page.getByLabel('使用方法',{exact:true}).selectOption('niv');await expect(r).toHaveCount(0);await page.getByLabel('吸気分時換気量（MVi）',{exact:true}).fill('10');await calculate(page);await expect(r.locator('.usage-time')).toContainText('29.9分');
 await page.getByLabel('使用方法',{exact:true}).selectOption('hfnc');await page.getByLabel('設定流量',{exact:true}).fill('40');await calculate(page);await expect(r.locator('.usage-time')).toContainText('7.4分');
});
test('スマートフォンの設定開閉・0圧・21%・非表示詳細の維持',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto('/#respiratory');await fill(page,'v60');await page.getByText('安全係数・固定条件',{exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByLabel('安全係数',{exact:true})).toBeVisible();await calculate(page);
 const r=page.getByRole('region',{name:'搬送用酸素の参考結果'});for(const title of ['100%時の参考値・予備酸素の準備目標','コピー用の記録を表示','仮定と利用上の注意','式・出典・未確認事項','承認状態・時刻（参考推算とは別）'])await expect(page.getByText(title,{exact:true})).not.toBeVisible();
 await page.getByLabel('① 酸素ボンベ残圧',{exact:true}).fill('0');await calculate(page);await expect(r.locator('.usage-time')).toContainText('0分');
 await page.getByLabel('FiO₂',{exact:true}).fill('21');await calculate(page);await expect(r.locator('.usage-time')).toContainText('未評価');
 for(const width of [320,375,768]){await page.setViewportSize({width,height:850});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
