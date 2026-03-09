# 🚀 MobCloud AI

**Local Autonomous Development Platform** — Build, debug, deploy, and manage your entire software lifecycle with AI. 100% private, runs entirely on your device via Ollama.

[![Local First](https://img.shields.io/badge/Local%20First-100%25%20Private-6366f1?style=flat-square)](.)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-8b5cf6?style=flat-square)](https://ollama.ai)
[![Version](https://img.shields.io/badge/Version-4.0.0-22d3ee?style=flat-square)](.)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Starting the App](#starting-the-app)
5. [Ollama Setup](#ollama-setup)
6. [Using MobCloud](#using-mobcloud)
7. [AI Agents](#ai-agents)
8. [Tools Sidebar](#tools-sidebar)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Personality Modes](#personality-modes)
11. [Project Structure](#project-structure)
12. [Troubleshooting](#troubleshooting)
13. [Uninstall](#uninstall)

---

## Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Chat | Streaming AI powered by local Ollama |
| 💻 Live Code Gen | Multi-file generation with instant preview |
| 👁️ Preview | Desktop + Mobile responsive preview |
| 📁 File Explorer | Full project file tree |
| **🔀 Git Manager** | Init, commit, history, branches |
| **🗄️ Database** | SQLite schema viewer + query builder |
| **🔒 Security** | Auto vulnerability scanner |
| **⚙️ CI/CD** | Local pipeline simulator |
| **🌐 API Tester** | Postman-style HTTP testing |
| **🤖 AI Agents** | 8 specialized agents |
| **📊 Analytics** | Dev metrics + charts |
| **🎭 Personality** | Professional / Lovable / Expert modes |

---

## Requirements

- **Node.js** v18 or higher
- **npm** v8 or higher
- **Ollama** installed and running
- **Git** (optional, for Git features)

### Check your versions

```bash
node --version
# Should show v18.x.x or higher

npm --version
# Should show 8.x.x or higher

git --version
# optional
```

---

## Installation

### Step 1 — Install Ollama

**Linux / Android (Termux):**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS:**
```bash
brew install ollama
# or download from https://ollama.com/download
```

**Windows:**
Download installer from https://ollama.com/download

---

### Step 2 — Pull an AI Model

```bash
# Start Ollama service first
ollama serve

# In a new terminal, pull a model (choose one):
ollama pull llama3          # Best balance — recommended
ollama pull codellama       # Best for code generation
ollama pull mistral         # Fast and smart
ollama pull deepseek-coder  # Excellent for code
ollama pull phi3            # Lightweight, fast

# Verify model is installed
ollama list
```

---

### Step 3 — Clone / Extract MobCloud

If you downloaded the zip:
```bash
unzip mobcloud.zip
cd mobcloud
```

If using git:
```bash
git clone <your-repo-url> mobcloud
cd mobcloud
```

---

### Step 4 — Install All Dependencies

```bash
# Install root, backend, and frontend dependencies in one command
npm run install:all
```

This runs:
- `npm install` (root)
- `cd backend && npm install`
- `cd frontend && npm install`

If you get any errors, install manually:
```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

---

## Starting the App

### Development Mode (recommended)

Start both backend and frontend together:
```bash
npm run dev
```

Or start them separately in two terminals:

**Terminal 1 — Backend:**
```bash
npm run dev:backend
# Runs on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:5173
```

Open your browser: **http://localhost:5173**

---

### Production Mode

Build and serve:
```bash
# Build frontend
npm run build

# Start backend server (serves built frontend too)
npm start
```

---

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# Stop
docker-compose down
```

---

## Ollama Setup

Ollama must be running before you start MobCloud.

### Start Ollama

```bash
ollama serve
```

Keep this running in a separate terminal, or set it up as a service.

### Android / Termux

```bash
# Start Ollama in background
ollama serve &

# Check it's running
curl http://localhost:11434/api/tags
```

### Check Connection

MobCloud shows the Ollama status in the header:
- 🟢 **Green dot** = Connected, ready to use
- 🔴 **Red dot** = Not connected, run `ollama serve`
- 🟡 **Yellow dot** = Checking...

### Custom Ollama URL

If Ollama runs on a different port or machine, create a `.env` file in the `backend/` folder:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env:
OLLAMA_URL=http://localhost:11434
```

---

## Using MobCloud

### Create Your First Project

1. Open http://localhost:5173
2. Click **"New Project"** or **"Start Building"**
3. Enter project name and choose a template
4. Click **"Create Project"**
5. The workspace opens automatically

### The Workspace

The workspace has 5 panels (drag the dividers to resize):

```
┌──────────┬─────────────────┬──────────┬──────────┬──┐
│  Files   │    Editor        │ Preview  │  AI Chat │⚙️│
│ Explorer │   (CodeMirror)   │ (iframe) │  Panel   │  │
└──────────┴─────────────────┴──────────┴──────────┴──┘
```

The ⚙️ on the far right is the **Tools Sidebar** (see below).

### Chatting with AI

Type your request in the chat panel:

```
Create a modern landing page with hero, features, and pricing sections
Build a React todo app with local storage
Add dark mode to this project
Fix all bugs in the current code
Create a REST API with Express and SQLite
Generate a README for this project
Add authentication with JWT
Make this fully mobile responsive
```

The AI will:
1. Show its thinking process
2. Write complete files (shown with 🟢 badges)
3. Preview updates automatically

---

## AI Agents

Open the **Agents panel** from the tools sidebar (🤖 icon).

### Available Agents

| Agent | Best For | Example Task |
|-------|----------|--------------|
| **CodeAgent** | Writing and refactoring code | "Refactor all components to TypeScript" |
| **GitAgent** | Git operations | "Auto-commit with a smart message" |
| **DebugAgent** | Finding and fixing bugs | "Scan and fix all React bugs" |
| **DeployAgent** | Deployment configs | "Create Dockerfile for this project" |
| **DocsAgent** | Documentation | "Generate comprehensive README.md" |
| **DatabaseAgent** | Schemas and queries | "Design SQLite schema for a blog" |
| **SecurityAgent** | Security fixes | "Fix all security vulnerabilities" |
| **EmailAgent** | Email templates | "Create nodemailer email templates" |

### How to Use an Agent

1. Click the 🤖 **AI Agents** icon in the tools sidebar
2. Click an agent card to expand it
3. Choose a quick task or type your own
4. Click **Run [AgentName]**
5. Watch the output in the chat panel

---

## Tools Sidebar

The vertical icon bar on the far right of the workspace. Click any icon to open that panel.

| Icon | Tool | What It Does |
|------|------|--------------|
| 🔀 | **Git** | View file changes, commit, browse history |
| 🗄️ | **DB** | SQLite table explorer and SQL query runner |
| 🔒 | **Sec** | Scan for SQL injection, secrets, XSS, eval |
| ⚙️ | **CI** | Run lint → build → security → test pipeline |
| 🌐 | **API** | Test HTTP endpoints (GET, POST, PUT, DELETE) |
| 🤖 | **AI** | Launch specialized AI agents |
| 📊 | **Stats** | Project health score, commit chart, file stats |

Click the same icon again (or the X) to close the panel.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` or `Cmd + K` | Focus the AI chat input |
| `Ctrl + Enter` | Send chat message |
| `Ctrl + S` | Save current file in editor |
| `Ctrl + Enter` (SQL editor) | Run SQL query |

---

## Personality Modes

Click the **Settings** (gear ⚙️) icon on the home page header.

### Professional (default)
Clean, neutral, efficient responses.
> *"Here is the updated component."*

### Lovable
Friendly mentor style. Warm, encouraging, celebratory.
> *"Good morning Kousik from Guwahati! Ready to build something amazing today? 🚀"*
> *"Great work on that commit! You're making real progress! 🎉"*

### Expert
Deep technical precision, advanced terminology.
> *"Session initialized. Analyzing architecture patterns..."*

### Set Your Name & City

In Settings, enter your name and city to get personalized greetings in Lovable mode.

---

## Project Structure

```
mobcloud/
├── package.json               ← Root scripts (npm run dev, install:all)
├── README.md
├── docker-compose.yml
│
├── backend/                   ← Node.js + Express API (port 3001)
│   ├── .env.example           ← Copy to .env and configure
│   ├── package.json
│   ├── server.js              ← Main server + Socket.IO
│   ├── routes/
│   │   ├── ai.js              ← Streaming AI endpoint (SSE)
│   │   ├── git.js             ← Git operations ✨NEW
│   │   ├── database.js        ← SQLite management ✨NEW
│   │   ├── security.js        ← Vulnerability scanner ✨NEW
│   │   ├── cicd.js            ← Pipeline simulator ✨NEW
│   │   ├── analytics.js       ← Dev metrics ✨NEW
│   │   ├── files.js           ← File read/write/delete
│   │   ├── projects.js        ← Project CRUD
│   │   ├── ollama.js          ← Ollama proxy
│   │   └── templates.js       ← Project templates
│   └── services/
│       ├── agent.js           ← AI agent (file writing logic)
│       ├── ollama.js          ← Streaming chat wrapper
│       ├── projects.js        ← Project data service
│       └── templates.js       ← Template service
│
└── frontend/                  ← React + Vite (port 5173)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx           ← App entry point
        ├── App.jsx            ← Router
        ├── store/
        │   └── useAppStore.js ← Zustand global state
        ├── utils/
        │   └── api.js         ← API client + streaming
        ├── styles/
        │   └── global.css     ← All CSS + Tailwind
        ├── pages/
        │   ├── HomePage.jsx   ← Projects list
        │   └── WorkspacePage.jsx ← Main IDE
        └── components/
            ├── Workspace/
            │   ├── WorkspaceHeader.jsx
            │   └── ToolsSidebar.jsx   ← Tools hub ✨NEW
            ├── Chat/ChatPanel.jsx     ← AI chat
            ├── Editor/EditorPanel.jsx ← CodeMirror editor
            ├── Preview/PreviewPanel.jsx
            ├── FileExplorer/FileExplorer.jsx
            ├── Git/GitPanel.jsx       ← Git UI ✨NEW
            ├── Database/DatabasePanel.jsx ✨NEW
            ├── Security/SecurityPanel.jsx ✨NEW
            ├── CI/CICDPanel.jsx           ✨NEW
            ├── API/APITestPanel.jsx        ✨NEW
            ├── Agents/AgentsPanel.jsx      ✨NEW
            ├── Analytics/AnalyticsPanel.jsx ✨NEW
            └── Modals/
                ├── SettingsModal.jsx   ✨NEW
                └── NewProjectModal.jsx
```

---

## Troubleshooting

### npm install fails — version not found

Use relaxed version ranges. Edit `frontend/package.json` and change any version like `^6.1.2` to `^6.0.0`:

```bash
# Quick fix — replace all strict codemirror versions
sed -i 's/@codemirror\/lang-json.*/@codemirror\/lang-json": "^6.0.0",/' frontend/package.json
```

Then re-run:
```bash
cd frontend && npm install
```

---

### Ollama not connecting

```bash
# 1. Make sure Ollama is running
ollama serve

# 2. Test the connection
curl http://localhost:11434/api/tags

# 3. Check you have at least one model
ollama list

# 4. Pull a model if empty
ollama pull llama3
```

---

### Port already in use

```bash
# Backend port 3001
lsof -i :3001
kill -9 <PID>

# Frontend port 5173
lsof -i :5173
kill -9 <PID>
```

Or change ports:
- Backend: set `PORT=3002` in `backend/.env`
- Frontend: edit `vite.config.js`, change `port: 5173` to `port: 5174`

---

### AI not responding / stuck

1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Try a smaller model: `ollama pull phi3`
3. Check backend logs in terminal where `npm run dev:backend` is running
4. Refresh the page and try again

---

### Database features not working

The SQLite manager requires `better-sqlite3`. Install it:

```bash
cd backend
npm install better-sqlite3
```

If it fails to compile on your system:
```bash
npm install better-sqlite3 --build-from-source
```

---

### Git features not working

Make sure git is installed:
```bash
git --version
# If not installed:
# Ubuntu/Debian: apt install git
# macOS: brew install git
# Termux: pkg install git
```

---

### Preview not showing

The preview iframe shows `preview/<projectId>/index.html`. Make sure:
1. Your project has an `index.html` file
2. The backend is running on port 3001
3. There are no JavaScript errors in the console

---

### On Android / Termux — special notes

```bash
# Install Node.js
pkg install nodejs

# Install git
pkg install git

# Give storage permission
termux-setup-storage

# Start Ollama (if supported)
ollama serve &

# Install all dependencies
npm run install:all

# If codemirror install fails, try:
cd frontend
npm install --legacy-peer-deps
```

---

## Environment Variables

Create `backend/.env` (copy from `backend/.env.example`):

```env
# Server port
PORT=3001

# Ollama URL (default: http://localhost:11434)
OLLAMA_URL=http://localhost:11434

# Workspace directory
WORKSPACE_DIR=./workspace

# Optional: GitHub token for Git push/PR features
GITHUB_TOKEN=ghp_your_token_here

# Optional: SMTP for email agent
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
```

---

## Uninstall

```bash
# Remove the project folder
rm -rf mobcloud

# Remove Ollama models (optional)
ollama rm llama3
ollama rm codellama

# Uninstall Ollama (optional)
# Linux: sudo rm /usr/local/bin/ollama
# macOS: brew uninstall ollama
```

---

## License

MIT — Built for developers who value privacy and local-first tools.
