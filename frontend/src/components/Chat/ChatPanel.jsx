import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, StopCircle, Trash2, Sparkles, Code, Globe, Layers,
  FileCode, ChevronRight, Image as ImageIcon, X, CheckCircle2, Activity, Cpu, Bot
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
      'Create a stunning dark-theme landing page with animated hero, features grid, pricing cards, and contact form',
      'Build a full portfolio website with project gallery, skills section, and cyber UI theme',
    ]
  },
  {
    label: 'Improve', icon: Sparkles,
    prompts: [
      'Make this website fully mobile-responsive with hamburger menu and proper touch targets',
      'Add smooth CSS animations, scroll reveals, hover effects, and neon glows',
    ]
  },
  {
    label: 'Features', icon: Layers,
    prompts: [
      'Add a working contact form with validation, success/error states',
      'Add smooth scroll navigation and active link highlighting',
    ]
  },
];

function parseAgentProgress(text) {
  const agentMatch = text.match(/Agent:\s*([^\n]+)/g);
  const statusMatch = text.match(/Status:\s*([^\n]+)/g);

  const currentAgent = agentMatch ? agentMatch[agentMatch.length - 1].replace(/Agent:\s*/, '').replace(/\*/g, '').trim() : 'System Analyzer';
  const currentStatus = statusMatch ? statusMatch[statusMatch.length - 1].replace(/Status:\s*/, '').replace(/\*/g, '').trim() : 'Processing request...';

  return { currentAgent, currentStatus };
}

function cleanMarkdownContent(text) {
  return (text || '')
    .replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
    .replace(/Agent:\s*[^\n]+\n/g, '')
    .replace(/Status:\s*[^\n]+\n?/g, '')
    .trim();
}

