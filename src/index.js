#!/usr/bin/env node
import 'dotenv/config';
import path from 'path';
import { Command } from 'commander';
import { readPlot, readOverallPlot, readCharacters, extractCharacters, formatCharactersForPrompt, readFile, saveDraft } from './fileUtils.js';
import { generateChapterDraft } from './gemini.js';

const program = new Command();

program
  .name('ai-writing')
  .description('Gemini APIを使用した小説の章草案生成CLIツール')
  .version('1.0.0');

program
  .requiredOption('-P, --project <name>', 'プロジェクト名（projects/ 配下のディレクトリ名）')
  .requiredOption('-f, --file <filename>', '章ファイル名（chapters/ 配下のファイル名）')
  .requiredOption('-c, --chapter <number/name>', '生成対象の章（番号または名前）')
  .option('-m, --model <type>', '使用モデル: flash (gemini-2.5-flash) または pro (gemini-2.5-pro)', 'flash')
  .action(async (options) => {
    try {
      const projectRoot = path.resolve('projects', options.project);
      const chapterPath = path.join(projectRoot, 'chapters', options.file);
      const charactersPath = path.join(projectRoot, 'characters.yaml');
      const outputDir = path.join(projectRoot, 'output');

      // 作品全体のプロットを読み込む（存在しない場合は空文字列）
      const overallPlot = readOverallPlot(projectRoot);
      if (overallPlot) {
        console.log('作品全体のプロット (plot.md) を読み込みました。');
      }

      // 章ファイルを読み込む
      console.log(`章ファイルを読み込み中: ${chapterPath}`);
      let chapterContent;
      let chapterFromFrontMatter;
      let charactersText = '';

      if (options.file.endsWith('.md')) {
        const { data, content } = readPlot(chapterPath);
        chapterContent = content;
        chapterFromFrontMatter = data.chapter;

        // Front MatterにcharactersリストがあればYAMLから抽出
        if (Array.isArray(data.characters) && data.characters.length > 0) {
          console.log(`キャラクターファイルを読み込み中: ${charactersPath}`);
          const allCharacters = readCharacters(charactersPath);
          const extracted = extractCharacters(allCharacters, data.characters);
          const names = Object.keys(extracted);
          console.log(`登場人物: ${names.join('、')}`);
          charactersText = formatCharactersForPrompt(extracted);
        }
      } else {
        chapterContent = readFile(chapterPath);
      }

      console.log(`章ファイル読み込み完了（${chapterContent.length}文字）`);

      // --chapter で指定された値を優先、なければFront Matterの値を使用
      const chapter = options.chapter ?? chapterFromFrontMatter;

      // 草案を生成する
      console.log(`第${chapter}章の草案を生成中...`);
      const draft = await generateChapterDraft(chapterContent, chapter, options.model, overallPlot, charactersText);

      // 結果を保存する
      const outputPath = saveDraft(chapter, draft, outputDir);
      console.log(`\n草案の生成が完了しました。`);
      console.log(`保存先: ${outputPath}`);
      console.log(`\n--- プレビュー（先頭200文字） ---`);
      console.log(draft.slice(0, 200) + (draft.length > 200 ? '...' : ''));
    } catch (err) {
      console.error(`\nエラー: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
