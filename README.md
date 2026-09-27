# ai-writing

Claude Code のスキルを使って、小説の章草案を生成するツールです。
章ごとの指定内容（Markdown）を用意するだけで草案を生成できます。キャラクター設定（YAML）と全体プロット（Markdown）を加えると、口調や物語全体との整合性が高まります。
複数の作品を 1 つのリポジトリで管理できます。

## 必要なもの

[Claude Code](https://claude.ai/code) がインストールされていれば、すぐに使えます。

## まず試す

サンプルプロジェクト `novel_A` が入っています。Claude Code で次を実行してください。

```
/novel-write --project novel_A
```

`novel_A` の全章の草案が `projects/novel_A/output/<実行日時>/` に生成されます。

## 自分の作品を書く

### 1. ファイルを用意する

`projects/<作品名>/` に次のファイルを置きます。`/novel-init` を実行すると、雛形を対話的に作れます。

| ファイル | 必須 | 内容 |
|---------|------|------|
| `chapters/<章ファイル>.md` | ✅ | 章番号・登場人物と、その章で描く場面・出来事の指示。章の数だけ作る |
| `characters.yaml` | 省略可（推奨） | 登場人物の口調・性格などの設定 |
| `plot.md` | 省略可（推奨） | あらすじ・テーマ・章構成 |

見本は `projects/novel_A/` を参照してください。

**章ファイル**（例: `chapters/chapter1.md`）

```markdown
---
chapter: 1
characters:
  - 田中誠
  - 源爺
---

【第1章：霧の港】
誠がフェリーで島に到着する場面から始める。……

- 箇条書きで演出の指示を書いてもよい
```

**characters.yaml**

```yaml
田中誠:
  年齢: 28
  性格: 理屈っぽいが根は優しい
  口調: 丁寧語と砕けた言葉が混在。「……」を多用する
```

項目名（`年齢`・`口調` など）は自由です。口調は語尾や口癖まで具体的に書くほど再現されます。

### 2. 書くときの注意

- 章ファイルの `characters` に書く名前は、`characters.yaml` のキーと**完全一致**させてください（全角/半角スペースや敬称が違うと設定が読み込まれません）
- 分量の指定が無ければ、1 章あたり 2000〜4000 文字程度で書かれます。変えたい場合は章ファイルに書いてください
- 章をまたぐ細部（脇役の名前、呼び方、小道具など）は、生成済みの章を参照せずに書かれます。食い違いを防ぐには、プロットや章ファイルに明記してください

### 3. 生成する

```
# 全章を生成（章番号順に 1 章ずつ）
/novel-write --project <作品名>

# 1 章だけ生成
/novel-write --project <作品名> --file chapter3.md
```

草案は実行ごとに `projects/<作品名>/output/<YYYYMMDD-HHMMSS>/chapter_<章番号>.txt` に保存されます。以前の草案は上書きされません。

## Git の管理対象

`projects/` 配下はサンプルの `novel_A` を除いて Git の管理対象外です（`.gitignore`）。自分の作品や生成した草案はコミットされません。`output/` は Git で履歴が残らないため、残したい草案は各自でバックアップしてください。

## 詳しい動作

引数の扱い・パスの規則・執筆ルールなどの詳細は、各スキルの定義を参照してください。

- [`.claude/skills/novel-write/SKILL.md`](.claude/skills/novel-write/SKILL.md) — 章草案の生成
- [`.claude/skills/novel-init/SKILL.md`](.claude/skills/novel-init/SKILL.md) — 新しい作品の雛形作成
