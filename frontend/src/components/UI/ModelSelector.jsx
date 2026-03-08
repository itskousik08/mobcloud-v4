import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function ModelSelector({ compact }) {
  const { models, selectedModel, setSelectedModel } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (models.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-gray-600"
        style={{ background: 'rgba(255,255,255,.03)', border: '1px solid #1a1a2e' }}>
        <Cpu size={12} />
        {!compact && <span>No models</span>}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all"
        style={{
          background: 'rgba(99,102,241,.08)',
          border: '1px solid rgba(99,102,241,.2)',
          color: '#a5b4fc'
        }}
      >
        <Cpu size={12} />
        <span className="max-w-[100px] truncate">{selectedModel || 'Select model'}</span>
        <ChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 min-w-[180px] rounded-xl overflow-hidden"
          style={{
            background: '#0d0d1a',
            border: '1px solid #252540',
            boxShadow: '0 20px 60px rgba(0,0,0,.6)'
          }}>
          <div className="px-3 py-2 text-xs text-gray-500 border-b" style={{ borderColor: '#1a1a2e' }}>
            Select Model
          </div>
          <div className="max-h-48 overflow-auto py-1">
            {models.map(model => (
              <button
                key={model.name}
                onClick={() => { setSelectedModel(model.name); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  selectedModel === model.name
                    ? 'text-indigo-300 bg-indigo-500/10'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="font-medium">{model.name}</div>
                {model.size && (
                  <div className="text-gray-600 text-xs mt-0.5">
                    {(model.size / 1e9).toFixed(1)}GB
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
