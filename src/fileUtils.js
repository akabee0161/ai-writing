import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

/**
 * テキストファイルを読み込む（レガシー用途・.txt対応）
 * @param {string} filePath - ファイルパス
 * @returns {string} ファイルの内容
 */
export function readFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`ファイルが見つかりません: ${resolved}`);
  }
  return fs.readFileSync(resolved, 'utf-8');
}

/**
 * プロットファイルを読み込み、Front Matterとプロット本文に分離する
 * @param {string} filePath - プロットファイルのパス（.md）
 * @returns {{ data: object, content: string }} メタデータと本文
 */
export function readPlot(filePath) {
  const raw = readFile(filePath);
  const { data, content } = matter(raw);
  return { data, content: content.trim() };
}

/**
 * キャラクター設定YAMLファイルを読み込む
 * @param {string} filePath - characters.yaml のパス
 * @returns {object} キャラクター名をキーとしたオブジェクト
 */
export function readCharacters(filePath) {
  const raw = readFile(filePath);
  const parsed = yaml.load(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`キャラクターファイルの形式が不正です: ${filePath}`);
  }
  return parsed;
}

/**
 * characters.yaml から指定キャラクターの設定を抽出する
 * @param {object} allCharacters - readCharacters() の戻り値
 * @param {string[]} names - 抽出対象のキャラクター名リスト
 * @returns {object} 抽出されたキャラクター設定
 */
export function extractCharacters(allCharacters, names) {
  const result = {};
  for (const name of names) {
    if (allCharacters[name]) {
      result[name] = allCharacters[name];
    } else {
      console.warn(`警告: キャラクター "${name}" がcharacters.yamlに存在しません。`);
    }
  }
  return result;
}

/**
 * キャラクター設定オブジェクトをプロンプト用テキストに変換する
 * @param {object} characters - extractCharacters() の戻り値
 * @returns {string} プロンプトに埋め込む文字列
 */
export function formatCharactersForPrompt(characters) {
  return Object.entries(characters)
    .map(([name, attrs]) => {
      const lines = Object.entries(attrs)
        .map(([key, val]) => `  - ${key}: ${val}`)
        .join('\n');
      return `【${name}】\n${lines}`;
    })
    .join('\n\n');
}

/**
 * プロジェクト全体のプロットファイル (plot.md) を読み込む。
 * ファイルが存在しない場合はエラーにせず空文字列を返す。
 * @param {string} projectPath - プロジェクトルートの絶対パス
 * @returns {string} plot.md の内容、または空文字列
 */
export function readOverallPlot(projectPath) {
  const filePath = path.join(projectPath, 'plot.md');
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8').trim();
}

/**
 * 草案を指定ディレクトリに保存する
 * @param {string} chapter - 章番号または名前
 * @param {string} content - 保存する内容
 * @param {string} outputDir - 出力先ディレクトリの絶対パス
 * @returns {string} 保存先のファイルパス
 */
export function saveDraft(chapter, content, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sanitized = String(chapter).replace(/[^\w\u3000-\u9fff\uff00-\uffefーa-zA-Z0-9]/g, '_');
  const fileName = `chapter_${sanitized}.txt`;
  const outputPath = path.join(outputDir, fileName);

  fs.writeFileSync(outputPath, content, 'utf-8');
  return outputPath;
}
