import React from 'react';
import { Files, MessageSquare, History, Search, Settings, Layers } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const items = [
  { id: 'files', icon: Files, label: 'Files' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'components', icon: Layers, label: 'Components' },
];

export default function ActivityBar() {
  const { sidebarView, setSidebarView, togglePanel, showFileExplorer } = useAppStore();

  function handleClick(id) {
    if (sidebarView === id && showFileExplorer) {
      togglePanel('showFileExplorer');
    } else {
      setSidebarView(id);
      if (!showFileExplorer) togglePanel('showFileExplorer');
    }
  }

  return (
    <div className="w-12 flex flex-col items-center py-2 gap-1 flex-shrink-0"
      style={{ background: '#070710', borderRight: '1px solid #1a1a2e' }}>
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => handleClick(id)}
          title={label}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative ${
            sidebarView === id && showFileExplorer
              ? 'text-indigo-400 bg-indigo-500/15'
              : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
          }`}
        >
          <Icon size={17} />
          {sidebarView === id && showFileExplorer && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
              style={{ background: '#6366f1' }} />
          )}
        </button>
      ))}

      <div className="flex-1" />

      <button title="Settings" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-400 hover:bg-white/5">
        <Settings size={17} />
      </button>
    </div>
  );
}
