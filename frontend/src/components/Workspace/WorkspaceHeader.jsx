import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Settings, Play } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import ModelSelector from '../UI/ModelSelector.jsx';
import OllamaStatusBar from '../UI/OllamaStatusBar.jsx';

export default function WorkspaceHeader({ project }) {
  const navigate = useNavigate();
  const { togglePanel, showFileExplorer, showChat, showPreview } = useAppStore();

  function downloadProject() {
    if (!project) return;
    window.open(api.downloadProject(project.id), '_blank');
  }

  return (
    <header className="h-11 flex items-center justify-between px-4 flex-shrink-0"
      style={{ background: '#0a0a18', borderBottom: '1px solid #1a1a2e' }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs"
        >
          <ArrowLeft size={14} />
          Home
        </button>
        <span className="text-gray-700">|</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
          <span className="text-sm font-medium text-white">{project?.name || 'Loading...'}</span>
        </div>
      </div>

      {/* Center - panel toggles */}
      <div className="flex items-center gap-1">
        {[
          { key: 'showFileExplorer', label: 'Explorer', active: showFileExplorer },
          { key: 'showPreview', label: 'Preview', active: showPreview },
          { key: 'showChat', label: 'AI Chat', active: showChat },
        ].map(({ key, label, active }) => (
          <button
            key={key}
            onClick={() => togglePanel(key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              active
                ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ModelSelector compact />
        <OllamaStatusBar compact />
        <button onClick={downloadProject} className="btn-ghost text-xs py-1 px-2">
          <Download size={13} /> Export
        </button>
      </div>
    </header>
  );
}
