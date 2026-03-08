import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Check, Upload } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const TEMPLATE_ICONS = {
  blank: '📄',
  landing: '🚀',
  portfolio: '👤',
  dashboard: '📊',
  blog: '✍️'
};

export default function NewProjectModal({ open, onClose, onCreated }) {
  const { addProject } = useAppStore();
  const [step, setStep] = useState(1); // 1: details, 2: template
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('blank');
  const [templates, setTemplates] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      api.getTemplates().then(({ templates: t }) => setTemplates(t)).catch(() => {});
      setStep(1);
      setName('');
      setDescription('');
      setTemplate('blank');
    }
  }, [open]);

  async function handleCreate() {
    if (!name.trim()) { toast.error('Project name required'); return; }
    setCreating(true);
    try {
      const { project, tree } = await api.createProject({ name: name.trim(), description, template });
      addProject(project);
      onCreated?.(project);
      onClose();
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  const allTemplates = [
    { id: 'blank', name: 'Blank Project', description: 'Start from scratch' },
    ...templates
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: .95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .95, y: 10 }}
            className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: '#0d0d1a', border: '1px solid #252540', boxShadow: '0 40px 80px rgba(0,0,0,.8)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid #1a1a2e' }}>
              <h2 className="text-lg font-bold">New Project</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {/* Project info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name *</label>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="My awesome website"
                    className="input"
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What are you building?"
                    rows={2}
                    className="input resize-none"
                  />
                </div>
              </div>

              {/* Templates */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-3">Start with a template</label>
                <div className="grid grid-cols-3 gap-2">
                  {allTemplates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`relative p-3 rounded-xl text-left transition-all ${
                        template === t.id
                          ? 'border-indigo-500/60'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                      style={{
                        background: template === t.id ? 'rgba(99,102,241,.1)' : 'rgba(255,255,255,.03)',
                        border: `1px solid ${template === t.id ? 'rgba(99,102,241,.4)' : '#1a1a2e'}`
                      }}
                    >
                      {template === t.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      <div className="text-xl mb-1.5">{TEMPLATE_ICONS[t.id] || '📄'}</div>
                      <div className="text-xs font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4"
              style={{ borderTop: '1px solid #1a1a2e' }}>
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !name.trim()} className="btn-primary">
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
