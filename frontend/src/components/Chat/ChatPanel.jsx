import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, StopCircle, Trash2, Sparkles, Code, Globe, Layers,
  FileCode, ChevronRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../store/useAppStore';
import { streamAI } from '../../utils/api';
import toast from 'react-hot-toast';

const QUICK_CATEGORIES = [
  {
    label: 'Build', icon: Code,
    prompts: [
      'Create a stunning modern landing page with animated hero, features grid, pricing cards, and contact form',
      'Build a full portfolio website with project gallery, skills section, testimonials, and dark theme',
      'Create a restaurant website with menu sections, photo gallery, reservation form, and location map',
      'Build a SaaS dashboard with sidebar nav, stats cards, data charts, and user table',
    ]
  },
  {
    label: 'Improve', icon: Sparkles,
    prompts: [
      'Make this website fully mobile-responsive with hamburger menu and proper touch targets',
      'Add smooth CSS animations, scroll reveals, hover effects, and micro-interactions throughout',
      'Add dark/light mode toggle that persists in localStorage with smooth CSS variable transitions',
      'Improve the overall design: better typography, color palette, spacing, and visual hierarchy',
    ]
  },
  {
    label: 'Features', icon: Layers,
    prompts: [
      'Add a working contact form with validation, success/error states, and email-style submission',
      'Add smooth scroll navigation, active link highlighting, and scroll progress indicator',
      'Create a filterable gallery/portfolio with category tabs and animated filtering',
      'Add cookie consent banner, privacy policy page, and GDPR-compliant tracking setup',
    ]
  },
  {
    label: 'SEO & Export', icon: Globe,
    prompts: [
      'Add complete SEO: meta tags, Open Graph, Twitter Cards, JSON-LD structured data, and sitemap.xml',
      'Create robots.txt, sitemap.xml, and add all performance-critical meta tags',
      'Optimize for Core Web Vitals: lazy loading, font optimization, image placeholders, critical CSS',
      'Generate a comprehensive README.md with features list, setup steps, and live demo section',
    ]
  },
];

