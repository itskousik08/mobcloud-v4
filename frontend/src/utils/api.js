const BASE = '/api';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getModels: () => req('/ollama/models'),
  getOllamaStatus: () => req('/ollama/status'),
  getProjects: () => req('/projects'),
  getProject: (id) => req(`/projects/${id}`),
  createProject: (data) => req('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => req(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => req(`/projects/${id}`, { method: 'DELETE' }),
  getFileTree: (id) => req(`/projects/${id}/tree`),
  downloadProject: (id) => `${BASE}/projects/${id}/download`,
  getSnapshots: (id) => req(`/projects/${id}/snapshots`),
  readFile: (pid, path) => req(`/files/${pid}/${path}`),
  writeFile: (pid, path, content) => req(`/files/${pid}/${path}`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteFile: (pid, path) => req(`/files/${pid}/${path}`, { method: 'DELETE' }),
  renameFile: (pid, from, to) => req(`/files/${pid}/rename`, { method: 'PUT', body: JSON.stringify({ from, to }) }),
  mkdir: (pid, dirPath) => req(`/files/${pid}/mkdir`, { method: 'POST', body: JSON.stringify({ dirPath }) }),
  getTemplates: () => req('/templates'),
};

// SSE AI streaming
export function streamAI({ projectId, messages, model, imageBase64, onChunk, onFile, onThinking, onAction, onDone, onError }) {
  const controller = new AbortController();

  fetch(`${BASE}/ai/chat/${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, imageBase64 }),
    signal: controller.signal
  }).then(async (res) => {
    if (!res.ok) throw new Error('AI request failed');
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const { event, data } = JSON.parse(line.slice(6));
          if (event === 'ai-chunk') onChunk?.(data.chunk, data.full);
          if (event === 'ai-thinking') onThinking?.(data.thinking);
          if (event === 'file-changed') onFile?.(data);
          if (event === 'ai-action') onAction?.(data);
          if (event === 'ai-done' || event === 'complete') onDone?.(data);
          if (event === 'ai-error' || event === 'error') onError?.(data);
        } catch {}
      }
    }
  }).catch(err => {
    if (err.name !== 'AbortError') onError?.({ message: err.message });
  });

  return () => controller.abort();
}
