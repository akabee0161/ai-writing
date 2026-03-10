import { GoogleGenAI } from '@google/genai';

const MODEL_MAP = {
  flash: 'gemini-2.5-flash',
  pro: 'gemini-2.5-pro',
};

const MAX_INPUT_CHARS = 1000;
const MAX_OUTPUT_TOKENS = 1024;

const BASE_INSTRUCTION =
  'あなたはプロの小説家です。提供されたプロットに基づき、指定された章の草案を執筆してください。' +
  '地の文と台詞を適切に交え、情景や心理描写を詳細に記述してください。' +
  '指定された章の内容のみを出力し、余計な解説や挨拶は含めないでください。' +
  '「作品全体のプロット」を全体の文脈として踏まえた上で、「本章の指定内容」の草案を出力してください。' +
  '登場人物の設定および口調に忠実に執筆してください。';

/**
 * システム指示を組み立てる
 * @param {string} overallPlot - readOverallPlot() の出力
 * @param {string} charactersText - formatCharactersForPrompt() の出力
 * @returns {string}
 */
function buildSystemInstruction(overallPlot, charactersText) {
  let instruction = BASE_INSTRUCTION;
  if (overallPlot) {
    instruction += '\n\n【作品全体のプロット】\n' + overallPlot;
  }
  if (charactersText) {
    instruction += '\n\n【登場人物の設定】\n' + charactersText;
  }
  return instruction;
}

/**
 * Gemini APIを呼び出して章の草案を生成する
 * @param {string} chapterContent - 章ファイルの本文（Front Matterを除いた本文）
 * @param {string} chapter - 生成対象の章（番号または名前）
 * @param {string} modelType - 'flash' または 'pro'
 * @param {string} [overallPlot] - 作品全体のプロット（plot.md の内容）
 * @param {string} [charactersText] - フォーマット済みキャラクター情報
 * @returns {Promise<string>} 生成された草案テキスト
 */
export async function generateChapterDraft(chapterContent, chapter, modelType = 'flash', overallPlot = '', charactersText = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('環境変数 GEMINI_API_KEY が設定されていません。.env ファイルを確認してください。');
  }

  const modelName = MODEL_MAP[modelType];
  if (!modelName) {
    throw new Error(`不明なモデルタイプ: "${modelType}"。'flash' または 'pro' を指定してください。`);
  }

  if (chapterContent.length > MAX_INPUT_CHARS) {
    throw new Error(`章の内容が長すぎます（${chapterContent.length}文字）。${MAX_INPUT_CHARS}文字以内にしてください。`);
  }

  const ai = new GoogleGenAI({ apiKey });

  const userPrompt =
    `以下の指定内容に基づき、【第${chapter}章】の草案を執筆してください。\n\n` +
    `【本章の指定内容】\n${chapterContent}\n\n` +
    `第${chapter}章の本文のみを出力してください。`;

  console.log(`モデル: ${modelName} で生成中...`);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: userPrompt,
    config: {
      systemInstruction: buildSystemInstruction(overallPlot, charactersText),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('APIからの応答が空でした。');
  }

  return text;
}