// ── User message bubble ─────────────────────────────
function UserMsg({ msg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <div style={{
        maxWidth: '85%', padding: '10px 14px', borderRadius: '14px 14px 4px 14px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
        border: '1px solid rgba(99,102,241,0.25)',
        fontSize: 13, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

// ── AI message bubble ───────────────────────────────
function AIMsg({ msg }) {
  const displayText = (msg.content || '')
    .replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
    .trim();

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {/* Avatar */}
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 2,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#fff',
        }}>AI</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Message bubble */}
          <div style={{
            padding: '10px 13px', borderRadius: '4px 14px 14px 14px',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            fontSize: 13, lineHeight: 1.6,
          }}>
            {!displayText && msg.streaming ? (
              <div style={{ display: 'flex', gap: 5, padding: '2px 0' }}>
                <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
              </div>
            ) : displayText ? (
              <div className="prose-ai">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayText}</ReactMarkdown>
                {msg.streaming && <span className="ai-cursor" />}
              </div>
            ) : null}
          </div>

          {/* Files changed badges */}
          {msg.filesChanged?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {msg.filesChanged.map((f, i) => (
                <span key={i} className="file-badge">
                  <FileCode size={9} /> {f.split('/').pop()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ChatPanel ──────────────────────────────────
export default function ChatPanel({ projectId, onRefreshTree }) {
  const {
    chatMessages, addMessage, updateLastMessage, clearMessages,
    isAiThinking, setIsAiThinking, setAiThinkingSteps, addAiAction,
    selectedModel, currentProject,
  } = useAppStore();

  const messages = chatMessages[projectId] || [];
  const [input, setInput] = useState('');
  const [abortCtrl, setAbortCtrl] = useState(null);
  const [activeCat, setActiveCat] = useState(0);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  const send = useCallback(async (promptOverride) => {
    const text = (promptOverride || input).trim();
    if (!text || isAiThinking) return;
    if (!selectedModel) {
      toast.error('No AI model. Run: ollama pull llama3');
      return;
    }

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    addMessage({ role: 'user', content: text });
    addMessage({ role: 'assistant', content: '', streaming: true });
    setIsAiThinking(true);
    setAiThinkingSteps([]);

    const ctrl = new AbortController();
    setAbortCtrl(ctrl);
    let filesChanged = [];

    streamAI({
      projectId,
      messages: [{ role: 'user', content: text }],
      model: selectedModel,
      signal: ctrl.signal,
      onFile: async ({ path: fp }) => {
        if (!filesChanged.includes(fp)) filesChanged.push(fp);
        addAiAction({ type: 'file', path: fp, message: `Created: ${fp}` });
        try { await onRefreshTree?.(); } catch {}
      },
      onChunk: (_, full) => {
        const clean = full
          .replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, '')
          .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
          .trim();
        updateLastMessage({ content: clean, streaming: true });
      },
      onDone: () => {
        updateLastMessage({ streaming: false, filesChanged });
        setIsAiThinking(false);
        setAbortCtrl(null);
        if (filesChanged.length > 0) {
          toast.success(`✓ ${filesChanged.length} file${filesChanged.length > 1 ? 's' : ''} created`);
          onRefreshTree?.();
        }
      },
      onError: (err) => {
        updateLastMessage({ content: `⚠️ ${err.message}`, streaming: false });
        setIsAiThinking(false);
        setAbortCtrl(null);
        toast.error(err.message);
      },
    });
  }, [input, isAiThinking, selectedModel, projectId]);

  function stop() {
    abortCtrl?.abort();
    setAbortCtrl(null);
    updateLastMessage({ streaming: false });
    setIsAiThinking(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const showQuick = messages.length === 0;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: 'var(--surface)', borderLeft: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 8,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#fff',
        }}>AI</div>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>AI Assistant</span>
        {selectedModel && (
          <span className="tag tag-indigo" style={{ fontSize: 10 }}>
            {selectedModel.split(':')[0]}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {messages.length > 0 && (
          <button onClick={() => clearMessages(projectId)} className="btn-icon" style={{ width: 26, height: 26 }} title="Clear chat">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {showQuick ? (
          <div>
            {/* Welcome */}
            <div style={{ textAlign: 'center', marginBottom: 20, paddingTop: 8 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 18, margin: '0 auto 12px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>🤖</div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                {currentProject?.name ? `Working on: ${currentProject.name}` : 'MobCloud AI'}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                Describe what you want to build and I'll generate the complete code
              </p>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8, overflowX: 'auto' }} className="no-scrollbar">
              {QUICK_CATEGORIES.map((cat, i) => (
                <button key={cat.label} onClick={() => setActiveCat(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                  background: activeCat === i ? 'rgba(99,102,241,0.2)' : 'var(--surface2)',
                  color: activeCat === i ? '#818cf8' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}>
                  <cat.icon size={11} /> {cat.label}
                </button>
              ))}
            </div>

            {/* Quick prompts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_CATEGORIES[activeCat].prompts.map((p, i) => (
                <button key={i} onClick={() => send(p)} style={{
                  textAlign: 'left', padding: '9px 12px', borderRadius: 10,
                  fontSize: 12, cursor: 'pointer', lineHeight: 1.5,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--text2)', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                  <span>{p}</span>
                  <ChevronRight size={12} style={{ flexShrink: 0, opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserMsg key={msg.id || i} msg={msg} />
              : <AIMsg key={msg.id || i} msg={msg} />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* No model warning */}
      {!selectedModel && (
        <div style={{ padding: '7px 12px', background: 'rgba(245,158,11,0.08)', borderTop: '1px solid rgba(245,158,11,0.15)' }}>
          <p style={{ fontSize: 11, color: '#f59e0b', textAlign: 'center' }}>
            ⚠️ No model connected. Run <code>ollama serve</code> then <code>ollama pull llama3</code>
          </p>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            data-chat-input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            placeholder={selectedModel ? 'Describe your website... (Enter to send)' : 'Connect Ollama first...'}
            disabled={!selectedModel}
            rows={1}
            style={{
              flex: 1, resize: 'none', padding: '9px 12px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
              outline: 'none', lineHeight: 1.5, maxHeight: 120,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          {isAiThinking ? (
            <button onClick={stop} style={{
              width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(244,63,94,0.15)', color: '#f43f5e', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <StopCircle size={16} />
            </button>
          ) : (
            <button onClick={() => send()} disabled={!input.trim() || !selectedModel} style={{
              width: 38, height: 38, borderRadius: 10, border: 'none', flexShrink: 0,
              background: (input.trim() && selectedModel) ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--surface2)',
              color: (input.trim() && selectedModel) ? '#fff' : 'var(--muted)',
              cursor: (input.trim() && selectedModel) ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <Send size={15} />
            </button>
          )}
        </div>
        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5, textAlign: 'center' }}>
          Ctrl+K to focus · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
