---
name: novel-write
description: Use when generating a novel chapter draft in an ai-writing-style repository — reads a project's plot.md, characters.yaml, and a chapter instruction file, then writes the generated prose draft to projects/<name>/output/chapter_<n>.txt.
---

# novel-write

## Overview

`projects/<name>/` に用意された章の指定内容（chapter file）・キャラクター設定・全体プロットを読み込み、その章の草案（地の文＋会話文）を生成して `output/chapter_<n>.txt` に保存する。プロジェクトの雛形自体を作る場合は novel-init スキルを使う（このスキルは既存プロジェクトの章生成が対象）。

## Argument Parsing

呼び出しは `--project <name> --file <chapter-file> --chapter <n>` の形式（順不同）。

- `--project` と `--file` は必須。欠けている場合は対話的にユーザーへ質問して補完する。値を推測して埋めない。
- `--project` は `projects/` 配下の実在するディレクトリ名であること。存在しなければユーザーに確認する。
- `--chapter` は省略可。省略された場合は章ファイルの Front Matter の `chapter` 値を使う（Step 2 参照）。`--chapter` が指定された場合はそちらが Front Matter より優先される。**両方とも値が無い場合のみ**、ユーザーに章番号を質問する。

## Steps

1. **パス解決**

   | 対象 | パス |
   |------|------|
   | 全体プロット | `projects/<project>/plot.md`（無ければスキップ） |
   | キャラクター設定 | `projects/<project>/characters.yaml`（無ければスキップ） |
   | 章ファイル | `projects/<project>/chapters/<file>`（必須） |
   | 出力先 | `projects/<project>/output/chapter_<chapter>.txt` |

2. **章ファイルを読む**（必須）
   先頭の YAML Front Matter（`---` で囲まれた部分）をメタデータとして解析する。
   - `chapter`: 章番号。`--chapter` 引数が与えられていればそちらを優先する
   - `characters`: この章に登場するキャラクター名のリスト
   Front Matter 以降の本文が、その章で描く場面・出来事・情景・感情の指定内容。

3. **キャラクター設定を読む**（`characters.yaml` が存在する場合）
   章ファイルの `characters` リストに列挙された名前と**完全一致**するキーのみを抽出する。一致しない名前があれば、キーの表記揺れ（全角/半角スペース、敬称など）を疑ってユーザーに確認する。抽出した各キャラクターの属性（年齢・性格・口調・外見など、キーは自由）をそのまま執筆時の設定として使う。

4. **全体プロットを読む**（`plot.md` が存在する場合）
   あらすじ・テーマ・章構成を、その章が全体の中でどう位置づくかの背景情報として使う。

5. **草案を執筆する**
   - 日本語の小説形式（地の文＋会話文）で書く。ハードコードされたテンプレート文は使わない
   - 各キャラクターの口調・性格設定を厳密に守る。特に口調（語尾・方言・敬語レベル）は指定通りに再現する
   - 章ファイル本文で指定された場面・出来事・演出上の指示（箇条書きの指示を含む）を必ず反映する
   - `plot.md` があれば、その章が担う役割（伏線・展開の位置づけ）と矛盾しない内容にする
   - 分量の指定が章ファイルに無ければ、1章として自然な長さ（目安2000〜4000文字、日本語の文字数でカウント）で書く。ただし場面が短く済む指示ならそれより短くてよい — 文字数を埋めるための水増しはしない
   - `characters` リストに含まれるが、場面上ずっと台詞を持たない/退場が早いキャラクターについては、口調設定を無理に台詞で実演する必要はない。仕草・行動・地の文での描写（例: 話し方の癖が滲む一言だけ入れる、去り際の動作で性格を示す）で存在感を示せば足りる
   - 出力冒頭に章タイトル行（例: `第一章　○○`）を含める。タイトルは章ファイル本文の指示から推測するか、無ければ内容に即して簡潔に付ける

6. **出力する**
   `projects/<project>/output/` が無ければ作成し、`chapter_<chapter>.txt` に本文のみ（YAML Front Matter なし。5番目のタイトル行は含む）を書き込む。生成後、保存先パスをユーザーに報告する。

## Common Mistakes

| 症状 | 原因 |
|------|------|
| キャラクターの口調が違う/反映されない | `characters.yaml` のキーと章ファイルの `characters` リストが不一致。表記揺れをまず疑う |
| 話の筋が全体プロットと矛盾する | `plot.md` を読まずに章ファイルの指示だけで書いている |
| 出力先が見つからない | `output/` は自動作成対象。無ければ作ってから書き込む |
| 引数が一部欠けている | 推測で埋めず、対話的に質問して補完する（`--chapter` は Front Matter で代用可なので対象外） |
