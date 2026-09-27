# ai-writing プロジェクト概要

Claude Code の skill を使用した小説の章草案生成ツール。

## 使い方

```bash
/novel-write --project <project-name> --file <chapter-file> [--chapter <chapter-number>]
```

`--chapter` は省略可（章ファイルの Front Matter の `chapter` を使用）。

**例：**
```bash
/novel-write --project novel_A --file chapter1.md --chapter 1
```

## ディレクトリ構成

```
projects/
  <project-name>/
    plot.md              # 作品全体のプロット（省略可）
    characters.yaml      # キャラクター設定（省略可）
    chapters/
      <chapter-file>.md  # 章の指定内容（Front Matter + 本文）
    output/
      chapter_<n>.txt    # 生成された章草案
```

`projects/` 配下はサンプルの `novel_A` のみ Git 管理対象（`output/` は novel_A も含め管理対象外）。

## 章ファイルの書き方

```markdown
---
chapter: 1
characters:
  - キャラクター名A
  - キャラクター名B
---

章の指定内容をここに記述する。
登場シーン、展開の要点、情景の指示などを自由に書く。
```

## characters.yaml の書き方

```yaml
キャラクター名:
  年齢: 28
  職業: 気象観測士
  性格: 理屈っぽいが根は優しい
  口調: 丁寧語と砕けた言葉が混在
  外見: 細身で眼鏡をかけている
```

## スキルの場所

- `.claude/skills/novel-write/SKILL.md` — 既存プロジェクトの章草案を生成する（上記コマンド）
- `.claude/skills/novel-init/SKILL.md` — 新しいプロジェクトを立ち上げる（`projects/<name>/` の雛形作成）

どちらもこのリポジトリ内スコープのスキル。スキルの動作を変更したい場合（執筆指示・出力フォーマットなど）は該当ファイルを編集する。
