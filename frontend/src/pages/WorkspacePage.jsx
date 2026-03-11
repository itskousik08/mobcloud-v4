import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import WorkspaceHeader from '../components/Workspace/WorkspaceHeader.jsx';
import FileExplorer from '../components/FileExplorer/FileExplorer.jsx';
import EditorPanel from '../components/Editor/EditorPanel.jsx';
import ChatPanel from '../components/Chat/ChatPanel.jsx';
import PreviewPanel from '../components/Preview/PreviewPanel.jsx';
import { Code2, MonitorPlay, MessageSquare, Menu } from 'lucide-react';

export default function WorkspacePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    setCurrentProject, setFileTree, openFile,
    setPreviewUrl, mobilePanel, setMobilePanel,
    closeAllFiles,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [explorerWidth, setExplorerWidth] = useState(240);
  const [chatWidth, setChatWidth] = useState(380);
  const [centerMode, setCenterMode] = useState('code'); // 'code' | 'preview'
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const dragging = useRef(null);

  // Responsive tracker
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load project
  useEffect(() => {
    if (!projectId) { navigate('/'); return; }
    setLoading(true);
    setError(null);
    closeAllFiles();

    api.getProject(projectId)
      .then(({ project, tree }) => {
        setCurrentProject(project);
        setFileTree(tree || []);
        // Setup initial preview
        setPreviewUrl(`/preview/${projectId}/index.html`);
      })
      .catch((err) => {
        console.error('Load project error:', err);
        setError(err.message);
        toast.error('Failed to load project');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const refreshTree = useCallback(async () => {
    try {
      const { tree } = await api.getProject(projectId);
      if (tree) setFileTree(tree);
    } catch { }
  }, [projectId]);

  const openFileHandler = useCallback(async (filePath) => {
    try {
      const result = await api.readFile(projectId, filePath);
      openFile({ path: filePath, content: result.content || '', mimeType: result.mimeType });
      setMobilePanel('editor');
      setCenterMode('code'); // ensure we switch to code mode on desktop when a file is opened
    } catch (err) {
      toast.error(`Cannot open file: ${err.message}`);
    }
  }, [projectId]);

  // Cmd+K shortcut for AI chat
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setMobilePanel('chat');
        document.querySelector('[data-chat-input]')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Panel resizing handler
  function startResize(side) {
    return (e) => {
      e.preventDefault();
      dragging.current = { side, startX: e.clientX };
      const onMove = (ev) => {
        if (!dragging.current) return;
        const dx = ev.clientX - dragging.current.startX;
        dragging.current.startX = ev.clientX;
        if (side === 'explorer') setExplorerWidth(w => Math.max(160, Math.min(400, w + dx)));
        if (side === 'chat') setChatWidth(w => Math.max(260, Math.min(600, w - dx)));
      };
      const onUp = () => {
        dragging.current = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  }

  // Loading state
  if (loading) return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-white/10 border-t-[#00f0ff] rounded-full animate-spin" />
      <p className="text-[#00f0ff] font-mono text-xs tracking-widest animate-pulse">LOADING WORKSPACE...</p>
    </div>
  );

  // Error state
  if (error) return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-white font-bold text-xl">Failed to load project</h2>
      <p className="text-red-400 text-sm">{error}</p>
      <button className="px-6 py-2 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 rounded-lg font-mono text-sm mt-4 hover:bg-[#00f0ff]/20 transition-all" onClick={() => navigate('/')}>
        RETURN TO DASHBOARD
      </button>
    </div>
  );

  const isMobile = windowWidth < 768;

  const MOBILE_TABS = [
    { id: 'chat', label: 'AI', icon: <MessageSquare size={18} /> },
    { id: 'files', label: 'Files', icon: <Menu size={18} /> },
    { id: 'editor', label: 'Code', icon: <Code2 size={18} /> },
    { id: 'preview', label: 'Preview', icon: <MonitorPlay size={18} /> },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0f] text-white">
      <WorkspaceHeader projectId={projectId} onRefreshTree={refreshTree} />

      {isMobile ? (
        /* ── Mobile Layout ── */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden bg-[#12121a]">
            {mobilePanel === 'files' && <FileExplorer projectId={projectId} onFileOpen={openFileHandler} onRefresh={refreshTree} />}
            {mobilePanel === 'editor' && <EditorPanel projectId={projectId} />}
            {mobilePanel === 'preview' && <PreviewPanel projectId={projectId} />}
            {mobilePanel === 'chat' && <ChatPanel projectId={projectId} onRefreshTree={refreshTree} />}
          </div>

          <div className="flex border-t border-white/10 bg-[#0a0a0f] px-2 py-1 shrink-0 pb-safe">
            {MOBILE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setMobilePanel(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-lg transition-colors ${mobilePanel === tab.id ? 'text-[#00f0ff] bg-[#00f0ff]/10' : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {tab.icon}
                <span className="text-[10px] font-mono tracking-wider">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Desktop 3-Pane Layout ── */
        <div className="flex-1 flex overflow-hidden">

          {/* Left Panel: File Explorer */}
          <div
            style={{ width: explorerWidth }}
            className="flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0a0a0f] overflow-hidden"
          >
            <FileExplorer projectId={projectId} onFileOpen={openFileHandler} onRefresh={refreshTree} />
          </div>

          <div
            className="w-1 bg-white/5 hover:bg-[#00f0ff]/50 cursor-col-resize transition-colors"
            onMouseDown={startResize('explorer')}
          />

          {/* Center Pane: Modes (Code / Preview) */}
          <div className="flex-1 min-w-0 flex flex-col bg-[#12121a]">
            {/* Center Tabs Header */}
            <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-[#0a0a0f] backdrop-blur z-10">
              <button
                onClick={() => setCenterMode('code')}
                className={`px-4 py-1.5 rounded text-sm font-mono transition-all flex items-center gap-2 ${centerMode === 'code'
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                    : 'text-gray-400 hover:text-gray-200 border border-transparent hover:bg-white/5'
                  }`}
              >
                <Code2 size={16} /> Code Editor
              </button>
              <button
                onClick={() => setCenterMode('preview')}
                className={`px-4 py-1.5 rounded text-sm font-mono transition-all flex items-center gap-2 ${centerMode === 'preview'
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                    : 'text-gray-400 hover:text-gray-200 border border-transparent hover:bg-white/5'
                  }`}
              >
                <MonitorPlay size={16} /> Live Preview
              </button>
            </div>

            {/* Center Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${centerMode === 'code' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'}`}>
                <EditorPanel projectId={projectId} />
              </div>
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${centerMode === 'preview' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'}`}>
                <PreviewPanel projectId={projectId} />
              </div>
            </div>
          </div>

          <div
            className="w-1 bg-white/5 hover:bg-[#00f0ff]/50 cursor-col-resize transition-colors"
            onMouseDown={startResize('chat')}
          />

          {/* Right Panel: AI Assistant */}
          <div
            style={{ width: chatWidth }}
            className="flex-shrink-0 flex flex-col border-l border-white/10 bg-[#0a0a0f] overflow-hidden"
          >
            <ChatPanel projectId={projectId} onRefreshTree={refreshTree} />
          </div>

        </div>
      )}
    </div>
  );
}
