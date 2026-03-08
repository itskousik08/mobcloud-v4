import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Trash2, Zap, Code2, Globe, Cpu, ChevronRight, Upload, Star, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import OllamaStatusBar from '../components/UI/OllamaStatusBar.jsx';
import NewProjectModal from '../components/Modals/NewProjectModal.jsx';
import ModelSelector from '../components/UI/ModelSelector.jsx';

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, setProjects, removeProject, ollamaStatus, models } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { projects } = await api.getProjects();
      setProjects(projects);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    try {
      await api.deleteProject(id);
      removeProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  function openProject(project) {
    navigate(`/workspace/${project.id}`);
  }

  const features = [
    { icon: <Cpu size={20} />, title: 'Local AI Models', desc: 'Powered by Ollama — fully private' },
    { icon: <Code2 size={20} />, title: 'Live Code Gen', desc: 'Watch AI write code in real time' },
    { icon: <Globe size={20} />, title: 'Live Preview', desc: 'Instant preview with auto-refresh' },
    { icon: <Zap size={20} />, title: 'AI Agent', desc: 'Autonomous file creation & editing' },
  ];

  return (
    <div className="min-h-screen animated-bg flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            M
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Mobclowd</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-indigo-500/30 text-indigo-400"
            style={{ background: 'rgba(99,102,241,.1)' }}>
            Beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ModelSelector />
          <OllamaStatusBar />
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 text-indigo-400 text-sm mb-6"
              style={{ background: 'rgba(99,102,241,.08)' }}>
              <Zap size={14} /> AI-powered local development
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Build websites with{' '}
              <span className="gradient-text">local AI</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
              A professional AI development platform powered by Ollama. Create, edit, and deploy websites — completely offline.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * .1 + .2 }}
                className="panel p-4 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,.15)', color: '#818cf8' }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Projects section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Projects</h2>
            <button
              onClick={() => setShowNewProject(true)}
              className="btn-primary"
            >
              <Plus size={16} /> New Project
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="typing-indicator justify-center">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <p className="mt-3 text-sm">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 panel"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,.1)' }}>
                <Folder size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-500 text-sm mb-6">Create your first project to get started with AI-powered development</p>
              <button onClick={() => setShowNewProject(true)} className="btn-primary mx-auto">
                <Plus size={16} /> Create First Project
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <AnimatePresence>
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: .95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: .95 }}
                    transition={{ delay: i * .05 }}
                    onClick={() => openProject(project)}
                    className="panel p-5 cursor-pointer group hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-1"
                    style={{ '--hover-shadow': '0 8px 30px rgba(99,102,241,.15)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.2), rgba(139,92,246,.1))' }}>
                        <Folder size={18} className="text-indigo-400" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={14} className="text-gray-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-white mb-1 truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      {project.template && project.template !== 'blank' && (
                        <span className="px-1.5 py-0.5 rounded text-indigo-400"
                          style={{ background: 'rgba(99,102,241,.1)' }}>
                          {project.template}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Ollama warning if disconnected */}
      {ollamaStatus === 'disconnected' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-strong border border-yellow-500/20 px-5 py-3 rounded-xl flex items-center gap-3 text-sm max-w-md">
          <span className="text-yellow-400">⚠️</span>
          <div>
            <span className="text-yellow-300 font-medium">Ollama not detected.</span>
            <span className="text-gray-400 ml-1">Start Ollama to use AI features.</span>
          </div>
        </div>
      )}

      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreated={(project) => {
          navigate(`/workspace/${project.id}`);
        }}
      />
    </div>
  );
}
