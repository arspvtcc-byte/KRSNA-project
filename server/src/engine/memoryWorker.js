import { runQuery, getAll, getOne } from '../db/database.js';
import { countTokens } from './tokenGuard.js';

const UPSTREAM_LLM_URL = process.env.UPSTREAM_LLM_URL || 'http://127.0.0.1:3001/v1/chat/completions';
const UPSTREAM_API_KEY = process.env.UPSTREAM_API_KEY || 'freellmapi-533afa5f5e8318b1e50960104c07a6578c4b33bd62640502';

async function callInternalLLM(messages, maxTokens = 400) {
  try {
    const res = await fetch(UPSTREAM_LLM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${UPSTREAM_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        stream: false,
        max_tokens: maxTokens
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[MemoryWorker] Internal LLM call failed:", err.message);
    return null;
  }
}

// 1. Fact Extraction with deduplication & existing key resolution
export async function extractDurableFacts(userId, modeId, userText, assistantText) {
  // Fetch existing keys to prevent duplicates/synonyms
  const existingModeFacts = await getAll(
    "SELECT key FROM mode_facts WHERE user_id = ? AND mode_id = ?",
    [userId, modeId]
  );
  const existingBaseFacts = await getAll(
    "SELECT key FROM base_facts WHERE user_id = ?",
    [userId]
  );

  const existingKeys = [
    ...existingModeFacts.map(f => f.key),
    ...existingBaseFacts.map(f => f.key)
  ].slice(0, 30);

  const prompt = [
    {
      role: "system",
      content: `You are an internal memory manager. Analyze the conversation turn (English/Hindi/Hinglish).
Extract only LONG-TERM, DURABLE facts, preferences, decisions, or commitments.
Ignore temporary moods, casual greetings, or transient statements.
Convert colloquial Hinglish into clean English values and concise snake_case keys.

EXISTING KNOWN KEYS:
${existingKeys.join(", ") || "None"}

RULE: If a new fact updates or clarifies an EXISTING KNOWN KEY, reuse that exact key to prevent duplicate clutter.

Output STRICT JSON only:
{
  "facts": [
    { "key": "standardized_key", "value": "concise fact value", "is_global": false }
  ]
}
Set "is_global": true ONLY for lifelong personal traits applicable across all modes (e.g., full_name, language_preference).
If no durable facts exist, return {"facts": []}.`
    },
    {
      role: "user",
      content: `User said: "${userText}"\nAssistant replied: "${assistantText}"`
    }
  ];

  const raw = await callInternalLLM(prompt, 300);
  if (!raw) return;

  try {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed.facts)) {
      for (const item of parsed.facts) {
        if (!item.key || !item.value) continue;
        const key = String(item.key).trim().toLowerCase().slice(0, 50);
        const val = String(item.value).trim().slice(0, 200);
        const tCount = countTokens(val);

        if (item.is_global) {
          await runQuery(
            `INSERT INTO base_facts (user_id, key, value, source_mode, token_count, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
            [userId, key, val, modeId, tCount, Date.now()]
          );
        } else {
          await runQuery(
            `INSERT INTO mode_facts (user_id, mode_id, key, value, token_count, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, mode_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
            [userId, modeId, key, val, tCount, Date.now()]
          );
        }
      }
    }
  } catch {}
}

// 2. Rolling Summarizer: Dual Trigger (Turns >= 24 OR Tokens >= 4000)
export async function triggerRollingSummary(userId, modeId) {
  const unsummarized = await getAll(
    `SELECT id, role, content, token_count FROM messages 
     WHERE user_id = ? AND mode_id = ? AND summarized = 0 
     ORDER BY created_at ASC`,
    [userId, modeId]
  );

  if (!unsummarized || unsummarized.length === 0) return;

  const totalTokens = unsummarized.reduce((sum, m) => sum + (m.token_count || countTokens(m.content)), 0);

  // Trigger if >= 24 messages (12 turns) OR token accumulation >= 4000
  if (unsummarized.length < 24 && totalTokens < 4000) return;

  const existingSummaryRow = await getOne(
    `SELECT content FROM summaries WHERE user_id = ? AND mode_id = ?`,
    [userId, modeId]
  );
  const oldSummary = existingSummaryRow?.content || "No prior summary.";

  const batchToSummarize = unsummarized.slice(0, 16);
  const lastMsgId = batchToSummarize[batchToSummarize.length - 1].id;
  const dialogueText = batchToSummarize.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

  const prompt = [
    {
      role: "system",
      content: `You are a conversation summarizer. Combine the existing summary with new conversation turns.
Preserve all commitments, decisions, milestones, problem areas, and ongoing discussions.
Discard pleasantries and repetition. Keep the final updated summary under 400 words.`
    },
    {
      role: "user",
      content: `EXISTING SUMMARY:\n${oldSummary}\n\nNEW CONVERSATION TURNS:\n${dialogueText}\n\nProvide the updated rolling summary:`
    }
  ];

  const updatedSummary = await callInternalLLM(prompt, 600);
  if (!updatedSummary) return;

  const tCount = countTokens(updatedSummary);

  await runQuery(
    `INSERT INTO summaries (user_id, mode_id, content, covers_upto_msg_id, token_count, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, mode_id) DO UPDATE SET 
       content = excluded.content, 
       covers_upto_msg_id = excluded.covers_upto_msg_id, 
       token_count = excluded.token_count, 
       updated_at = excluded.updated_at`,
    [userId, modeId, updatedSummary, lastMsgId, tCount, Date.now()]
  );

  for (const m of batchToSummarize) {
    await runQuery(`UPDATE messages SET summarized = 1 WHERE id = ?`, [m.id]);
  }
}

// 3. Debounced Mode Digest Updater (Every 6 turns)
export async function updateModeDigest(userId, modeId) {
  const recentCountRow = await getOne(
    `SELECT COUNT(*) as count FROM messages WHERE user_id = ? AND mode_id = ?`,
    [userId, modeId]
  );
  
  // Debounce: run on turn 1, or every 6 messages
  if (recentCountRow.count > 1 && recentCountRow.count % 6 !== 0) return;

  const summaryRow = await getOne(
    `SELECT content FROM summaries WHERE user_id = ? AND mode_id = ?`,
    [userId, modeId]
  );
  const recentMsg = await getOne(
    `SELECT content FROM messages WHERE user_id = ? AND mode_id = ? ORDER BY created_at DESC LIMIT 1`,
    [userId, modeId]
  );

  const contextInfo = summaryRow?.content || recentMsg?.content || "Active mode.";

  const prompt = [
    {
      role: "system",
      content: `Generate a single short status digest describing the user's current situation in ${modeId} mode.
STRICT CONSTRAINT: Must be under 20 words (maximum 25 tokens). Direct status statement only.`
    },
    {
      role: "user",
      content: `Context: ${contextInfo}`
    }
  ];

  const digest = await callInternalLLM(prompt, 40);
  if (!digest) return;

  const cleanDigest = digest.replace(/[\r\n]+/g, ' ').trim().slice(0, 140);
  const tCount = countTokens(cleanDigest);

  await runQuery(
    `INSERT INTO base_mode_digests (user_id, mode_id, digest, token_count, last_accessed_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, mode_id) DO UPDATE SET 
       digest = excluded.digest,
       token_count = excluded.token_count,
       last_accessed_at = excluded.last_accessed_at,
       updated_at = excluded.updated_at`,
    [userId, modeId, cleanDigest, tCount, Date.now(), Date.now()]
  );
}
