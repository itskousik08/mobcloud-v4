import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, StopCircle, Trash2, Image, History, Sparkles,
  Wand2, Code, Zap, X, ChevronDown, ChevronUp,
  Database, Globe, Smartphone, Shield, Search,
  GitBranch, Package, Layers, FileText, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../store/useAppStore';
import { streamAI } from '../../utils/api';
import toast from 'react-hot-toast';

// ─── Quick action categories ───────────────────
const QUICK_CATEGORIES = [
  {
    label: 'Build',
    icon: <Code size={12} />,
    prompts: [
      'Create a complete modern landing page with hero, features, pricing, and footer sections',
      'Build a full React app with routing, components, and Tailwind CSS',
      'Create a Next.js project with App Router, TypeScript, and Tailwind',
      'Build a REST API with Node.js, Express, and proper folder structure',
    ]
  },
  {
    label: 'Database',
    icon: <Database size={12} />,
    prompts: [
      'Add Supabase integration with authentication and database schema',
      'Set up Firebase with Firestore, Auth, and Storage configuration',
      'Create a Prisma schema with SQLite for a blog application',
      'Add a complete user authentication system with JWT',
    ]
  },
  {
    label: 'Improve',
    icon: <Sparkles size={12} />,
    prompts: [
      'Make the entire project fully mobile-responsive with a hamburger menu',
      'Add smooth animations, micro-interactions, and page transitions',
      'Improve performance: lazy loading, code splitting, image optimization',
      'Add dark mode with a toggle and persist preference in localStorage',
    ]
  },
  {
    label: 'Features',
    icon: <Layers size={12} />,
    prompts: [
      'Add a complete search functionality with filtering and sorting',
      'Create a dashboard with charts, stats cards, and data tables',
      'Add PWA support with service worker, manifest, and offline mode',
      'Implement a complete form with validation, error states, and submission',
    ]
  },
  {
    label: 'SEO & Deploy',
    icon: <Globe size={12} />,
    prompts: [
      'Add complete SEO: meta tags, Open Graph, Twitter cards, sitemap.xml',
      'Create a Dockerfile and docker-compose.yml for deployment',
      'Add GitHub Actions CI/CD workflow for automatic deployment',
      'Generate a complete README with setup, usage, and API docs',
    ]
  },
];

