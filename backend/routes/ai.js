const express = require('express');
const router = express.Router();
const AIAgent = require('../services/agent');

let agent;
function getAgent(app) {
  if (!agent) agent = new AIAgent(app.get('workspaceDir'), app.get('io'));
  return agent;
}

// POST /api/ai/chat/:projectId — SSE streaming
router.post('/chat/:projectId', async (req, res) => {
  const { messages, model, imageBase64 } = req.body;
  if (!messages || !model) return res.status(400).json({ error: 'messages and model required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send SSE event to frontend
  const send = (event, data) => {
    try { res.write(`data: ${JSON.stringify({ event, data })}\n\n`); } catch {}
  };

  // Map agent events → frontend SSE events
  const fakeSocket = {
    emit: (agentEvent, data) => {
      try {
        switch (agentEvent) {
          case 'ai-chunk':
            // data = { chunk, full }
            send('chunk', { content: data.chunk || '' });
            break;
          case 'file-changed':
            // data = { path, content }
            send('file', { path: data.path, content: data.content });
            break;
          case 'ai-thinking':
            send('thinking', { content: data.thinking || data.message || '' });
            break;
          case 'ai-action':
            send('action', data);
            break;
          case 'ai-done':
            // Don't send complete yet — we do it after processStream returns
            break;
          case 'ai-error':
            send('error', { message: data.message });
            break;
          default:
            // Pass through anything else
            send(agentEvent.replace('ai-', ''), data);
        }
      } catch {}
    }
  };

  try {
    const ag = getAgent(req.app);
    const result = await ag.processStream({
      projectId: req.params.projectId,
      messages,
      model,
      imageBase64,
      socket: fakeSocket,
    });
    send('complete', {
      filesChanged: result.filesChanged || [],
      message: result.response || '',
    });
  } catch (err) {
    send('error', { message: err.message });
  }

  res.end();
});

// POST /api/ai/analyze/:projectId
router.post('/analyze/:projectId', async (req, res) => {
  const { model } = req.body;
  const ag = getAgent(req.app);
  const context = await ag.readProjectContext(req.params.projectId).catch(() => null);
  if (!context) return res.json({ analysis: 'No files found.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const { streamChat } = require('../services/ollama');
  await streamChat({
    model: model || 'llama3',
    messages: [{
      role: 'user',
      content: `Analyze this project:\n1. Project type & purpose\n2. Tech stack\n3. Code quality\n4. Top 5 improvements\n5. Missing features\n\nProject:\n${context}`
    }],
    onChunk: (chunk) => res.write(`data: ${JSON.stringify({ event: 'chunk', data: { content: chunk } })}\n\n`),
    onDone: (full) => {
      res.write(`data: ${JSON.stringify({ event: 'complete', data: { message: full } })}\n\n`);
      res.end();
    },
    onError: (err) => { res.write(`data: ${JSON.stringify({ event: 'error', data: { message: err.message } })}\n\n`); res.end(); }
  });
});

module.exports = router;
