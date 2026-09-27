# ai-writing

Claude Code の `/novel-write` スキルを使った小説章草案生成ツール。
章ごとの指定内容（Markdown）を用意するだけで、その章の草案を自動生成します。キャラクター設定（YAML）と全体プロット（Markdown）を加えると、口調や物語全体との整合性が高まります。
複数の作品プロジェクトを1つのリポジトリで管理できます。

---

## 目次

1. [セットアップ](#セットアップ)
2. [はじめての実行](#はじめての実行)
3. [準備するもの](#準備するもの)
4. [新しいプロジェクトの追加](#新しいプロジェクトの追加)
5. [コマンドリファレンス](#コマンドリファレンス)
6. [ファイル仕様](#ファイル仕様)
7. [ディレクトリ構造](#ディレクトリ構造)

---

## セットアップ

[Claude Code](https://claude.ai/code) が必要です。インストール済みであればすぐに使えます。

---

## はじめての実行

リポジトリには `novel_A` というサンプルプロジェクトが入っています。
Claude Code で以下のコマンドを実行してください。

```
/novel-write --project novel_A --file chapter1.md --chapter 1
```

生成された草案は `projects/novel_A/output/chapter_1.txt` に保存されます。

---

## 準備するもの

`/novel-write` を実行する前に、`projects/<プロジェクト名>/` に以下を用意します。

| ファイル | 必須 | 役割 |
|---------|------|------|
| `chapters/<章ファイル>.md` | ✅ | 章番号・登場人物（Front Matter）と、その章で描く場面・出来事の指示 |
| `characters.yaml` | 省略可（推奨） | 登場人物の口調・性格などの設定。口調は語尾・口癖まで具体的に書くほど再現される |
| `plot.md` | 省略可（推奨） | あらすじ・テーマ・章構成。各章が全体の筋と矛盾しないようにするための背景情報 |

- 章ファイルの `characters` に書く名前は、`characters.yaml` のキーと**完全一致**させてください（全角/半角スペースや敬称の有無が違うと設定が読み込まれません）
- 分量の指定が章ファイルに無い場合、1章あたり 2000〜4000 文字程度を目安に書かれます。長さを変えたい場合は章ファイル本文で指定してください
- 書き方の見本は `projects/novel_A/` を参照してください

---

## 新しいプロジェクトの追加

`/novel-init` スキルを使うと、以下の手順 1〜4 の雛形作成を Claude Code に任せられます。手動で用意する場合は次の手順に従ってください。

> `projects/` 配下はサンプルの `novel_A` を除いて Git の管理対象外（`.gitignore`）です。自作のプロジェクトはコミットされません。

### 1. ディレクトリを作成する

```bash
mkdir -p projects/my_novel/chapters
```

### 2. キャラクター設定を作成する（`projects/my_novel/characters.yaml`）省略可

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

### 3. 作品全体のプロットを作成する（`projects/my_novel/plot.md`）省略可

```markdown
# 作品タイトル ― 全体プロット

## あらすじ
...

## 章構成

### 第1章：...
...
```

### 4. 章ファイルを作成する（`projects/my_novel/chapters/chapter1.md`）

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

### 5. 草案を生成する

```
/novel-write --project my_novel --file chapter1.md --chapter 1
```

出力先: `projects/my_novel/output/chapter_1.txt`（ディレクトリは自動作成されます）

---

## コマンドリファレンス

### 構文

```
/novel-write --project <プロジェクト名> --file <章ファイル名> --chapter <章番号>
```

### オプション

| オプション | 説明 | 必須 |
|-----------|------|------|
| `--project <name>` | プロジェクト名（`projects/` 配下のディレクトリ名） | ✅ |
| `--file <filename>` | 章ファイル名（`chapters/` 配下のファイル名のみ） | ✅ |
| `--chapter <number>` | 生成対象の章番号。省略時は章ファイルの Front Matter の `chapter` を使用 | |

`--project` / `--file` を省略した場合、スキルが対話的に質問して補完します。`--chapter` は引数・Front Matter のどちらにも無い場合のみ質問されます。

### 実行例

```
# 基本的な実行
/novel-write --project novel_A --file chapter1.md --chapter 1

# 第2章を生成
/novel-write --project novel_A --file chapter2.md --chapter 2

# 引数なしで実行（対話式で収集）
/novel-write
```

### パス解決の規則

| 対象 | 解決されるパス |
|------|--------------|
| 全体プロット | `projects/<project>/plot.md` |
| キャラクター設定 | `projects/<project>/characters.yaml` |
| 章ファイル | `projects/<project>/chapters/<filename>` |
| 出力先 | `projects/<project>/output/chapter_<章番号>.txt` |

---

## ファイル仕様

### chapters/\*.md（章ファイル）

ファイル冒頭に YAML Front Matter を記述します。`---` で囲まれた部分がメタデータとして解析され、残りが章の指定内容として読み込まれます。

```markdown
---
chapter: 1
characters:
  - キャラクター名A
  - キャラクター名B
---

章の指定内容をここに記述します。
場面の状況・出来事・感情の流れなどを書いておくと
より精度の高い草案が生成されます。
```

| キー | 型 | 説明 |
|------|----|------|
| `chapter` | 数値または文字列 | 章の識別子。`--chapter` 引数で上書き可能 |
| `characters` | 文字列のリスト | この章の登場人物。`characters.yaml` のキーと一致させること |

### characters.yaml（キャラクター設定ファイル）

キャラクター名をトップレベルのキーとして、属性を自由に定義します。
章ファイルの Front Matter に列挙された名前のキャラクターのみが、その章の執筆に使われます。

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

属性名（`年齢`, `性格`, `口調` など）は決まっておらず、書いた内容がそのまま執筆時の設定として使われるため、自由に追加・変更できます。

---

## ディレクトリ構造

```
ai-writing/
├── projects/                    # 作品ごとのプロジェクトディレクトリ（novel_A 以外は Git 管理対象外）
│   └── novel_A/                 # サンプルプロジェクト
│       ├── plot.md              # 作品全体のプロット（省略可）
│       ├── characters.yaml      # キャラクター設定（省略可）
│       ├── chapters/
│       │   ├── chapter1.md
│       │   └── chapter2.md
│       └── output/              # 生成された草案（自動作成）
│           └── chapter_1.txt
├── .claude/skills/
│   ├── novel-write/SKILL.md     # 章草案生成スキル
│   └── novel-init/SKILL.md      # プロジェクト雛形作成スキル
├── CLAUDE.md                    # プロジェクト設定
└── README.md
```
