import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const TMPL_ICONS = { blank: '📄', landing: '🚀', portfolio: '👤', dashboard: '📊', blog: '✍️' };

export default function NewProjectModal({ open, onClose, onCreated }) {
  const { addProject } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('blank');
  const [templates, setTemplates] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      api.getTemplates().then(({ templates: t }) => setTemplates(t)).catch(() => {});
      setName(''); setDescription(''); setTemplate('blank');
    }
  }, [open]);

  async function create() {
    if (!name.trim()) { toast.error('Name required'); return; }
    setCreating(true);
    try {
      const { project } = await api.createProject({ name: name.trim(), description, template });
      addProject(project);
      onCreated?.(project);
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setCreating(false); }
  }

  const allTemplates = [{ id: 'blank', name: 'Blank Project', description: 'Start from scratch' }, ...templates];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}>
            
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-bold text-base">New Project</h2>
              <button onClick={onClose} className="btn-icon"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text2)' }}>Project Name *</label>
                <input autoFocus value={name} onChange={e => setName(e.target.value)}
                  placeholder="My awesome website" className="input"
                  onKeyDown={e => e.key === 'Enter' && create()} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text2)' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What are you building?" rows={2} className="input resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text2)' }}>Template</label>
                <div className="grid grid-cols-3 gap-2">
                  {allTemplates.map(t => (
                    <button key={t.id} onClick={() => setTemplate(t.id)}
                      className="relative p-3 rounded-xl text-left transition-all"
                      style={{
                        background: template === t.id ? 'rgba(99,102,241,0.1)' : 'var(--surface2)',
                        border: `1px solid ${template === t.id ? 'rgba(99,102,241,0.45)' : 'var(--border)'}`,
                      }}>
                      {template === t.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#6366f1' }}><Check size={10} className="text-white" /></div>
                      )}
                      <div className="text-xl mb-1">{TMPL_ICONS[t.id] || '📄'}</div>
                      <div className="text-xs font-semibold">{t.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4"
              style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={create} disabled={creating || !name.trim()} className="btn-primary">
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
