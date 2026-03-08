const BASE = '/api';

async function request(path, opts = {}) {
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
  // Ollama
  getModels: () => request('/ollama/models'),
  getOllamaStatus: () => request('/ollama/status'),

  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  getFileTree: (id) => request(`/projects/${id}/tree`),
  downloadProject: (id) => `${BASE}/projects/${id}/download`,
  getSnapshots: (id) => request(`/projects/${id}/snapshots`),
  restoreSnapshot: (projectId, snapId) =>
    request(`/projects/${projectId}/snapshots/${snapId}/restore`, { method: 'POST' }),

  // Files
  readFile: (projectId, filePath) => request(`/files/${projectId}/${filePath}`),
  writeFile: (projectId, filePath, content) =>
    request(`/files/${projectId}/${filePath}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
  deleteFile: (projectId, filePath) =>
    request(`/files/${projectId}/${filePath}`, { method: 'DELETE' }),
  renameFile: (projectId, from, to) =>
    request(`/files/${projectId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ from, to })
    }),
  mkdir: (projectId, dirPath) =>
    request(`/files/${projectId}/mkdir`, {
      method: 'POST',
      body: JSON.stringify({ dirPath })
    }),

  // Templates
  getTemplates: () => request('/templates'),

  // System
  getSystemInfo: () => request('/system/info'),
};

// SSE streaming helper for AI chat
export function streamAIChat({ projectId, messages, model, onChunk, onFileChange, onThinking, onAction, onDone, onError }) {
  const controller = new AbortController();

  const body = JSON.stringify({ messages, model });

  fetch(`${BASE}/ai/chat/${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: controller.signal
  }).then(async (res) => {
    if (!res.ok) throw new Error('AI request failed');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          const { event, data } = parsed;

          if (event === 'ai-chunk') onChunk && onChunk(data.chunk, data.full);
          if (event === 'ai-thinking') onThinking && onThinking(data.thinking);
          if (event === 'file-changed') onFileChange && onFileChange(data);
          if (event === 'ai-action') onAction && onAction(data);
          if (event === 'ai-done' || event === 'complete') onDone && onDone(data);
          if (event === 'ai-error' || event === 'error') onError && onError(data);
        } catch {}
      }
    }
  }).catch(err => {
    if (err.name !== 'AbortError') onError && onError({ message: err.message });
  });

  return () => controller.abort();
}

export default api;
