# ai-writing

Gemini APIを使用した小説の章草案生成CLIツール。
プロット（Markdown）とキャラクター設定（YAML）を用意するだけで、指定した章の草案を自動生成します。
複数の作品プロジェクトを1つのリポジトリで管理できます。

---

## 目次

1. [セットアップ](#セットアップ)
2. [はじめての実行](#はじめての実行)
3. [新しいプロジェクトの追加](#新しいプロジェクトの追加)
4. [CLIリファレンス](#cliリファレンス)
5. [ファイル仕様](#ファイル仕様)
6. [ディレクトリ構造](#ディレクトリ構造)

---

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. APIキーの設定

```bash
cp .env.example .env
```

`.env` を開いて以下を編集します。

```
GEMINI_API_KEY=your_actual_api_key_here
```

> APIキーは [Google AI Studio](https://aistudio.google.com/) で取得できます（無料枠あり）。

---

## はじめての実行

リポジトリには `novel_A` というサンプルプロジェクトが入っています。
セットアップ後、以下のコマンドですぐに動作確認できます。

```bash
npm run start
```

これは次のコマンドと同等です。

```bash
node src/index.js --project novel_A --plot chapter1.md --chapter 1
```

生成された草案は `projects/novel_A/output/chapter_1.txt` に保存されます。

---

## 新しいプロジェクトの追加

### 1. ディレクトリを作成する

```bash
mkdir -p projects/my_novel/plots
```

### 2. キャラクター設定を作成する（`projects/my_novel/characters.yaml`）

```yaml
主人公の名前:
  年齢: 25
  性格: 好奇心旺盛
  口調: 語尾に「ね」「よ」を多用する

ライバルの名前:
  年齢: 27
  性格: 冷静沈着
  口調: 丁寧語、短い文が多い
```

### 3. プロットファイルを作成する（`projects/my_novel/plots/chapter1.md`）

```markdown
---
chapter: 1
characters:
  - 主人公の名前
  - ライバルの名前
---

第1章の内容をここに記述します。
どんな場面か、何が起きるかを書いておくと精度が上がります。
```

### 4. 草案を生成する

```bash
node src/index.js --project my_novel --plot chapter1.md --chapter 1
```

出力先: `projects/my_novel/output/chapter_1.txt`（ディレクトリは自動作成されます）

---

## CLIリファレンス

### 構文

```bash
node src/index.js -P <プロジェクト名> -p <プロットファイル名> -c <章番号> [-m <モデル>]
```

### オプション

| オプション | 短縮 | 説明 | 必須 |
|-----------|------|------|------|
| `--project <name>` | `-P` | プロジェクト名（`projects/` 配下のディレクトリ名） | ✅ |
| `--plot <filename>` | `-p` | プロットファイル名（`plots/` 配下のファイル名のみ） | ✅ |
| `--chapter <number>` | `-c` | 生成対象の章番号または名前 | ✅ |
| `--model <type>` | `-m` | 使用モデル（後述）。省略時は `flash` | |

### --model の選択肢

| 値 | モデル | 特徴 |
|----|--------|------|
| `flash`（デフォルト） | gemini-2.5-flash | 高速・低コスト。動作確認に最適 |
| `pro` | gemini-2.5-pro | 高品質・高精度。仕上げに最適 |

### パス解決の規則

コマンド実行時、各ファイルのパスは以下のように自動解決されます。

| 対象 | 解決されるパス |
|------|--------------|
| キャラクター設定 | `projects/<project>/characters.yaml` |
| プロットファイル | `projects/<project>/plots/<filename>` |
| 出力先 | `projects/<project>/output/chapter_<章番号>.txt` |

### 実行例

```bash
# 基本的な実行
node src/index.js -P novel_A -p chapter1.md -c 1

# proモデルで第2章を生成
node src/index.js -P novel_A -p chapter2.md -c 2 -m pro

# 別プロジェクトで実行
node src/index.js -P my_novel -p chapter1.md -c 1
```

---

## ファイル仕様

### plots/\*.md（プロットファイル）

ファイル冒頭に YAML Front Matter を記述します。`---` で囲まれた部分がメタデータとして解析され、残りがプロット本文としてGeminiに送信されます。

```markdown
---
chapter: 1
characters:
  - キャラクター名A
  - キャラクター名B
---

プロット本文をここに記述します。
場面の状況・出来事・感情の流れなどを書いておくと
より精度の高い草案が生成されます。
```

| キー | 型 | 説明 |
|------|----|------|
| `chapter` | 数値または文字列 | 章の識別子。`--chapter` オプションで上書き可能 |
| `characters` | 文字列のリスト | この章の登場人物。`characters.yaml` のキーと一致させること |

### characters.yaml（キャラクター設定ファイル）

キャラクター名をトップレベルのキーとして、属性を自由に定義します。
`plots/*.md` の Front Matter に列挙された名前のみがプロンプトに組み込まれます。

```yaml
太郎:
  年齢: 20
  性格: 直情型、行動が先走りがち
  口調: 語尾に「だ」「な」を多用する

花子:
  年齢: 19
  性格: 冷静沈着、物事を論理的に考える
  口調: 丁寧語、「～ですね」「～でしょうか」
```

属性名（`年齢`, `性格`, `口調` など）はプロンプトにそのまま挿入されるため、自由に追加・変更できます。

---

## ディレクトリ構造

```
ai-writing/
├── src/
│   ├── index.js          # エントリポイント・CLIオプション定義
│   ├── gemini.js         # Gemini API呼び出しロジック
│   └── fileUtils.js      # ファイル読み書き・YAML/Front Matter解析
├── projects/             # 作品ごとのプロジェクトディレクトリ
│   └── novel_A/          # サンプルプロジェクト
│       ├── characters.yaml
│       ├── plots/
│       │   ├── chapter1.md
│       │   └── chapter2.md
│       └── output/       # 生成された草案（自動作成）
├── .env                  # APIキー設定（要作成・Git管理外）
├── .env.example          # APIキー設定のテンプレート
└── package.json
```
