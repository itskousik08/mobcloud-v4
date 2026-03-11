import React, { useRef, useEffect, useState } from 'react';
import { X, Save, Code2, Loader } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  html: '🌐', htm: '🌐', css: '🎨', scss: '🎨', js: '⚡', jsx: '⚛️',
  ts: '🔷', tsx: '⚛️', json: '{}', md: '📝', txt: '📄',
  py: '🐍', php: '🐘', svg: '🖼️', png: '🖼️', sh: '⬢', env: '🔑',
};

function getFileIcon(filePath) {
  if (!filePath) return '📄';
  const ext = filePath.split('.').pop()?.toLowerCase();
  const name = filePath.split('/').pop()?.toLowerCase();
  if (name === 'dockerfile') return '🐳';
  if (name === '.gitignore') return '⬡';
  return FILE_ICONS[ext] || '📄';
}

// ── CodeMirror loader (lazy) ──────────────────
let cm = null;
async function getCM() {
  if (cm) return cm;
  try {
    const [
      { EditorView, basicSetup },
      { EditorState },
      { oneDark },
      { html },
      { css },
      { javascript },
      { json },
    ] = await Promise.all([
      import('codemirror'),
      import('@codemirror/state'),
      import('@codemirror/theme-one-dark'),
      import('@codemirror/lang-html'),
      import('@codemirror/lang-css'),
      import('@codemirror/lang-javascript'),
      import('@codemirror/lang-json'),
    ]);
    cm = { EditorView, EditorState, basicSetup, oneDark, html, css, javascript, json };
    return cm;
  } catch (e) {
    console.warn('CodeMirror unavailable, using fallback textarea', e);
    return null;
  }
}

function getLang(filePath, cmMod) {
  if (!filePath || !cmMod) return null;
  const ext = filePath.split('.').pop()?.toLowerCase();
  const { html, css, javascript, json } = cmMod;
  const map = {
    html: html(), htm: html(),
    css: css(), scss: css(),
    js: javascript(), jsx: javascript({ jsx: true }),
    ts: javascript({ typescript: true }),
    tsx: javascript({ jsx: true, typescript: true }),
    json: json(),
  };
  return map[ext] || null;
}

// ── CodeMirror Editor ─────────────────────────
function CMEditor({ filePath, content, onChange }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCM().then(cmMod => {
      if (!mounted || !containerRef.current || !cmMod) { setReady(false); return; }
      viewRef.current?.destroy();
      const { EditorView, EditorState, basicSetup, oneDark } = cmMod;
      const lang = getLang(filePath, cmMod);
      const exts = [
        basicSetup, oneDark,
        EditorView.theme({
          '&': { height: '100%', background: 'var(--surface)' },
          '.cm-scroller': { fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '13px', overflow: 'auto' },
          '.cm-content': { padding: '8px 0', minHeight: '100%' },
          '.cm-focused': { outline: 'none' },
          '.cm-gutters': { background: 'var(--surface2)', borderRight: '1px solid var(--border)', minWidth: 44 },
          '.cm-lineNumbers .cm-gutterElement': { color: 'var(--muted)', fontSize: '12px' },
          '.cm-activeLineGutter': { background: 'rgba(99,102,241,0.1)' },
          '.cm-activeLine': { background: 'rgba(99,102,241,0.04)' },
          '.cm-cursor': { borderLeftColor: '#818cf8' },
          '.cm-selectionBackground, ::selection': { background: 'rgba(99,102,241,0.25) !important' },
        }),
        EditorView.updateListener.of(upd => {
          if (upd.docChanged) onChange(upd.state.doc.toString());
        }),
        EditorView.lineWrapping,
      ];
      if (lang) exts.push(lang);

      viewRef.current = new EditorView({
        state: EditorState.create({ doc: content || '', extensions: exts }),
        parent: containerRef.current,
      });
      setReady(true);
    });
    return () => {
      mounted = false;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [filePath]);

  // Update content externally without recreating editor
  useEffect(() => {
    if (!viewRef.current || !ready) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: content || '' }
      });
    }
  }, [content, ready]);

  return <div ref={containerRef} style={{ height: '100%', overflow: 'hidden' }} />;
}

