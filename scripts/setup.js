#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(msg, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

function banner() {
  console.log(`
${BLUE}${BOLD}
███╗   ███╗ ██████╗ ██████╗  ██████╗██╗      ██████╗ ██╗    ██╗██████╗
████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║     ██╔═══██╗██║    ██║██╔══██╗
██╔████╔██║██║   ██║██████╔╝██║     ██║     ██║   ██║██║ █╗ ██║██║  ██║
██║╚██╔╝██║██║   ██║██╔══██╗██║     ██║     ██║   ██║██║███╗██║██║  ██║
██║ ╚═╝ ██║╚██████╔╝██████╔╝╚██████╗███████╗╚██████╔╝╚███╔███╔╝██████╔╝
╚═╝     ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝
${RESET}
${BLUE}Local AI Development Platform${RESET}
  `);
}

async function checkNode() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major < 18) {
    log(`✗ Node.js 18+ required (found ${version})`, RED);
    process.exit(1);
  }
  log(`✓ Node.js ${version}`, GREEN);
}

async function checkOllama() {
  try {
    const res = await fetch('http://localhost:11434/api/tags').catch(() => null);
    if (res?.ok) {
      log('✓ Ollama is running', GREEN);
      const data = await res.json();
      if (data.models?.length > 0) {
        log(`  Models available: ${data.models.map(m => m.name).join(', ')}`, BLUE);
      } else {
        log('  ⚠ No models installed. Run: ollama pull llama3', YELLOW);
      }
      return true;
    }
  } catch {}
  log('  ⚠ Ollama not running. Start with: ollama serve', YELLOW);
  log('  Download Ollama from: https://ollama.ai', BLUE);
  return false;
}

function installDeps() {
  log('\nInstalling dependencies...', BLUE);

  const dirs = [
    { name: 'backend', path: path.join(__dirname, '..', 'backend') },
    { name: 'frontend', path: path.join(__dirname, '..', 'frontend') }
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir.path)) continue;
    log(`  Installing ${dir.name} dependencies...`);
    try {
      execSync('npm install', { cwd: dir.path, stdio: 'pipe' });
      log(`  ✓ ${dir.name} ready`, GREEN);
    } catch (err) {
      log(`  ✗ Failed to install ${dir.name}: ${err.message}`, RED);
    }
  }
}

function createEnv() {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  const examplePath = path.join(__dirname, '..', 'backend', '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    log('✓ Created backend/.env from example', GREEN);
  }
}

async function main() {
  banner();

  log('🔍 Checking system requirements...\n', BLUE);
  await checkNode();
  const ollamaOk = await checkOllama();

  createEnv();
  installDeps();

  log('\n' + '═'.repeat(50), BLUE);
  log('\n✅ Setup complete!', GREEN);
  log('\nTo start Mobclowd:', BOLD);
  log('  npm run dev', GREEN);
  log('\nThen open:', BOLD);
  log('  http://localhost:5173', BLUE);
  log('\n' + '═'.repeat(50) + '\n', BLUE);

  if (!ollamaOk) {
    log('💡 First time setup:', YELLOW);
    log('  1. Install Ollama: https://ollama.ai', BLUE);
    log('  2. Run: ollama serve', BLUE);
    log('  3. Pull a model: ollama pull llama3', BLUE);
    log('  4. Start Mobclowd: npm run dev\n', BLUE);
  }
}

main().catch(err => {
  log(`Setup failed: ${err.message}`, RED);
  process.exit(1);
});
