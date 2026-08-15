---
name: novel-init
description: Use when starting a brand-new novel project in this ai-writing repository — before the first chapter can be drafted, projects/<name>/ needs to be scaffolded with characters.yaml, plot.md, and chapters/chapter1.md so /novel-write can generate output.
---

# novel-init

## Overview

`ai-writing` リポジトリで新しい小説プロジェクトを立ち上げる手順。`projects/<name>/` の雛形を作り、`/novel-write` が動く状態にするまでを扱う。既存プロジェクトへの章追加・再生成はこのスキルの対象外（`/novel-write` を直接使う）。

## Steps

1. **ディレクトリ作成**
   ```bash
   mkdir -p projects/<name>/chapters
   ```

2. **`characters.yaml` を作成**（省略可、ただし精度のため強く推奨）
   登場人物名をトップレベルキーにし、属性は自由記述（`年齢`・`職業`・`性格`・`口調`・`外見` など）。属性名はそのままプロンプトに挿入される。

3. **`plot.md` を作成**（省略可）
   あらすじ・テーマ・章構成を記述。章構成は `### 第N章：タイトル` の形式で書くと後続の章ファイル作成がしやすい。

4. **`chapters/chapter1.md` を作成**
   YAML Front Matter（`chapter`, `characters`）+ 本文（場面・出来事・情景・感情の指示）。`characters` に列挙する名前は `characters.yaml` のキーと**完全一致**させる。

5. **草案を生成**
   ```
   /novel-write --project <name> --file chapter1.md --chapter 1
   ```
   `/novel-write` が現在の環境に見つからない場合、雛形作成（Step 1-4）自体は完了しているので、そこで作業を止めて未実装である旨をユーザーに報告する。代替コマンドを勝手に作らない。

6. **出力を確認**
   `projects/<name>/output/chapter_1.txt`（自動生成、`.gitignore` 対象）

## Templates

`characters.yaml`:
```yaml
キャラクター名:
  年齢: 28
  職業: ...
  性格: ...
  口調: ...
  外見: ...
```

`plot.md`:
```markdown
# 作品タイトル ― 作品全体のプロット

## あらすじ
...

## テーマ
...

## 章構成

### 第1章：タイトル
...
```

`chapters/chapter1.md`:
```markdown
---
chapter: 1
characters:
  - キャラクター名A
  - キャラクター名B
---

【第1章：タイトル】

場面・出来事・情景・感情の流れを記述する。
- 箇条書きで演出上の指示を追加してもよい
```

## Common Mistakes

| 症状 | 原因 |
|------|------|
| キャラクターの口調・性格が草案に反映されない | `chapter*.md` の `characters` リストの名前が `characters.yaml` のキーと不一致（全角/半角スペースの混入、敬称の有無などの表記揺れも含む） |
| 草案の精度が低い | `plot.md`/`characters.yaml` を省略している。省略可だが、省略時はその旨とトレードオフをユーザーに伝える |
| 出力が見つからない | `output/` は自動作成・`.gitignore` 対象。生成コマンド実行後に確認する |

## Quick Reference

| 対象 | パス |
|------|------|
| プロジェクトルート | `projects/<name>/` |
| キャラクター設定 | `projects/<name>/characters.yaml` |
| 全体プロット | `projects/<name>/plot.md` |
| 章ファイル | `projects/<name>/chapters/<file>.md` |
| 出力 | `projects/<name>/output/chapter_<n>.txt` |
