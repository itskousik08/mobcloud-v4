# Contributing to Mobclowd

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/mobclowd.git`
3. Install dependencies: `npm run install:all`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Start Ollama
ollama serve

# Pull a model for testing
ollama pull llama3

# Start dev servers
npm run dev
```

## Project Structure

- `backend/` — Node.js/Express API
- `frontend/` — React frontend (Vite + Tailwind)
- `scripts/` — CLI tools
- `docs/` — Documentation

## Submitting Changes

1. Make your changes
2. Test thoroughly
3. Commit with clear messages
4. Push and open a Pull Request

## Areas for Contribution

- New project templates
- AI prompt improvements
- UI/UX enhancements
- Performance optimizations
- Bug fixes
- Documentation improvements
- New language support in editor

## Code Style

- Use ES6+ JavaScript
- Follow existing patterns
- Comment complex logic
- Keep components focused

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- System info (OS, Node version, Ollama version)
