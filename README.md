## 0.18.1 画面の整理
呼吸器業務の「3. 出発前に確認する」欄を削除し、関連する操作ガイドも更新。計算式は変更していません。

## 0.18.0 計算条件の変更
人工呼吸器搬送の追加5 L/minを削除。V60・ART-70は Q=(MV+Tot.Leak)×(FiO₂−21)/79、MONNAL T60挿管・NIVは Q=MV（NIVではMVi）×(FiO₂−21)/79、HFNCは設定流量を使用。
使用可能酸素量=34×現在残圧、残す圧力は0 MPa固定。使用可能時間=使用可能酸素量÷Q×安全係数。安全係数は「安全係数・固定条件」内で変更でき、初期値0.8、数学的な入力制限は0より大きく1以下。消費流量自体には掛けません。入力変更で旧結果とチェックを無効化します。
0.8は依頼者指定の仮定であり保証性能ではありません。残圧0までの理論量を扱い、減圧弁の作動下限・交換準備・追加内部消費は含みません。実機試験・臨床承認を示しません。以下の過去仕様と異なる場合、本節と現行コードを優先してください。

# 臨床工学科 業務おたすけくん

科内業務を支援する開発用Webアプリです。最新版 0.18.1。React + TypeScript + Viteを使用しています。

- 血液浄化：PE置換量・製剤数の参考計算（OP-08D、FFP・5%アルブミン）。
- 呼吸器業務：MONNAL T60・V60・ART-70の酸素使用可能時間。
- 機器管理：アイノフローDS 800 ppm・88型、200 psi交換までの日数・時間。
- 全ページにMEサポくんの操作ガイドを配置。スマートフォン・タブレット・PCに対応。

本リポジトリはおたすけくん専用です。従来のV60用リポジトリとは別管理です。Sites版 0.17.1（ソースd9e842f7e7aadcee9c467ae7ea37d70acb7a719c）から、アプリの機能・計算式を変更せず移行しています。

## GitHub Pagesで開く

公開用ファイルは **docs/** に準備済みです。最初の1回だけ、リポジトリ管理者が次を設定してください。

1. [Settings → Pages](https://github.com/oumeclinicalengineering-ai/clinical-engineering-helper/settings/pages)
2. Source：**Deploy from a branch**
3. Branch：**main**、フォルダー：**/docs**
4. **Save**

公開処理が完了すると、Pages画面に「Your site is live at」が表示されます。公開前は下記URLが404になる場合があります。

設定後のアプリURL：https://oumeclinicalengineering-ai.github.io/clinical-engineering-helper/

直接GitHubリポジトリのURLや.gitのURLを開いてもアプリは起動しません。アプリの利用は上記PagesのURLです。PublicリポジトリのソースとPagesサイトはインターネット上で閲覧できます。

## ローカル起動・更新

Node.js 22.12以上、npmを使用します。

```sh
npm ci
npm run dev
```

ソースを編集後、GitHub Pages用のファイルも更新します。

```sh
npm run export:pages
```

この操作はビルド済みdistをdocsへコピーし、.nojekyllを作ります。更新されたソースとdocsを一緒にGitHubへ保存してください。ブラウザのGitHub画面で編集しただけでは再ビルドされません。

## 検証

```sh
npm test
npm run build
npm run test:e2e
```

計算・判定153件、操作・表示18件がこれまでの更新で合格。18件は従来15件、全ページのレイアウト・PE維持2件、ナビゲーションの位置統一1件です。PlaywrightはChromiumを使用し、必要なら `npx playwright install chromium` を実行します。ソフトウェア試験と実機試験・臨床承認は別です。

## 計算と情報管理

結果は入力条件・仮定に基づく参考値です。治療設定の推奨、機器制御、患者の搬送可否の自動決定を行いません。実機検証や院内承認が新たに成立したことを示しません。患者名・患者IDは入力せず、変動入力はブラウザ内の一時状態のみで保持し、ページ移動・再読み込みで消去します。入力値をURL・解析・外部ログへ送信しません。

計算式、適用範囲、未確定事項、停止・再検証手順、実装経緯は [DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md) を参照してください。履歴中の古い画面/旧公開先の説明は当時の記録です。現行の公開手順はこのREADMEを優先します。