// ─── AI Actions Feed ───────────────────────────
function ActionsFeed({ actions }) {
  if (!actions.length) return null;
  return (
    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>AI Actions</p>
      <div className="space-y-1 max-h-24 overflow-auto">
        {actions.slice(0, 8).map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#10b981' }} />
            <span className="truncate" style={{ color: 'var(--text2)' }}>{a.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── User Message ─────────────────────────────
function UserMessage({ msg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end mb-4">
      <div className="msg-user" style={{ maxWidth: '88%' }}>
        {msg.image && (
          <img src={msg.image} alt="Reference" className="rounded-lg mb-2 max-h-40 object-cover w-full" />
        )}
        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
      </div>
    </motion.div>
  );
}

// ─── AI Message ───────────────────────────────
function AIMessage({ msg, onSuggestion }) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Strip file blocks and thinking from display
  const display = (msg.content || '')
    .replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
    .trim();

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 mb-4">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
        M
      </div>

      <div className="flex-1 min-w-0">
        {/* Main message */}
        <div className="msg-ai">
          {display ? (
            <div className="prose-ai text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                code({ node, inline, className, children, ...props }) {
                  const lang = /language-(\w+)/.exec(className || '')?.[1];
                  if (!inline && lang) {
                    return (
                      <SyntaxHighlighter style={oneDark} language={lang} PreTag="div"
                        customStyle={{ margin: '8px 0', borderRadius: 8, fontSize: 11.5, background: 'rgba(0,0,0,0.45)' }}
                        {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}>{display}</ReactMarkdown>
            </div>
          ) : msg.streaming ? (
            <div className="flex gap-1.5 py-1">
              <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
            </div>
          ) : null}
          {msg.streaming && display && <span className="ai-cursor" />}
        </div>

        {/* Files written */}
        {msg.filesChanged?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.filesChanged.map(f => (
              <span key={f} className="file-badge">
                ✓ {f.split('/').pop()}
              </span>
            ))}
          </div>
        )}

        {/* AI Suggestions */}
        {msg.suggestions?.length > 0 && !msg.streaming && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-3 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
            <button
              onClick={() => setShowSuggestions(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold"
              style={{ color: '#818cf8' }}>
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} /> Suggested next steps
              </span>
              {showSuggestions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence>
              {showSuggestions && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden">
                  <div className="px-2 pb-2 flex flex-col gap-1">
                    {msg.suggestions.map((s, i) => (
                      <button key={i} onClick={() => onSuggestion?.(s)}
                        className="text-left text-xs px-3 py-2 rounded-lg transition-all"
                        style={{ color: 'var(--text2)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        → {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Quick Prompts Panel ───────────────────────
function QuickPromptsPanel({ onSend }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="flex-shrink-0 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
      {/* Category tabs */}
      <div className="flex overflow-x-auto px-2 pt-2 gap-1 no-scrollbar">
        {QUICK_CATEGORIES.map((cat, i) => (
          <button key={i} onClick={() => setActiveCategory(i)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all"
            style={activeCategory === i
              ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }
              : { color: 'var(--muted)', border: '1px solid transparent' }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>
      {/* Prompts */}
      <div className="px-2 pt-1.5 pb-2 space-y-1">
        {QUICK_CATEGORIES[activeCategory].prompts.map((p, i) => (
          <button key={i} onClick={() => onSend(p)}
            className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all truncate"
            style={{ color: 'var(--text2)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Chat Panel ───────────────────────────
export default function ChatPanel({ projectId, onRefreshTree }) {
  const {
    messages, addMessage, updateLastMessage, clearChat,
    isAiThinking, setIsAiThinking,
    selectedModel, addToHistory,
    setAiThinkingSteps, addThinkingStep,
    addAiAction, aiActions,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [stopFn, setStopFn] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showQuick, setShowQuick] = useState(true);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const { promptHistory } = useAppStore();

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Image upload
  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large (max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageBase64(ev.target.result.split(',')[1]);
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  // Send message
  const send = useCallback(async (text) => {
    const content = (text !== undefined ? text : input).trim();
    if (!content || isAiThinking) return;
    if (!selectedModel) { toast.error('Please select an AI model first'); return; }

    setInput('');
    setShowQuick(false);
    addToHistory(content);

    const imgPreview = imagePreview;
    const imgB64 = imageBase64;
    setImageBase64(null);
    setImagePreview(null);

    // Add user message
    addMessage({ role: 'user', content, image: imgPreview });
    // Add AI placeholder
    addMessage({ role: 'assistant', content: '', streaming: true });

    setIsAiThinking(true);
    setAiThinkingSteps([]);

    // Build chat history
    const history = [...messages, { role: 'user', content }]
      .map(m => ({ role: m.role, content: m.content || '' }));

    let filesChanged = [];

    const stop = streamAI({
      projectId,
      messages: history,
      model: selectedModel,
      imageBase64: imgB64,
      onChunk: (chunk, full) => {
        // Strip <file> and <thinking> blocks from display
        const display = full
          .replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, '')
          .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
          .trim();
        updateLastMessage({ content: display, streaming: true });
      },
      onThinking: (t) => addThinkingStep(t),
      onFile: async ({ path: fp }) => {
        if (!filesChanged.includes(fp)) filesChanged.push(fp);
        addAiAction({ type: 'write', path: fp, message: `Written: ${fp}` });
        await onRefreshTree?.();
      },
      onAction: (a) => addAiAction(a),
      onDone: (data) => {
        const suggestions = [
          'Add mobile responsive navigation with hamburger menu',
          'Integrate Supabase for database and authentication',
          'Add smooth page transitions and micro-animations',
          'Create a complete dark mode system',
          'Add SEO meta tags, sitemap.xml, and robots.txt',
          'Set up deployment with Dockerfile and GitHub Actions',
        ];
        updateLastMessage({
          streaming: false,
          filesChanged: data?.filesChanged || filesChanged,
          suggestions: suggestions.slice(0, 4),
        });
        setIsAiThinking(false);
        setStopFn(null);
        setAiThinkingSteps([]);
        onRefreshTree?.();
      },
      onError: (err) => {
        updateLastMessage({
          content: `⚠️ Error: ${err?.message || 'Something went wrong. Check Ollama is running.'}`,
          streaming: false,
        });
        setIsAiThinking(false);
        setStopFn(null);
        toast.error(err?.message || 'AI error');
      }
    });

    setStopFn(() => stop);
  }, [input, messages, selectedModel, isAiThinking, projectId, imageBase64, imagePreview]);

  function stopGeneration() {
    stopFn?.();
    setStopFn(null);
    updateLastMessage({ streaming: false });
    setIsAiThinking(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>AI</div>
          <span className="font-semibold text-sm">MobCloud AI</span>
          {isAiThinking && (
            <span className="tag tag-indigo text-xs animate-pulse">Building...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowActions(v => !v)} className="btn-icon" title="AI Actions"
            style={{ position: 'relative' }}>
            <GitBranch size={14} />
            {aiActions.length > 0 && (
              <span className="notif-badge" />
            )}
          </button>
          <button onClick={() => setShowHistory(v => !v)} className="btn-icon" title="Prompt history">
            <History size={14} />
          </button>
          <button onClick={clearChat} className="btn-icon" title="Clear chat">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Actions Feed ── */}
      <AnimatePresence>
        {showActions && aiActions.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <ActionsFeed actions={aiActions} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── History ── */}
      <AnimatePresence>
        {showHistory && promptHistory.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <div className="p-2 max-h-36 overflow-auto">
              <p className="text-xs px-1 mb-1.5 font-medium" style={{ color: 'var(--muted)' }}>Recent prompts</p>
              {promptHistory.slice(0, 10).map((h, i) => (
                <button key={i} onClick={() => { setInput(h.text); setShowHistory(false); }}
                  className="w-full text-left text-xs px-2 py-1.5 rounded-lg mb-0.5 truncate transition-colors"
                  style={{ color: 'var(--text2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {h.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-auto px-3 py-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08))' }}>
              <Bot size={24} style={{ color: '#818cf8' }} />
            </div>
            <p className="font-bold text-base mb-1">MobCloud AI</p>
            <p className="text-sm mb-1" style={{ color: 'var(--text2)' }}>Full-stack project generator</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Creates complete projects with proper file structure,<br />
              database integration, and production-ready code
            </p>
          </div>
        ) : (
          messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserMessage key={msg.id || i} msg={msg} />
              : <AIMessage key={msg.id || i} msg={msg} onSuggestion={send} />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick Prompts ── */}
      <AnimatePresence>
        {showQuick && messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuickPromptsPanel onSend={send} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Image preview */}
        {imagePreview && (
          <div className="relative mb-2 inline-block">
            <img src={imagePreview} alt="Reference" className="h-16 rounded-lg object-cover" />
            <button onClick={() => { setImageBase64(null); setImagePreview(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#f43f5e' }}>
              <X size={10} className="text-white" />
            </button>
          </div>
        )}

        <div className="rounded-xl overflow-hidden transition-all"
          style={{
            border: `1px solid ${isAiThinking ? 'rgba(99,102,241,0.5)' : 'var(--border2)'}`,
            background: 'var(--surface2)',
            boxShadow: isAiThinking ? '0 0 16px rgba(99,102,241,0.12)' : 'none'
          }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isAiThinking
              ? 'AI is building your project...'
              : 'Describe what you want to build, add a feature, or ask for improvements...'}
            disabled={isAiThinking}
            rows={3}
            className="w-full px-3 pt-3 pb-1 text-sm resize-none outline-none"
            style={{ background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', lineHeight: 1.6 }}
          />
          <div className="flex items-center gap-2 px-3 pb-2.5 pt-1">
            {/* Left actions */}
            <div className="flex items-center gap-0.5">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              <button onClick={() => fileInputRef.current?.click()}
                className="btn-icon tooltip" data-tip="Attach reference image" style={{ width: 28, height: 28 }}>
                <Image size={13} />
              </button>
            </div>

            <span className="flex-1 text-xs" style={{ color: 'var(--muted)' }}>
              {isAiThinking
                ? <span style={{ color: '#818cf8' }}>⚡ Writing files...</span>
                : 'Enter to send · Shift+Enter for newline'}
            </span>

            {/* Send / Stop */}
            {isAiThinking ? (
              <button onClick={stopGeneration}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }}>
                <StopCircle size={12} /> Stop
              </button>
            ) : (
              <button onClick={() => send()}
                disabled={!input.trim() && !imageBase64}
                className="flex items-center justify-center rounded-lg transition-all"
                style={{
                  width: 32, height: 32,
                  background: (input.trim() || imageBase64) ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--surface3)',
                  color: (input.trim() || imageBase64) ? 'white' : 'var(--muted)',
                  cursor: (input.trim() || imageBase64) ? 'pointer' : 'not-allowed',
                  boxShadow: (input.trim() || imageBase64) ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                }}>
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
