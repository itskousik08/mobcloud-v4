const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function getModels() {
  const res = await fetch(`${OLLAMA_URL}/api/tags`);
  if (!res.ok) throw new Error('Failed to connect to Ollama');
  const data = await res.json();
  return data.models || [];
}

async function checkOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

async function streamChat({ model, messages, system, onChunk, onDone, onError }) {
  try {
    const body = {
      model,
      messages,
      stream: true,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_ctx: 8192
      }
    };
    if (system) {
      body.messages = [{ role: 'system', content: system }, ...messages];
    }

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullContent += json.message.content;
            onChunk && onChunk(json.message.content, fullContent);
          }
          if (json.done) {
            onDone && onDone(fullContent);
          }
        } catch {}
      }
    }

    return fullContent;
  } catch (err) {
    onError && onError(err);
    throw err;
  }
}

async function generate({ model, prompt, system, onChunk, onDone, onError }) {
  try {
    const body = {
      model,
      prompt: system ? `${system}\n\n${prompt}` : prompt,
      stream: true,
      options: { temperature: 0.7, num_ctx: 8192 }
    };

    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error('Ollama generate failed');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            fullText += json.response;
            onChunk && onChunk(json.response, fullText);
          }
          if (json.done) onDone && onDone(fullText);
        } catch {}
      }
    }

    return fullText;
  } catch (err) {
    onError && onError(err);
    throw err;
  }
}

module.exports = { getModels, checkOllama, streamChat, generate };
