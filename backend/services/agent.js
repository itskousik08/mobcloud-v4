const fs = require('fs-extra');
const path = require('path');
const { streamChat } = require('./ollama');

const SYSTEM_PROMPT = `You are Mobclowd AI, an expert full-stack web developer and UI/UX designer assistant. You help users build, design, and improve websites and web applications.

When generating or modifying code, you MUST use this exact format for file operations:

<file path="FILEPATH">
FILE_CONTENT_HERE
</file>

Rules:
1. Always include complete file contents (never partial unless specifically editing)
2. Use modern, clean, professional code
3. Prefer vanilla HTML/CSS/JS unless user asks for a framework
4. Make designs beautiful with glassmorphism, gradients, and smooth animations
5. Always explain what you're doing step by step
6. For new websites: create index.html, style.css, and script.js at minimum
7. When modifying, read the context and improve while preserving existing structure
8. Use semantic HTML5, modern CSS (flexbox/grid), and clean ES6+ JS
9. Make everything responsive by default
10. Add smooth transitions and hover effects

Before generating code, briefly explain your plan.
After generating, summarize what was created/changed.

THINKING FORMAT - use this to show your reasoning:
<thinking>
Step 1: [what you're analyzing]
Step 2: [what you're planning]
Step 3: [what you're generating]
</thinking>`;

class AIAgent {
  constructor(workspaceDir, io) {
    this.workspaceDir = workspaceDir;
    this.io = io;
  }

  getProjectDir(projectId) {
    return path.join(this.workspaceDir, projectId);
  }

  async readProjectContext(projectId, maxFiles = 10) {
    const projectDir = this.getProjectDir(projectId);
    if (!fs.existsSync(projectDir)) return '';

    const files = [];
    this._collectFiles(projectDir, projectDir, files, maxFiles);

    const context = files.map(f => {
      try {
        const content = fs.readFileSync(f.full, 'utf-8');
        return `=== ${f.relative} ===\n${content.substring(0, 3000)}`;
      } catch { return ''; }
    }).filter(Boolean).join('\n\n');

    return context;
  }

  _collectFiles(base, dir, result, max) {
    if (result.length >= max) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (result.length >= max) break;
        if (e.name.startsWith('.') || e.name === 'node_modules') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          this._collectFiles(base, full, result, max);
        } else if (this._isTextFile(e.name)) {
          result.push({ full, relative: path.relative(base, full) });
        }
      }
    } catch {}
  }

  _isTextFile(name) {
    const exts = ['.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.svg', '.xml', '.py', '.php', '.env'];
    return exts.some(ext => name.endsWith(ext));
  }

  parseFileBlocks(text) {
    const blocks = [];
    const regex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push({ path: match[1], content: match[2].trim() });
    }
    return blocks;
  }

  parseThinking(text) {
    const match = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
    return match ? match[1].trim() : null;
  }

  async saveSnapshot(projectId, label) {
    try {
      const projectDir = this.getProjectDir(projectId);
      const snapshotsDir = path.join(projectDir, '.snapshots');
      fs.ensureDirSync(snapshotsDir);

      const files = {};
      const fileList = [];
      this._collectFiles(projectDir, projectDir, fileList, 50);

      for (const f of fileList) {
        try {
          files[f.relative] = fs.readFileSync(f.full, 'utf-8');
        } catch {}
      }

      const snap = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        label: label || 'AI Action',
        files
      };

      fs.writeJsonSync(path.join(snapshotsDir, `${snap.id}.json`), snap, { spaces: 2 });
      return snap.id;
    } catch {}
  }

  async processStream({ projectId, messages, model, socketId, socket }) {
    const projectDir = this.getProjectDir(projectId);
    const projectContext = await this.readProjectContext(projectId);

    const systemWithContext = projectContext
      ? `${SYSTEM_PROMPT}\n\n## Current Project Files:\n${projectContext}`
      : SYSTEM_PROMPT;

    // Save snapshot before AI changes
    await this.saveSnapshot(projectId, `Before: ${messages[messages.length - 1]?.content?.substring(0, 50)}`);

    let fullResponse = '';
    const fileChanges = [];

    const emitToSocket = (event, data) => {
      if (socket) socket.emit(event, data);
      if (this.io) this.io.to(`project-${projectId}`).emit(event, data);
    };

    emitToSocket('ai-thinking', { thinking: 'Analyzing your request...' });

    await streamChat({
      model,
      messages,
      system: systemWithContext,
      onChunk: (chunk, full) => {
        fullResponse = full;
        emitToSocket('ai-chunk', { chunk, full });

        // Parse thinking in real time
        const thinking = this.parseThinking(full);
        if (thinking) {
          emitToSocket('ai-thinking', { thinking });
        }

        // Process file blocks as they complete
        const blocks = this.parseFileBlocks(full);
        for (const block of blocks) {
          const existing = fileChanges.find(f => f.path === block.path);
          if (!existing) {
            fileChanges.push(block);
            // Write file immediately
            try {
              const filePath = path.join(projectDir, block.path);
              fs.ensureDirSync(path.dirname(filePath));
              fs.writeFileSync(filePath, block.content, 'utf-8');
              emitToSocket('file-changed', { path: block.path, content: block.content });
              emitToSocket('ai-action', {
                type: 'write-file',
                path: block.path,
                message: `✓ Created/updated ${block.path}`
              });
            } catch (err) {
              emitToSocket('ai-error', { message: `Failed to write ${block.path}: ${err.message}` });
            }
          } else if (existing.content !== block.content) {
            existing.content = block.content;
            try {
              const filePath = path.join(projectDir, block.path);
              fs.writeFileSync(filePath, block.content, 'utf-8');
              emitToSocket('file-changed', { path: block.path, content: block.content });
            } catch {}
          }
        }
      },
      onDone: (full) => {
        emitToSocket('ai-done', {
          message: full,
          filesChanged: fileChanges.map(f => f.path)
        });
      },
      onError: (err) => {
        emitToSocket('ai-error', { message: err.message });
      }
    });

    return { response: fullResponse, filesChanged: fileChanges.map(f => f.path) };
  }
}

module.exports = AIAgent;
