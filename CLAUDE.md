# ai-writing プロジェクト概要

Gemini APIを使用した小説の章草案生成CLIツール。

## 技術スタック
- ランタイム: Node.js (ES Modules)
- パッケージ管理: npm
- 主要ライブラリ: `@google/genai`, `commander`, `dotenv`

## ファイル構成

```
src/
  index.js      - CLIエントリポイント。commanderでオプション解析・フロー制御
  gemini.js     - Gemini API呼び出しロジック
  fileUtils.js  - プロット読み込みとファイル保存
data/
  plot.txt      - サンプルプロット（霧の中の灯台・5章構成）
output/         - 生成された草案の出力先（chapter_<章番号>.txt）
.env            - GEMINI_API_KEY を設定（要作成）
.env.example    - APIキー設定のテンプレート
```

## CLIオプション
| オプション | 説明 | 必須 |
|-----------|------|------|
| `-p, --plot <path>` | プロットファイルのパス | ✅ |
| `-c, --chapter <number/name>` | 生成対象の章 | ✅ |
| `-m, --model <type>` | `flash`（デフォルト）または `pro` | |

## モデル設定（src/gemini.js）
```js
const MODEL_MAP = {
  flash: 'gemini-2.5-flash',
  pro:   'gemini-2.5-pro',
};
```
モデルIDを変更する場合はここを編集する。

## トークン制限（src/gemini.js）
```js
const MAX_INPUT_CHARS  = 1000;   // プロット文字数の上限（超過するとエラー）
const MAX_OUTPUT_TOKENS = 1024;  // 出力トークン上限（約2000文字相当）
```

### 注意事項
- `maxOutputTokens` はハードカット（文章が途中で切れる）。「指定文字数に収める」機能ではない。
- 文字数に収めたい場合はプロンプトで文字数を指示するアプローチが有効。
- 入力トークンはAPIで直接制限できないため、`MAX_INPUT_CHARS` で文字数チェックを行う。

## npm スクリプト
```bash
npm run start     # data/plot.txt の第1章をflashで生成（デフォルト動作確認用）
npm run generate -- -p <path> -c <chapter> -m <model>  # 引数を自由に指定
```

## セットアップ
```bash
cp .env.example .env
# .env に GEMINI_API_KEY=実際のキー を設定
npm install
npm run start
```
