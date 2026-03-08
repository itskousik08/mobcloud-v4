import React, { useRef, useEffect, useCallback, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { X, Save, Plus, FileText } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

function getLanguage(filePath) {
  const ext = filePath?.split('.').pop()?.toLowerCase();
  const map = {
    html: html(), htm: html(),
    css: css(),
    js: javascript(), jsx: javascript({ jsx: true }),
    ts: javascript({ typescript: true }), tsx: javascript({ jsx: true, typescript: true }),
    json: json(),
  };
  return map[ext] || html();
}

function EditorTab({ file, isActive, onSelect, onClose }) {
  const ext = file.path.split('.').pop();
  return (
    <div
      onClick={() => onSelect(file)}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer border-r flex-shrink-0 group transition-colors ${
        isActive
          ? 'text-white border-t-2 border-t-indigo-500'
          : 'text-gray-500 hover:text-gray-300'
      }`}
      style={{
        borderRightColor: '#1a1a2e',
        background: isActive ? '#0d0d1a' : 'transparent'
      }}
    >
      <span className="font-mono">{file.path.split('/').pop()}</span>
      {file.modified && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
      <button
        onClick={e => { e.stopPropagation(); onClose(file.path); }}
        className="opacity-0 group-hover:opacity-100 hover:text-white ml-1"
      >
        <X size={11} />
      </button>
    </div>
  );
}

export default function EditorPanel({ projectId }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const { openFiles, activeFile, closeFile, setActiveFile, updateFileContent, markFileSaved } = useAppStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    // Destroy old editor
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const state = EditorState.create({
      doc: activeFile.content || '',
      extensions: [
        basicSetup,
        oneDark,
        getLanguage(activeFile.path),
        EditorView.theme({
          '&': { height: '100%', background: '#0a0a18' },
          '.cm-content': { fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', padding: '8px 0' },
          '.cm-focused': { outline: 'none' },
          '.cm-gutters': { background: '#070710', borderRight: '1px solid #1a1a2e' },
          '.cm-activeLineGutter': { background: 'rgba(99,102,241,.08)' },
          '.cm-activeLine': { background: 'rgba(99,102,241,.04)' },
          '.cm-selectionBackground': { background: 'rgba(99,102,241,.25) !important' },
        }),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const content = update.state.doc.toString();
            updateFileContent(activeFile.path, content);
          }
        }),
      ]
    });

    viewRef.current = new EditorView({ state, parent: editorRef.current });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [activeFile?.path]);

  // Update editor content when file changes externally (AI writes it)
  useEffect(() => {
    if (!viewRef.current || !activeFile) return;
    const currentDoc = viewRef.current.state.doc.toString();
    if (currentDoc !== activeFile.content && activeFile.content !== undefined) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: activeFile.content || ''
        }
      });
    }
  }, [activeFile?.content]);

  const handleSave = useCallback(async () => {
    if (!activeFile || saving) return;
    setSaving(true);
    try {
      await api.writeFile(projectId, activeFile.path, activeFile.content);
      markFileSaved(activeFile.path);
      toast.success(`Saved ${activeFile.path.split('/').pop()}`);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [activeFile, projectId, saving]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a0a18' }}>
      {/* Tabs */}
      <div className="flex items-center overflow-x-auto flex-shrink-0"
        style={{ background: '#070710', borderBottom: '1px solid #1a1a2e', minHeight: 36 }}>
        {openFiles.map(file => (
          <EditorTab
            key={file.path}
            file={file}
            isActive={activeFile?.path === file.path}
            onSelect={setActiveFile}
            onClose={closeFile}
          />
        ))}
        {openFiles.length === 0 && (
          <div className="text-xs text-gray-600 px-4 py-2">Open a file to edit</div>
        )}
        <div className="flex-1" />
        {activeFile && (
          <button
            onClick={handleSave}
            className={`px-3 py-1 text-xs flex items-center gap-1 transition-colors flex-shrink-0 ${
              saving ? 'text-indigo-400' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Save size={12} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {/* Editor */}
      {activeFile ? (
        <div className="flex-1 overflow-hidden">
          <div ref={editorRef} className="h-full" />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a file to edit</p>
            <p className="text-xs mt-1 opacity-60">Or let the AI create files for you</p>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-0.5 text-xs text-gray-600 flex-shrink-0"
        style={{ background: '#070710', borderTop: '1px solid #1a1a2e' }}>
        <span>{activeFile?.path || ''}</span>
        <div className="flex items-center gap-4">
          <span>{activeFile?.path?.split('.').pop()?.toUpperCase()}</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}