// ── User message bubble ─────────────────────────────
function UserMsg({ msg }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#00f0ff]/20 to-[#7000ff]/20 border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] text-white text-sm font-sans whitespace-pre-wrap leading-relaxed">
        {msg.imageBase64 && (
          <div className="mb-2 rounded-lg overflow-hidden border border-white/10 relative">
            <img src={msg.imageBase64} alt="Uploaded context" className="max-w-full h-auto max-h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        )}
        {msg.content}
      </div>
    </div>
  );
}

// ── AI message bubble ───────────────────────────────
function AIMsg({ msg }) {
  const isComplete = !msg.streaming;

  if (!isComplete) {
    const { currentAgent, currentStatus } = parseAgentProgress(msg.content || '');
    return (
      <div className="mb-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          <Cpu size={16} className="text-[#00f0ff]" />
        </div>
        <div className="flex-1 min-w-0 bg-[#0a0a0f] border border-[#00f0ff]/30 rounded-2xl rounded-tl-sm p-4 shadow-[0_0_20px_rgba(0,240,255,0.15)] relative overflow-hidden">
          {/* Animated scanline */}
          <div className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent translate-y-[-10px] animate-[slideDown_2s_ease-in-out_infinite]" />

          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="font-mono text-xs font-bold text-[#00f0ff] tracking-widest uppercase">{currentAgent}</span>
          </div>
          <div className="text-sm text-gray-300 font-mono">{currentStatus}</div>
        </div>
      </div>
    );
  }

  const cleanText = cleanMarkdownContent(msg.content);

  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#00f0ff] to-[#7000ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]">
        <Bot size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0 bg-[#12121a] border border-white/10 rounded-2xl rounded-tl-sm p-4">
        <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
          <CheckCircle2 size={16} className="text-[#00ff9d]" />
          <span className="text-sm font-bold text-white tracking-wide">Task Completed Successfully</span>
        </div>

        {cleanText && (
          <div className="prose-ai text-gray-300 text-sm mb-4 leading-relaxed custom-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText}</ReactMarkdown>
          </div>
        )}

        {msg.filesChanged?.length > 0 && (
          <div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Affected Files</div>
            <div className="flex flex-wrap gap-2">
              {msg.filesChanged.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff]">
                  <FileCode size={12} /> {f.split('/').pop()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ChatPanel ──────────────────────────────────
export default function ChatPanel({ projectId, onRefreshTree }) {
  const {
    chatMessages, addMessage, updateLastMessage, clearMessages,
    isAiThinking, setIsAiThinking,
    selectedModel, currentProject,
  } = useAppStore();

  const messages = chatMessages[projectId] || [];
  const [input, setInput] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [abortCtrl, setAbortCtrl] = useState(null);
  const [activeCat, setActiveCat] = useState(0);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImageBase64(event.target.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const removeImage = () => setImageBase64(null);

  const send = useCallback(async (promptOverride) => {
    const text = (promptOverride || input).trim();
    if ((!text && !imageBase64) || isAiThinking) return;
    if (!selectedModel) {
      toast.error('No AI model. Run: ollama pull llama3');
      return;
    }

    setInput('');
    const sentImage = imageBase64;
    setImageBase64(null); // Clear preview

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    addMessage({ role: 'user', content: text || 'Analyze this image', imageBase64: sentImage });
    addMessage({ role: 'assistant', content: '', streaming: true });
    setIsAiThinking(true);

    const ctrl = new AbortController();
    setAbortCtrl(ctrl);
    let filesChanged = [];

    streamAI({
      projectId,
      messages: [{ role: 'user', content: text }],
      imageBase64: sentImage,
      model: selectedModel,
      signal: ctrl.signal,
      onFile: async ({ path: fp }) => {
        if (!filesChanged.includes(fp)) filesChanged.push(fp);
        try { await onRefreshTree?.(); } catch { }
      },
      onChunk: (_, full) => {
        updateLastMessage({ content: full, streaming: true });
      },
      onDone: () => {
        updateLastMessage({ streaming: false, filesChanged });
        setIsAiThinking(false);
        setAbortCtrl(null);
        if (filesChanged.length > 0) {
          toast.success(`✓ ${filesChanged.length} file(s) updated`);
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
  }, [input, imageBase64, isAiThinking, selectedModel, projectId]);

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
    <div className="h-full flex flex-col bg-[#0a0a0f] relative font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,240,255,0.02))] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 z-10 bg-[#0a0a0f]/80 backdrop-blur">
        <Activity size={18} className="text-[#00f0ff]" />
        <span className="font-bold font-['Orbitron'] tracking-widest text-[#00f0ff] text-sm uppercase">Agent Swarm</span>
        <div className="flex-1" />
        {messages.length > 0 && (
          <button onClick={() => clearMessages(projectId)} className="p-1.5 text-gray-500 hover:text-[#ff003c] transition-colors rounded hover:bg-white/5" title="Clear chat">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 z-10 custom-scrollbar">
        {showQuick ? (
          <div className="flex flex-col animate-[fadeUp_0.4s_ease-out]">
            <div className="text-center my-8">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-[#00f0ff] to-[#7000ff] shadow-[0_0_30px_rgba(0,240,255,0.3)] flex items-center justify-center text-white">
                <Bot size={32} />
              </div>
              <h2 className="font-['Orbitron'] text-xl font-black text-white tracking-widest">{currentProject?.name ? `Project: ${currentProject.name}` : 'Ready for inputs'}</h2>
              <p className="text-xs text-[#00f0ff] font-mono tracking-widest uppercase mt-2">Awaiting Directive</p>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-2">
              {QUICK_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCat(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider whitespace-nowrap transition-colors border ${activeCat === i
                      ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                      : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                    }`}
                >
                  <cat.icon size={12} /> {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {QUICK_CATEGORIES[activeCat].prompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  className="text-left p-3 rounded-xl text-sm leading-relaxed bg-[#12121a] border border-white/5 text-gray-400 hover:text-white hover:border-[#00f0ff]/30 hover:shadow-[0_4px_20px_rgba(0,240,255,0.05)] transition-all flex items-center gap-3 group"
                >
                  <span className="flex-1">{p}</span>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-[#00f0ff] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => msg.role === 'user' ? <UserMsg key={msg.id || i} msg={msg} /> : <AIMsg key={msg.id || i} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#0a0a0f] z-10 shrink-0">

        {/* Image Preview */}
        {imageBase64 && (
          <div className="mb-3 relative inline-block">
            <div className="relative rounded-lg overflow-hidden border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] inline-block">
              <img src={imageBase64} alt="Preview" className="h-20 w-auto object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button onClick={removeImage} className="bg-red-500/80 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 bg-[#12121a] border border-white/10 focus-within:border-[#00f0ff]/50 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.1)] rounded-xl p-2 transition-all">

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          <button
            className="p-2 text-gray-500 hover:text-[#00f0ff] transition-colors rounded-lg shrink-0 mb-0.5"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image/Screenshot"
          >
            <ImageIcon size={20} />
          </button>

          <textarea
            ref={textareaRef}
            data-chat-input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
            }}
            placeholder="Awaiting directive... (Shift+Enter for new line)"
            disabled={!selectedModel || isAiThinking}
            rows={1}
            className="flex-1 resize-none bg-transparent text-white text-sm font-sans outline-none leading-relaxed py-2 custom-scrollbar max-h-[150px] placeholder-gray-600 min-h-[40px]"
          />

          {isAiThinking ? (
            <button onClick={stop} className="p-2.5 bg-[#ff003c]/20 text-[#ff003c] hover:bg-[#ff003c]/30 rounded-lg transition-colors flex items-center justify-center shrink-0 mb-0.5">
              <StopCircle size={18} />
            </button>
          ) : (
            <button
              onClick={() => send()}
              disabled={(!input.trim() && !imageBase64) || !selectedModel}
              className={`p-2.5 rounded-lg transition-all flex items-center justify-center shrink-0 mb-0.5 ${(input.trim() || imageBase64) && selectedModel
                  ? 'bg-gradient-to-br from-[#00f0ff] to-[#7000ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Required CSS Animations inserted locally */}
      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-30px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        .custom-markdown p { margin-bottom: 0.8em; }
        .custom-markdown strong { color: #fff; font-weight: 700; }
        .custom-markdown ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; }
        .custom-markdown li { margin-bottom: 0.3em; }
      `}</style>
    </div>
  );
}
