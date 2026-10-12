import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { initDatabase, runQuery, getOne } from './db/database.js';
import { build_context } from './engine/contextBuilder.js';
import { countTokens, TOKEN_LIMITS } from './engine/tokenGuard.js';
import { extractDurableFacts, triggerRollingSummary, updateModeDigest } from './engine/memoryWorker.js';

const PORT = 3000;
const UPSTREAM_LLM_URL = process.env.UPSTREAM_LLM_URL || 'http://127.0.0.1:3001/v1/chat/completions';
const UPSTREAM_API_KEY = process.env.UPSTREAM_API_KEY || 'freellmapi-533afa5f5e8318b1e50960104c07a6578c4b33bd62640502';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

await initDatabase();

async function authorizeDevice(deviceId) {
  if (!deviceId) return null;
  let dev = await getOne("SELECT * FROM devices WHERE device_id = ?", [deviceId]);
  if (!dev) {
    const countRow = await getOne("SELECT COUNT(*) as count FROM devices");
    const isApproved = (countRow.count < 5) ? 1 : 0;
    await runQuery(
      "INSERT INTO devices (device_id, user_id, approved, label, created_at) VALUES (?, ?, ?, ?, ?)",
      [deviceId, deviceId, isApproved, "Client Device", Date.now()]
    );
    dev = { device_id: deviceId, user_id: deviceId, approved: isApproved };
  }
  return dev.approved ? dev : null;
}

wss.on('connection', async (ws, req) => {
  const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const deviceId = urlParams.get('deviceId');

  const device = await authorizeDevice(deviceId);
  if (!device) {
    ws.send(JSON.stringify({ type: 'AUTH_DENIED', message: 'Device unauthorized' }));
    ws.close();
    return;
  }

  const userId = device.user_id;
  ws.send(JSON.stringify({ type: 'CONNECTED', deviceId, status: 'authorized' }));

  ws.on('message', async (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        return;
      }

      if (data.type === 'CHAT_MESSAGE') {
        const { mode, message, profile } = data;

        if (!mode || !message) {
          ws.send(JSON.stringify({ type: 'STREAM_ERROR', error: 'Missing mode or message' }));
          return;
        }

        // Persist profile attributes if provided
        if (profile && typeof profile === 'object') {
          for (const [k, v] of Object.entries(profile)) {
            if (v && typeof v === 'string') {
              await runQuery(
                `INSERT INTO base_facts (user_id, key, value, source_mode, token_count, updated_at) 
                 VALUES (?, ?, ?, 'PROFILE', ?, ?)
                 ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
                [userId, k, v.slice(0, 150), countTokens(v), Date.now()]
              );
            }
          }
        }

        // Build 7-layer context within budget
        const { messages: promptMessages } = await build_context(userId, mode, message);

        // Save User Message
        const userMsgId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await runQuery(
          "INSERT INTO messages (id, user_id, mode_id, role, content, token_count, created_at) VALUES (?, ?, ?, 'user', ?, ?, ?)",
          [userMsgId, userId, mode, message, countTokens(message), Date.now()]
        );

        // Stream from upstream FreeLLMAPI directly into WebSocket frames
        const upstreamRes = await fetch(UPSTREAM_LLM_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${UPSTREAM_API_KEY}`
          },
          body: JSON.stringify({
            messages: promptMessages,
            stream: true,
            max_tokens: TOKEN_LIMITS.MAX_RESERVED_OUTPUT
          })
        });

        if (!upstreamRes.ok) {
          const errText = await upstreamRes.text();
          ws.send(JSON.stringify({ type: 'STREAM_ERROR', error: `Upstream error: ${errText}` }));
          return;
        }

        const reader = upstreamRes.body.getReader();
        const decoder = new TextDecoder();
        let assistantReply = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const rawChunk = decoder.decode(value, { stream: true });
          const lines = rawChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6));
                const token = parsed.choices?.[0]?.delta?.content || "";
                if (token) {
                  assistantReply += token;
                  ws.send(JSON.stringify({ type: 'TOKEN_CHUNK', token }));
                }
              } catch {}
            }
          }
        }

        ws.send(JSON.stringify({ type: 'STREAM_END' }));

        // Save Assistant reply to SQLite
        if (assistantReply) {
          const aiMsgId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await runQuery(
            "INSERT INTO messages (id, user_id, mode_id, role, content, token_count, created_at) VALUES (?, ?, ?, 'assistant', ?, ?, ?)",
            [aiMsgId, userId, mode, assistantReply, countTokens(assistantReply), Date.now()]
          );

          // Silent Background Worker (Non-blocking: runs detached)
          (async () => {
            try {
              await extractDurableFacts(userId, mode, message, assistantReply);
              await triggerRollingSummary(userId, mode);
              await updateModeDigest(userId, mode);
            } catch (err) {
              console.error("[Silent Worker Error]:", err.message);
            }
          })();
        }
      }
    } catch (err) {
      console.error("Socket Error:", err.message);
      ws.send(JSON.stringify({ type: 'STREAM_ERROR', error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n=============================================`);
  console.log(`  KRSNA Server 1 Hub (Memory Engine Active)`);
  console.log(`  WebSocket URL: ws://127.0.0.1:${PORT}/ws`);
  console.log(`  Upstream LLM:  ${UPSTREAM_LLM_URL}`);
  console.log(`=============================================\n`);
});
