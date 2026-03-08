import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Eye } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const MODES = [
  { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
  { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' },
];

export default function PreviewPanel({ projectId }) {
  const { previewUrl, previewMode, setPreviewMode } = useAppStore();
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(0);

  const mode = MODES.find(m => m.id === previewMode) || MODES[0];

  useEffect(() => {
    if (previewUrl) {
      setKey(k => k + 1);
    }
  }, [previewUrl]);

  function refresh() {
    setLoading(true);
    setKey(k => k + 1);
  }

  function openExternal() {
    window.open(previewUrl, '_blank');
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#050510', borderLeft: '1px solid #1a1a2e' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a1a2e', background: '#070710' }}>
        <div className="flex items-center gap-1">
          <Eye size={13} className="text-gray-500" />
          <span className="text-xs font-medium text-gray-400 ml-1">Preview</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg p-0.5"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid #1a1a2e' }}>
          {MODES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setPreviewMode(id)}
              title={label}
              className={`p-1.5 rounded-md transition-all ${
                previewMode === id
                  ? 'text-indigo-400 bg-indigo-500/15'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            className="p-1.5 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openExternal}
            className="p-1.5 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5"
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
        style={{ borderBottom: '1px solid #0d0d1a', background: '#07070f' }}>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 text-xs text-gray-600 px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,.03)', border: '1px solid #1a1a2e' }}>
          {previewUrl ? `localhost:3001/preview/${projectId}/` : 'No preview available'}
        </div>
      </div>

      {/* Preview frame */}
      <div className="flex-1 overflow-auto flex items-start justify-center bg-white/[.02] p-2"
        style={{ background: '#02020a' }}>
        {previewUrl ? (
          <div
            style={{
              width: mode.width,
              height: '100%',
              minHeight: 400,
              transition: 'width .3s ease',
              boxShadow: '0 0 0 1px #1a1a2e, 0 20px 60px rgba(0,0,0,.5)',
              borderRadius: previewMode !== 'desktop' ? '12px' : '4px',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <iframe
              key={key}
              ref={iframeRef}
              src={previewUrl}
              title="Live Preview"
              style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        ) : (
          <div className="text-center text-gray-600 py-16">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(255,255,255,.03)' }}>
              <Eye size={20} className="opacity-30" />
            </div>
            <p className="text-sm">Preview not available</p>
            <p className="text-xs mt-1 opacity-60">Open a project to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
