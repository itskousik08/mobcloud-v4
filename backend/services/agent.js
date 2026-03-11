const fs = require('fs-extra');
const path = require('path');
const { streamChat } = require('./ollama');

// ─────────────────────────────────────────────
// MASTER SYSTEM PROMPT
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MobCloud AI — an advanced Simulated Multi-Agent System.

You simulate the following specialized agents:
1. [Prompt Analyzer]: Understands user request deeply.
2. [Research Agent]: Finds best practices and approaches.
3. [Planner Agent]: Creates a step-by-step implementation plan.
4. [Coder Agent]: Writes the full code for necessary files.
5. [Reviewer Agent]: Reviews code for errors.
6. [Doubt Agent]: Asks user questions if anything is unclear before proceeding.

═══════════════════════════════
FILE WRITING PROTOCOL (MANDATORY)
═══════════════════════════════
Every file creation or modification MUST use this exact format:

<file path="RELATIVE/PATH/TO/FILE">
COMPLETE FILE CONTENT HERE
</file>

RULES:
• Path is always relative to project root (e.g., src/components/Button.jsx)
• Always write COMPLETE file content — never partial, never "..." placeholders
• YOU MUST NEVER PUT CODE SNIPPETS IN CHAT MESSAGES — ALL code MUST go in <file> tags ONLY.

═══════════════════════════════
SMART UPDATE SYSTEM (MANDATORY)
═══════════════════════════════
When updating an existing project:
1. First analyze the existing files provided in the context.
2. Understand the current architecture.
3. ONLY rewrite or modify the specific files that need changes for the request. Do NOT regenerate the whole project unless explicitly asked.

═══════════════════════════════
MULTI-AGENT CHAT PROTOCOL
═══════════════════════════════
Your chat messages should ONLY contain progress updates in this precise format:

Agent: [Agent Name]
Status: [What the agent is currently doing]

When making decisions, you can use:
<thinking>
Agent: [Agent Name]
Thought: [Internal reasoning]
</thinking>

Example sequence:
Agent: Prompt Analyzer
Status: Analyzing request for a dark theme landing page...

Agent: Planner Agent
Status: Designing layout architecture...

Agent: Coder Agent
Status: Generating React components...

When finished, display exactly:
"Your project is complete."
Followed by a brief bulleted summary of features implemented.

DO NOT OUTPUT CODE IN THE CHAT EVER.`;

// ─────────────────────────────────────────────
// BINARY FILE STUBS (created as placeholders)
// ─────────────────────────────────────────────
const BINARY_STUBS = {
  'favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/>
  </linearGradient></defs>
  <rect width="32" height="32" rx="8" fill="url(#g)"/>
  <text x="50%" y="54%" dominant-baseline="central" text-anchor="middle"
    font-family="system-ui,sans-serif" font-weight="800" font-size="18" fill="white">M</text>
</svg>`,

  'placeholder.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1e1e3a"/>
  <text x="50%" y="48%" dominant-baseline="central" text-anchor="middle"
    font-family="system-ui,sans-serif" font-size="16" fill="#475569">Image Placeholder</text>
  <text x="50%" y="58%" dominant-baseline="central" text-anchor="middle"
    font-family="system-ui,sans-serif" font-size="12" fill="#334155">400 × 300</text>
</svg>`,

  'robots.txt': `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Sitemap: https://yourdomain.com/sitemap.xml`,

  '.gitignore': `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/
.nuxt/

# Environment files
.env
.env.local
.env.production
.env.*.local

# Editor
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output

# Misc
*.pem
.vercel
.cache/`,
};

// ─────────────────────────────────────────────
// AGENT CLASS
// ─────────────────────────────────────────────
class AIAgent {
  constructor(workspaceDir, io) {
    this.workspaceDir = workspaceDir;
    this.io = io;
  }

  getProjectDir(pid) {
    return path.join(this.workspaceDir, pid);
  }

  // Read existing project files for context
  async readProjectContext(pid, maxFiles = 15) {
    const dir = this.getProjectDir(pid);
    if (!fs.existsSync(dir)) return '';
    const files = [];
    this._collectTextFiles(dir, dir, files, maxFiles);
    return files.map(f => {
      try {
        const content = fs.readFileSync(f.full, 'utf-8');
        const preview = content.length > 2000 ? content.substring(0, 2000) + '\n... (truncated)' : content;
        return `=== ${f.rel} (${content.length} chars) ===\n${preview}`;
      } catch { return ''; }
    }).filter(Boolean).join('\n\n');
  }

