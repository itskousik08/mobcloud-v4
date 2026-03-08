import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';
import { useSocket } from '../hooks/useSocket.js';
import toast from 'react-hot-toast';
import WorkspaceHeader from '../components/Workspace/WorkspaceHeader.jsx';
import ActivityBar from '../components/Workspace/ActivityBar.jsx';
import FileExplorer from '../components/FileExplorer/FileExplorer.jsx';
import EditorPanel from '../components/Editor/EditorPanel.jsx';
import ChatPanel from '../components/Chat/ChatPanel.jsx';
import PreviewPanel from '../components/Preview/PreviewPanel.jsx';
import ThinkingPanel from '../components/AI/ThinkingPanel.jsx';
import ResizeHandle from '../components/UI/ResizeHandle.jsx';

export default function WorkspacePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    currentProject, setCurrentProject,
    setFileTree, openFile, updateFileContent,
    showFileExplorer, showChat, showPreview,
    setPreviewUrl, setIsAiThinking
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [aiActions, setAiActions] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [chatWidth, setChatWidth] = useState(340);

  // Load project
  useEffect(() => {
    async function load() {
      try {
        const { project, tree } = await api.getProject(projectId);
        setCurrentProject(project);
        setFileTree(tree);
        setPreviewUrl(`/preview/${projectId}/index.html`);
      } catch (err) {
        toast.error('Project not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // Socket events
  useSocket(projectId, {
    onFileChanged: async ({ path, content }) => {
      updateFileContent(path, content);
      // Refresh file tree
      const { tree } = await api.getProject(projectId).catch(() => ({ tree: null }));
      if (tree) setFileTree(tree);
      // Trigger preview refresh
      setPreviewUrl('');
      setTimeout(() => setPreviewUrl(`/preview/${projectId}/index.html?t=${Date.now()}`), 100);
    },
    onAiAction: (data) => {
      setAiActions(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 20));
    }
  });

  const handleFileOpen = useCallback(async (filePath) => {
    try {
      const { content, mimeType } = await api.readFile(projectId, filePath);
      openFile({ path: filePath, content, mimeType });
    } catch {
      toast.error('Failed to open file');
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="typing-indicator justify-center">
            <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
          </div>
          <p className="text-gray-500 text-sm mt-3">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#020209' }}>
      <WorkspaceHeader project={currentProject} />

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar />

        {/* File Explorer */}
        {showFileExplorer && (
          <>
            <div style={{ width: sidebarWidth, minWidth: 160, maxWidth: 400 }} className="flex-shrink-0">
              <FileExplorer
                projectId={projectId}
                onFileOpen={handleFileOpen}
              />
            </div>
            <ResizeHandle onResize={(dx) => setSidebarWidth(w => Math.max(160, Math.min(400, w + dx)))} />
          </>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <EditorPanel projectId={projectId} />
        </div>

        {/* Preview */}
        {showPreview && (
          <>
            <ResizeHandle onResize={(dx) => {}} />
            <div className="flex-shrink-0" style={{ width: '40%', minWidth: 300 }}>
              <PreviewPanel projectId={projectId} />
            </div>
          </>
        )}

        {/* Chat */}
        {showChat && (
          <>
            <ResizeHandle onResize={(dx) => setChatWidth(w => Math.max(280, Math.min(600, w - dx)))} />
            <div style={{ width: chatWidth, minWidth: 280 }} className="flex-shrink-0">
              <ChatPanel projectId={projectId} />
            </div>
          </>
        )}
      </div>

      {/* AI Thinking overlay */}
      <ThinkingPanel />
    </div>
  );
}
