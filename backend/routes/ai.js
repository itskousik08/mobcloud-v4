const express = require('express');
const router = express.Router();
const AIAgent = require('../services/agent');

let agent;
function getAgent(app) {
  if (!agent) agent = new AIAgent(app.get('workspaceDir'), app.get('io'));
  return agent;
}

// POST /api/ai/chat/:projectId  — SSE streaming
router.post('/chat/:projectId', async (req, res) => {
  const { messages, model, imageBase64 } = req.body;
  if (!messages || !model) return res.status(400).json({ error: 'messages and model required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (event, data) => {
    try { res.write(`data: ${JSON.stringify({ event, data })}\n\n`); } catch {}
  };

  // Fake socket that writes to SSE
  const fakeSocket = { emit: send };

  try {
    const ag = getAgent(req.app);
    const result = await ag.processStream({
      projectId: req.params.projectId,
      messages,
      model,
      imageBase64,
      socket: fakeSocket
    });
    send('complete', result);
  } catch (err) {
    send('error', { message: err.message });
  }

  res.end();
});

// POST /api/ai/analyze/:projectId — analyze existing project
router.post('/analyze/:projectId', async (req, res) => {
  const { model } = req.body;
  const ag = getAgent(req.app);
  const context = await ag.readProjectContext(req.params.projectId);

  if (!context) return res.json({ analysis: 'No files found.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const { streamChat } = require('../services/ollama');
  await streamChat({
    model: model || 'llama3',
    messages: [{
      role: 'user',
      content: `Analyze this project and provide:\n1. Project type and purpose\n2. Tech stack used\n3. Code quality assessment\n4. Top 5 specific improvements\n5. Missing files or features\n\nProject:\n${context}`
    }],
    onChunk: (chunk, full) => res.write(`data: ${JSON.stringify({ chunk, full })}\n\n`),
    onDone: () => res.end(),
    onError: (err) => { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); }
  });
});

// POST /api/ai/fix/:projectId — auto-fix common issues
router.post('/fix/:projectId', async (req, res) => {
  const { model, issue } = req.body;
  const ag = getAgent(req.app);

  const fixPrompts = {
    responsive: 'Make this entire project fully mobile-responsive. Fix all layout issues for phones and tablets.',
    performance: 'Optimize this project for performance: lazy loading, minification hints, image optimization, caching headers.',
    accessibility: 'Improve accessibility: add ARIA labels, keyboard navigation, focus styles, alt texts, color contrast.',
    darkmode: 'Add a complete dark/light mode toggle system to this project.',
    seo: 'Add complete SEO optimization: meta tags, OG tags, structured data, sitemap, robots.txt.',
  };

  const prompt = fixPrompts[issue] || `Fix this issue in the project: ${issue}`;

  const messages = [{ role: 'user', content: prompt }];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const fakeSocket = {
    emit: (event, data) => {
      try { res.write(`data: ${JSON.stringify({ event, data })}\n\n`); } catch {}
    }
  };

  try {
    await ag.processStream({
      projectId: req.params.projectId,
      messages,
      model: model || 'llama3',
      socket: fakeSocket
    });
  } catch (err) {
    fakeSocket.emit('error', { message: err.message });
  }
  res.end();
});

module.exports = router;