  _collectTextFiles(base, dir, result, max) {
    if (result.length >= max) return;
    const TEXT_EXTS = ['.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt',
      '.svg', '.xml', '.yaml', '.yml', '.env', '.prisma', '.sql', '.graphql', '.sh', '.py', '.php', '.vue'];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => {
          // Prioritize important files
          const priority = ['index.html', 'index.jsx', 'App.jsx', 'package.json', 'style.css'];
          return priority.indexOf(a.name) - priority.indexOf(b.name);
        });
      for (const e of entries) {
        if (result.length >= max) break;
        if (e.name.startsWith('.') && e.name !== '.env.example' && e.name !== '.gitignore') continue;
        if (['node_modules', 'dist', 'build', '.next', 'coverage', '.snapshots'].includes(e.name)) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) this._collectTextFiles(base, full, result, max);
        else if (TEXT_EXTS.some(x => e.name.endsWith(x))) {
          result.push({ full, rel: path.relative(base, full) });
        }
      }
    } catch { }
  }

  // Parse all <file path="...">content</file> blocks
  parseFileBlocks(text) {
    const blocks = [];
    const regex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const filePath = m[1].trim();
      const content = m[2].trim();
      if (filePath && content !== undefined) {
        blocks.push({ path: filePath, content });
      }
    }
    return blocks;
  }

  // Parse thinking block
  parseThinking(text) {
    const m = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
    return m ? m[1].trim() : null;
  }

  // Write a single file safely
  writeFile(projectDir, filePath, content) {
    // Sanitize path
    const safe = path.join(projectDir, filePath);
    if (!safe.startsWith(projectDir)) return false; // path traversal guard
    fs.ensureDirSync(path.dirname(safe));
    fs.writeFileSync(safe, content, 'utf-8');
    return true;
  }

  // Create standard stub files if missing
  async createStandardFiles(projectDir, emit) {
    for (const [filename, content] of Object.entries(BINARY_STUBS)) {
      const filePath = path.join(projectDir, filename);
      if (!fs.existsSync(filePath)) {
        fs.ensureDirSync(path.dirname(filePath));
        fs.writeFileSync(filePath, content, 'utf-8');
        emit('ai-action', { type: 'auto-create', path: filename, message: `📄 Auto-created: ${filename}` });
      }
    }
  }

  // Save a snapshot before AI edits
  async saveSnapshot(pid, label) {
    try {
      const dir = this.getProjectDir(pid);
      const snapDir = path.join(dir, '.snapshots');
      fs.ensureDirSync(snapDir);
      const files = {};
      const list = [];
      this._collectTextFiles(dir, dir, list, 60);
      for (const f of list) {
        try { files[f.rel] = fs.readFileSync(f.full, 'utf-8'); } catch { }
      }
      const snap = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        label: label || 'Snapshot',
        filesCount: Object.keys(files).length,
        files
      };
      fs.writeJsonSync(path.join(snapDir, `${snap.id}.json`), snap, { spaces: 2 });
      return snap.id;
    } catch (e) {
      console.error('Snapshot failed:', e.message);
    }
  }

  // Main stream processor
  async processStream({ projectId, messages, model, imageBase64, socket }) {
    const dir = this.getProjectDir(projectId);
    fs.ensureDirSync(dir);

    const context = await this.readProjectContext(projectId);
    const systemFull = context
      ? `${SYSTEM_PROMPT}\n\n${'═'.repeat(40)}\nEXISTING PROJECT FILES:\n${'═'.repeat(40)}\n${context}`
      : SYSTEM_PROMPT;

    // Save undo snapshot
    await this.saveSnapshot(projectId, `Before: ${(messages[messages.length - 1]?.content || '').substring(0, 50)}`);

    const emit = (event, data) => {
      try { socket?.emit(event, data); } catch { }
      try { this.io?.to(`project-${projectId}`).emit(event, data); } catch { }
    };

    emit('ai-thinking', { thinking: 'Analyzing your request...' });

    // Auto-create standard files on first use
    await this.createStandardFiles(dir, emit);

    let fullText = '';
    const writtenFiles = new Map(); // path → content (deduplication)
    let thinkingShown = false;

    // Build Ollama messages — support vision/image
    let ollamaMessages = messages.map(m => ({ role: m.role, content: m.content || '' }));
    if (imageBase64 && ollamaMessages.length > 0) {
      const last = ollamaMessages[ollamaMessages.length - 1];
      ollamaMessages[ollamaMessages.length - 1] = { ...last, images: [imageBase64] };
    }

    await streamChat({
      model,
      messages: ollamaMessages,
      system: systemFull,

      onChunk: (chunk, full) => {
        fullText = full;
        emit('ai-chunk', { chunk, full });

        // Show thinking in real time
        const thinking = this.parseThinking(full);
        if (thinking && !thinkingShown) {
          emit('ai-thinking', { thinking });
          if (full.includes('</thinking>')) thinkingShown = true;
        }

        // Write files as they complete during streaming
        const blocks = this.parseFileBlocks(full);
        for (const block of blocks) {
          const prev = writtenFiles.get(block.path);
          if (prev !== block.content) {
            writtenFiles.set(block.path, block.content);
            try {
              const ok = this.writeFile(dir, block.path, block.content);
              if (ok) {
                emit('file-changed', { path: block.path, content: block.content });
                emit('ai-action', {
                  type: 'write-file',
                  path: block.path,
                  message: `✓ ${block.path}`
                });
              }
            } catch (err) {
              emit('ai-error', { message: `Failed to write ${block.path}: ${err.message}` });
            }
          }
        }
      },

      onDone: (full) => {
        // Final pass — ensure all files are written
        const blocks = this.parseFileBlocks(full);
        for (const block of blocks) {
          if (!writtenFiles.has(block.path) || writtenFiles.get(block.path) !== block.content) {
            try { this.writeFile(dir, block.path, block.content); } catch { }
          }
        }
        emit('ai-done', {
          message: full,
          filesChanged: [...writtenFiles.keys()]
        });
      },

      onError: (err) => {
        emit('ai-error', { message: err.message });
      }
    });

    return { response: fullText, filesChanged: [...writtenFiles.keys()] };
  }
}

module.exports = AIAgent;
