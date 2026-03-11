// ── API Base ──────────────────────────────────────────────────────
async function request(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    let errMsg = res.statusText;
    try { const j = await res.json(); errMsg = j.error || errMsg; } catch {}
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  request,

  // ── Ollama ──────────────────────────────────────
  getOllamaStatus: () => request('/api/ollama/status'),
  getModels: () => request('/api/ollama/models'),

  // ── Projects ────────────────────────────────────
  getProjects: () => request('/api/projects'),
  getProject: (id) => request(`/api/projects/${id}`),
  createProject: (data) => request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),
  updateProject: (id, data) => request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  downloadProject: (id) => `/api/files/${id}/download`,

  // ── Files ───────────────────────────────────────
  readFile: (projectId, filePath) =>
    request(`/api/files/${projectId}/read?path=${encodeURIComponent(filePath)}`),
  writeFile: (projectId, filePath, content) =>
    request(`/api/files/${projectId}/write`, {
      method: 'POST', body: JSON.stringify({ path: filePath, content })
    }),
  deleteFile: (projectId, filePath) =>
    request(`/api/files/${projectId}/delete`, {
      method: 'DELETE', body: JSON.stringify({ path: filePath })
    }),
  renameFile: (projectId, oldPath, newPath) =>
    request(`/api/files/${projectId}/rename`, {
      method: 'POST', body: JSON.stringify({ oldPath, newPath })
    }),
  createFolder: (projectId, dirPath) =>
    request(`/api/files/${projectId}/mkdir`, {
      method: 'POST', body: JSON.stringify({ dirPath })
    }),

  // ── Templates ───────────────────────────────────
  getTemplates: () => request('/api/templates'),

  // ── System ──────────────────────────────────────
  getSystemInfo: () => request('/api/system/info'),
};

// ── Streaming AI ──────────────────────────────────────────────────
export function streamAI({ projectId, messages, model, imageBase64, onChunk, onFile, onThinking, onDone, onError, signal }) {
  let buffer = '';
  let fullText = '';
  const filesChanged = [];

  fetch(`/api/ai/chat/${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, imageBase64 }),
    signal,
  }).then(async res => {
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          const { event, data } = parsed;
          if (event === 'chunk') {
            fullText += data?.content || '';
            onChunk?.(data?.content || '', fullText);
          }
          if (event === 'file') {
            filesChanged.push(data.path);
            onFile?.(data);
          }
          if (event === 'thinking') {
            onThinking?.(data);
          }
          if (event === 'complete') {
            onDone?.({ ...data, filesChanged });
          }
          if (event === 'error') {
            onError?.(new Error(data?.message || 'AI error'));
          }
        } catch {}
      }
    }
    // if stream ended without 'complete' event
    if (fullText && !filesChanged.length) {
      onDone?.({ filesChanged });
    }
  }).catch(err => {
    if (err.name !== 'AbortError') onError?.(err);
  });
}
