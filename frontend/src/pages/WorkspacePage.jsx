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
import ToolsSidebar from '../components/Workspace/ToolsSidebar.jsx';

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
  const [explorerWidth, setExplorerWidth] = useState(220);
  const [chatWidth, setChatWidth] = useState(340);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const dragging = useRef(null);

  // Track window width for responsive layout (avoids Tailwind hidden/flex bugs)
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
    } catch {}
  }, [projectId]);

  const openFileHandler = useCallback(async (filePath) => {
    try {
      const result = await api.readFile(projectId, filePath);
      openFile({ path: filePath, content: result.content || '', mimeType: result.mimeType });
      setMobilePanel('editor');
    } catch (err) {
      toast.error(`Cannot open file: ${err.message}`);
    }
  }, [projectId]);

  // Cmd+K shortcut
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

  // Panel resize
  function startResize(side) {
    return (e) => {
      e.preventDefault();
      dragging.current = { side, startX: e.clientX };
      const onMove = (ev) => {
        if (!dragging.current) return;
        const dx = ev.clientX - dragging.current.startX;
        dragging.current.startX = ev.clientX;
        if (side === 'explorer') setExplorerWidth(w => Math.max(160, Math.min(400, w + dx)));
        if (side === 'chat') setChatWidth(w => Math.max(260, Math.min(500, w - dx)));
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

  // ── Loading ──
  if (loading) return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => <div key={i} className="thinking-dot" />)}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading workspace...</p>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h2 style={{ color: 'var(--text)', fontWeight: 700 }}>Failed to load project</h2>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>{error}</p>
      <button className="btn-primary" onClick={() => navigate('/')}>← Back</button>
    </div>
  );

  const isMobile = windowWidth < 768;
  const isWide = windowWidth >= 1100;

  const MOBILE_TABS = [
    { id: 'chat', label: 'AI', emoji: '🤖' },
    { id: 'files', label: 'Files', emoji: '📁' },
    { id: 'editor', label: 'Code', emoji: '✏️' },
    { id: 'preview', label: 'Preview', emoji: '👁️' },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <WorkspaceHeader projectId={projectId} onRefreshTree={refreshTree} />

      {isMobile ? (
        /* ── Mobile ── */
        <>
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {mobilePanel === 'files' && <FileExplorer projectId={projectId} onFileOpen={openFileHandler} onRefresh={refreshTree} />}
            {mobilePanel === 'editor' && <EditorPanel projectId={projectId} />}
            {mobilePanel === 'preview' && <PreviewPanel projectId={projectId} />}
            {mobilePanel === 'chat' && <ChatPanel projectId={projectId} onRefreshTree={refreshTree} />}
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
            {MOBILE_TABS.map(tab => (
              <button key={tab.id} onClick={() => setMobilePanel(tab.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '8px 0', gap: 2, border: 'none', cursor: 'pointer',
                color: mobilePanel === tab.id ? '#818cf8' : 'var(--muted)',
                background: mobilePanel === tab.id ? 'rgba(99,102,241,0.08)' : 'var(--surface)',
              }}>
                <span style={{ fontSize: 18 }}>{tab.emoji}</span>
                <span style={{ fontSize: 10 }}>{tab.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* ── Desktop ── */
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          {/* File Explorer */}
          <div style={{ width: explorerWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <FileExplorer projectId={projectId} onFileOpen={openFileHandler} onRefresh={refreshTree} />
          </div>
          <div className="resize-h" onMouseDown={startResize('explorer')} />

          {/* Editor */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <EditorPanel projectId={projectId} />
          </div>

          {/* Preview - only on wide screens */}
          {isWide && (
            <div style={{ width: '30%', minWidth: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <PreviewPanel projectId={projectId} />
            </div>
          )}

          {/* Chat */}
          <div style={{ width: chatWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="resize-h" onMouseDown={startResize('chat')} style={{ width: 3 }} />
            <ChatPanel projectId={projectId} onRefreshTree={refreshTree} />
          </div>

          {/* Tools sidebar */}
          <ToolsSidebar projectId={projectId} />
        </div>
      )}
    </div>
  );
}
