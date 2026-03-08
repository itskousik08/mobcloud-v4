import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, FilePlus, FolderPlus, Trash2, RefreshCw, Edit2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  html: { icon: '🌐', color: '#e34c26' },
  css: { icon: '🎨', color: '#264de4' },
  js: { icon: '⚡', color: '#f7df1e' },
  jsx: { icon: '⚛️', color: '#61dafb' },
  ts: { icon: '🔷', color: '#3178c6' },
  tsx: { icon: '⚛️', color: '#3178c6' },
  json: { icon: '{}', color: '#fbc02d' },
  md: { icon: '📝', color: '#42a5f5' },
  svg: { icon: '🖼️', color: '#ff7043' },
  py: { icon: '🐍', color: '#3776ab' },
  php: { icon: '🐘', color: '#777bb4' },
  txt: { icon: '📄', color: '#90a4ae' },
};

function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || { icon: '📄', color: '#90a4ae' };
}

function TreeItem({ item, depth, projectId, onFileOpen, activeFilePath }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const { setFileTree } = useAppStore();

  const indent = depth * 12;

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      await api.deleteFile(projectId, item.path);
      const { tree } = await api.getProject(projectId);
      setFileTree(tree);
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!newName || newName === item.name) { setRenaming(false); return; }
    const newPath = item.path.replace(item.name, newName);
    try {
      await api.renameFile(projectId, item.path, newPath);
      const { tree } = await api.getProject(projectId);
      setFileTree(tree);
      setRenaming(false);
    } catch {
      toast.error('Rename failed');
    }
  }

  if (item.type === 'directory') {
    return (
      <div>
        <div
          className="file-tree-item group"
          style={{ paddingLeft: `${8 + indent}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-gray-600" style={{ flexShrink: 0 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <span style={{ flexShrink: 0 }}>
            {expanded ? <FolderOpen size={14} style={{ color: '#f59e0b' }} /> : <Folder size={14} style={{ color: '#f59e0b' }} />}
          </span>
          <span className="truncate flex-1">{item.name}</span>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 flex-shrink-0"
          >
            <Trash2 size={11} />
          </button>
        </div>
        {expanded && item.children?.map(child => (
          <TreeItem
            key={child.path}
            item={child}
            depth={depth + 1}
            projectId={projectId}
            onFileOpen={onFileOpen}
            activeFilePath={activeFilePath}
          />
        ))}
      </div>
    );
  }

  const { icon, color } = getFileIcon(item.name);
  const isActive = activeFilePath === item.path;

  return (
    <div
      className={`file-tree-item group ${isActive ? 'active' : ''}`}
      style={{ paddingLeft: `${8 + indent}px` }}
      onClick={() => onFileOpen(item.path)}
    >
      <span className="w-3 flex-shrink-0" />
      <span className="text-xs flex-shrink-0" style={{ color }}>{icon}</span>
      {renaming ? (
        <form onSubmit={handleRename} onClick={e => e.stopPropagation()} className="flex-1">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={() => setRenaming(false)}
            className="w-full bg-transparent border-b border-indigo-500 outline-none text-xs"
          />
        </form>
      ) : (
        <span className="truncate flex-1 text-xs">{item.name}</span>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
        <button onClick={e => { e.stopPropagation(); setRenaming(true); }} className="p-0.5 rounded hover:text-indigo-400">
          <Edit2 size={10} />
        </button>
        <button onClick={handleDelete} className="p-0.5 rounded hover:text-red-400">
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}

export default function FileExplorer({ projectId, onFileOpen }) {
  const { fileTree, setFileTree, currentProject, activeFile } = useAppStore();
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  async function refreshTree() {
    try {
      const { tree } = await api.getProject(projectId);
      setFileTree(tree);
    } catch {}
  }

  async function createFile(e) {
    e.preventDefault();
    if (!newFileName) return;
    try {
      await api.writeFile(projectId, newFileName, '');
      await refreshTree();
      onFileOpen(newFileName);
      setNewFileName('');
      setShowNewFile(false);
    } catch {
      toast.error('Failed to create file');
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#070710', borderRight: '1px solid #1a1a2e' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a1a2e' }}>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {currentProject?.name || 'Explorer'}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowNewFile(true)} title="New File" className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300">
            <FilePlus size={13} />
          </button>
          <button onClick={refreshTree} title="Refresh" className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* New file input */}
      {showNewFile && (
        <form onSubmit={createFile} className="px-2 py-1.5 border-b" style={{ borderColor: '#1a1a2e' }}>
          <input
            autoFocus
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="filename.html"
            className="input text-xs py-1"
            onBlur={() => setShowNewFile(false)}
          />
        </form>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-auto py-1">
        {fileTree.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-xs">No files yet</div>
        ) : (
          fileTree.map(item => (
            <TreeItem
              key={item.path}
              item={item}
              depth={0}
              projectId={projectId}
              onFileOpen={onFileOpen}
              activeFilePath={activeFile?.path}
            />
          ))
        )}
      </div>
    </div>
  );
}