// ── Main EditorPanel ──────────────────────────
export default function EditorPanel({ projectId }) {
  const { openFiles, activeFile, closeFile, setActiveFile, updateFileContent, markFileSaved } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [cmAvailable, setCmAvailable] = useState(true);

  // Check CM availability on mount
  useEffect(() => {
    getCM().then(mod => setCmAvailable(!!mod));
  }, []);

  // Ctrl+S save
  useEffect(() => {
    const onKey = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!activeFile || saving) return;
        setSaving(true);
        try {
          await api.writeFile(projectId, activeFile.path, activeFile.content || '');
          markFileSaved(activeFile.path);
          toast.success(`Saved ${activeFile.path.split('/').pop()}`, { duration: 1500 });
        } catch (err) {
          toast.error('Save failed: ' + err.message);
        }
        setSaving(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeFile, saving, projectId]);

  async function saveFile() {
    if (!activeFile || saving) return;
    setSaving(true);
    try {
      await api.writeFile(projectId, activeFile.path, activeFile.content || '');
      markFileSaved(activeFile.path);
      toast.success('Saved!', { duration: 1200 });
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    }
    setSaving(false);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>
      {/* File tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', background: 'var(--surface2)',
        borderBottom: '1px solid var(--border)', flexShrink: 0, overflowX: 'auto', minHeight: 36,
      }} className="no-scrollbar">
        {openFiles.map(file => (
          <div key={file.path} onClick={() => setActiveFile(file)} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', height: 36,
            cursor: 'pointer', flexShrink: 0, fontSize: 12, whiteSpace: 'nowrap',
            borderRight: '1px solid var(--border)',
            background: activeFile?.path === file.path ? 'var(--surface)' : 'transparent',
            color: activeFile?.path === file.path ? 'var(--text)' : 'var(--muted)',
            borderBottom: activeFile?.path === file.path ? '2px solid #6366f1' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 13 }}>{getFileIcon(file.path)}</span>
            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.path.split('/').pop()}
            </span>
            {file.dirty && <span style={{ color: '#f59e0b', fontSize: 16, lineHeight: 1 }}>•</span>}
            <button
              onClick={e => { e.stopPropagation(); closeFile(file.path); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', padding: '2px 3px', borderRadius: 3,
                display: 'flex', alignItems: 'center', marginLeft: 2,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {activeFile && (
          <button onClick={saveFile} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
            margin: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: 'rgba(99,102,241,0.15)', color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.25)', cursor: saving ? 'wait' : 'pointer',
          }}>
            {saving ? <Loader size={11} className="animate-spin" /> : <Save size={11} />}
            Save
          </button>
        )}
      </div>

      {/* Editor content */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
        {!activeFile ? (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <Code2 size={40} style={{ color: 'var(--border2)', opacity: 0.5 }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text2)', fontWeight: 600, marginBottom: 4 }}>No file open</p>
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                Click a file in the explorer, or ask AI to generate code
              </p>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 11 }}>Ctrl+K → focus chat · Ctrl+S → save</p>
          </div>
        ) : cmAvailable ? (
          <CMEditor
            key={activeFile.path}
            filePath={activeFile.path}
            content={activeFile.content || ''}
            onChange={(newContent) => updateFileContent(activeFile.path, newContent)}
          />
        ) : (
          /* Fallback: plain textarea */
          <textarea
            value={activeFile.content || ''}
            onChange={e => updateFileContent(activeFile.path, e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', height: '100%', padding: '12px 16px', border: 'none',
              resize: 'none', outline: 'none', background: 'var(--surface)',
              color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13, lineHeight: 1.7, tabSize: 2,
            }}
          />
        )}
      </div>
    </div>
  );
}
