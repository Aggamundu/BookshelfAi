import OpenAI from 'openai';

let _client = null;
function getOpenAI() {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

const VISION_MODEL = process.env.OPENAI_VISION_MODEL ?? 'gpt-4o';
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? 'gpt-4o';

function parseJsonArray(raw, label) {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`AI returned unparseable ${label}: ${trimmed.slice(0, 200)}`);
  }
}

async function chatText(prompt, maxTokens = 1024) {
  const response = await getOpenAI().chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0]?.message?.content ?? '';
}

/**
 * Extracts visible book titles and authors from a bookshelf image (GPT-4o vision).
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<Array<{title: string, author: string|null}>>}
 */
export async function extractBooksFromImage(imageBuffer, mimeType) {
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await getOpenAI().chat.completions.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
          {
            type: 'text',
            text: `Look at this bookshelf image and extract every book you can identify.
Return ONLY a JSON array — no markdown, no explanation — in this exact shape:
[{"title": "...", "author": "..." | null}, ...]
If you cannot read a spine clearly, skip it. If author is not visible, use null.`,
          },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? '';
  return parseJsonArray(raw, 'book list');
}

/**
 * Generates book recommendations given the scanned shelf and a user's history/preferences.
 * @param {Array<{title:string, author:string|null}>} shelfBooks
 * @param {Array<{book_title:string, author:string, status:string, rating:number|null}>} history
 * @param {{favorite_genres:string[], favorite_authors:string[], notes:string|null}} preferences
 * @returns {Promise<Array<{title:string, author:string, reason:string}>>}
 */
export async function generateRecommendations(shelfBooks, history, preferences) {
  const shelfList = shelfBooks
    .map((b) => `"${b.title}"${b.author ? ` by ${b.author}` : ''}`)
    .join(', ');

  const historyList = history
    .map((h) => {
      const rating = h.rating ? ` (rated ${h.rating}/5)` : '';
      return `"${h.book_title}"${h.author ? ` by ${h.author}` : ''}${rating} — ${h.status}`;
    })
    .join('\n');

  const prefBlock = [
    preferences.favorite_genres?.length
      ? `Favorite genres: ${preferences.favorite_genres.join(', ')}`
      : '',
    preferences.favorite_authors?.length
      ? `Favorite authors: ${preferences.favorite_authors.join(', ')}`
      : '',
    preferences.notes ? `Extra notes: ${preferences.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `You are a knowledgeable librarian recommending books.

Books currently on the user's shelf:
${shelfList}

User's reading history:
${historyList || '(none yet)'}

User preferences:
${prefBlock || '(none specified)'}

Recommend 5 books the user has NOT already read and does NOT currently own.
Return ONLY a JSON array — no markdown, no explanation — in this exact shape:
[{"title": "...", "author": "...", "reason": "one sentence why they'd enjoy it"}, ...]`;

  const raw = await chatText(prompt, 1024);
  return parseJsonArray(raw, 'recommendations');
}
