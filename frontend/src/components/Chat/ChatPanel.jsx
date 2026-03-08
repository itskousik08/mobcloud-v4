import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, StopCircle, Trash2, RefreshCw, ChevronDown, Sparkles, Code, Wand2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../store/useAppStore';
import { streamAIChat } from '../../utils/api';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { icon: <Wand2 size={12} />, text: 'Improve the design and make it more modern' },
  { icon: <Sparkles size={12} />, text: 'Add smooth animations and transitions' },
  { icon: <Code size={12} />, text: 'Make it fully responsive for mobile' },
  { icon: <Zap size={12} />, text: 'Add a dark mode toggle' },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '12px' }}>
          M
        </div>
      )}
      <div className={`chat-message ${isUser ? 'user' : 'assistant'} max-w-[85%]`}>
        {isUser ? (
          <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose-dark text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: '8px 0', borderRadius: '8px', fontSize: '12px', background: 'rgba(0,0,0,.5)' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                }
              }}
            >
              {msg.content}
            </ReactMarkdown>
            {msg.streaming && <span className="ai-cursor" />}
          </div>
        )}
        {msg.filesChanged?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1">
            {msg.filesChanged.map(f => (
              <span key={f} className="text-xs px-1.5 py-0.5 rounded text-green-400"
                style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)' }}>
                ✓ {f.split('/').pop()}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPanel({ projectId }) {
  const {
    messages, addMessage, updateLastMessage, clearChat,
    isAiThinking, setIsAiThinking, selectedModel,
    addAiThinkingStep, setAiThinking, addToHistory,
    setCurrentStreamText
  } = useAppStore();

  const [input, setInput] = useState('');
  const [stopFn, setStopFn] = useState(null);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const content = text || input.trim();
    if (!content || isAiThinking) return;
    if (!selectedModel) {
      toast.error('Select an AI model first');
      return;
    }

    setInput('');
    setShowQuick(false);
    addToHistory(content);

    // Add user message
    addMessage({ role: 'user', content, id: Date.now() });

    // Add placeholder AI message
    const aiMsgId = Date.now() + 1;
    addMessage({ role: 'assistant', content: '', streaming: true, id: aiMsgId });

    setIsAiThinking(true);
    setAiThinking([]);

    const history = messages.concat([{ role: 'user', content }]);
    const chatMessages = history.map(m => ({ role: m.role, content: m.content }));

    let streamContent = '';
    let thinkingSteps = [];

    const stop = streamAIChat({
      projectId,
      messages: chatMessages,
      model: selectedModel,
      onChunk: (chunk, full) => {
        streamContent = full;
        // Remove file blocks from display
        const display = full.replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, match => {
          const pathMatch = match.match(/path="([^"]+)"/);
          return pathMatch ? `\n\`Created: ${pathMatch[1]}\`\n` : '';
        }).replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
        updateLastMessage({ content: display.trim(), streaming: true });
        setCurrentStreamText(full);
      },
      onThinking: (thinking) => {
        thinkingSteps = [...thinkingSteps, thinking];
        setAiThinking(thinkingSteps);
        addAiThinkingStep(thinking);
      },
      onFileChange: async ({ path: filePath, content }) => {
        // File tree will refresh via socket
      },
      onDone: (data) => {
        updateLastMessage({
          streaming: false,
          filesChanged: data?.filesChanged || []
        });
        setIsAiThinking(false);
        setStopFn(null);
        setAiThinking([]);
        setCurrentStreamText('');
      },
      onError: (err) => {
        updateLastMessage({ content: `Error: ${err.message}`, streaming: false });
        setIsAiThinking(false);
        setStopFn(null);
        toast.error('AI error: ' + err.message);
      }
    });

    setStopFn(() => stop);
  }, [input, messages, selectedModel, isAiThinking, projectId]);

  function handleStop() {
    if (stopFn) {
      stopFn();
      setStopFn(null);
      updateLastMessage({ streaming: false });
      setIsAiThinking(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#070710', borderLeft: '1px solid #1a1a2e' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a1a2e' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            AI
          </div>
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <button
          onClick={clearChat}
          title="Clear chat"
          className="p-1.5 rounded text-gray-600 hover:text-gray-400 hover:bg-white/5"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.2), rgba(139,92,246,.1))' }}>
              🤖
            </div>
            <p className="text-sm font-medium text-gray-300 mb-1">Mobclowd AI</p>
            <p className="text-xs text-gray-600 mb-4">Ask me to build or improve your website</p>
          </div>
        ) : (
          messages.map((msg, i) => <Message key={msg.id || i} msg={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <AnimatePresence>
        {showQuick && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-2"
          >
            <p className="text-xs text-gray-600 mb-2 px-1">Quick actions:</p>
            <div className="grid grid-cols-1 gap-1">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.text)}
                  className="flex items-center gap-2 text-left text-xs px-3 py-2 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                  style={{ background: 'rgba(255,255,255,.03)', border: '1px solid #1a1a2e' }}
                >
                  <span className="text-indigo-400 flex-shrink-0">{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid #1a1a2e' }}>
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid #252540' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask AI to build or modify your site..."
            rows={3}
            className="w-full bg-transparent px-3 pt-2.5 pb-10 text-sm text-white placeholder-gray-600 resize-none outline-none"
            style={{ fontFamily: 'inherit' }}
            disabled={isAiThinking}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            {isAiThinking ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 transition-all"
                style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.2)' }}
              >
                <StopCircle size={12} /> Stop
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className={`p-2 rounded-lg transition-all ${
                  input.trim()
                    ? 'text-white'
                    : 'text-gray-600 opacity-50 cursor-not-allowed'
                }`}
                style={input.trim() ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : { background: '#1a1a2e' }}
              >
                <Send size={14} />
              </button>
            )}
          </div>
          <div className="absolute bottom-2 left-3 text-xs text-gray-700">
            {isAiThinking ? (
              <span className="text-indigo-500 thinking-dots">Thinking</span>
            ) : (
              'Enter to send, Shift+Enter for new line'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
