import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Trash2, ChevronRight, Clock, Sun, Moon, Cpu, WifiOff, Zap, Code2, Globe, Layers, ArrowRight, Settings, TerminalSquare, Activity, MonitorPlay } from "lucide-react";
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import NewProjectModal from '../components/Modals/NewProjectModal.jsx';
import SettingsModal from '../components/Modals/SettingsModal.jsx';

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, setProjects, removeProject, ollamaStatus, models, selectedModel, setSelectedModel, theme, toggleTheme } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getProjects()
      .then(({ projects }) => setProjects(projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  async function deleteProject(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    await api.deleteProject(id);
    removeProject(id);
    toast.success('Deleted');
  }

  const statusColor = { connected: '#00ff9d', disconnected: '#ff003c', unknown: '#ffb800' }[ollamaStatus];
  const statusLabel = { connected: 'Ollama Connected', disconnected: 'Ollama Offline', unknown: 'Checking...' }[ollamaStatus];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-auto relative font-sans">

      {/* Dynamic Cyber Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[rgba(0,240,255,0.05)] blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[rgba(112,0,255,0.08)] blur-[120px] rounded-full animate-float" />
        <div className="absolute top-[30%] left-[60%] w-[30%] h-[30%] bg-[rgba(0,255,157,0.03)] blur-[100px] rounded-full animate-float-fast" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiLz48L3N2Zz4=')] bg-repeat opacity-50 mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="sticky top-0 z-50 px-6 max-w-7xl mx-auto w-full py-4 flex items-center justify-between backdrop-blur-xl border-b border-[rgba(0,240,255,0.1)] bg-[#0a0a0f]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-[0_0_15px_rgba(0,240,255,0.4)] bg-gradient-to-br from-[#00f0ff] to-[#7000ff]">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-lg font-['Orbitron'] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">MobCloud</span>
              <span className="text-[10px] text-[#00f0ff] font-mono tracking-widest uppercase">Platform v4.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
              <span className="status-dot relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: statusColor }}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2`} style={{ backgroundColor: statusColor }}></span>
              </span>
              <span className="font-mono text-[11px] tracking-wider" style={{ color: statusColor }}>{statusLabel}</span>
            </div>

            {/* Model Selector */}
            {models.length > 0 && (
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="hidden md:block text-xs font-mono px-3 py-1.5 rounded-lg border border-[rgba(0,240,255,0.2)] bg-[#12121a] text-[#00f0ff] outline-none cursor-pointer focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
              >
                {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            )}

            <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors tooltip" data-tip="Settings">
              <Settings size={18} />
            </button>

            <button onClick={() => setShowNew(true)} className="group relative inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-[#0a0a0f] transition-all duration-200 bg-[#00f0ff] border border-transparent rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f0ff] focus:ring-offset-[#0a0a0f]">
              <Plus size={16} className="transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline font-mono uppercase tracking-wider text-xs">New Project</span>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col gap-16">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center mt-8 md:mt-16 relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(0,240,255,0.15)] via-transparent to-transparent pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border border-[#00f0ff]/30 bg-[#00f0ff]/5 backdrop-blur-md"
            >
              <Zap size={14} className="text-[#00f0ff]" />
              <span className="text-[#00f0ff] text-xs font-mono tracking-widest uppercase">Local Multi-Agent AI System</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-2xl leading-tight">
              Build the Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#7000ff] filter drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                Locally.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Your autonomous AI coding platform. Chat, generate code, and preview projects instantly—powered by an intelligent multi-agent simulation running entirely on your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button onClick={() => setShowNew(true)} className="group relative px-8 py-4 text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95 flex items-center gap-3">
                <span className="font-mono uppercase tracking-widest">Deploy Agent</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button onClick={() => document.getElementById('projects-dashboard').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 text-sm font-bold text-gray-300 transition-all duration-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white flex items-center gap-3">
                <MonitorPlay size={18} />
                <span className="font-sans">View Dashboard</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 w-full max-w-4xl mx-auto border-t border-white/10 pt-10">
              {[
                { icon: <Cpu />, title: 'Ollama Core', desc: '100% private inference' },
                { icon: <Code2 />, title: 'Auto Coder', desc: 'Writes real files' },
                { icon: <Globe />, title: 'Live Preview', desc: 'Instant feedback loop' },
                { icon: <Layers />, title: 'Agent Network', desc: 'Simulated roles' },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-3 text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00f0ff] group-hover:bg-[#00f0ff]/10 group-hover:border-[#00f0ff]/30 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-200">{f.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Project Dashboard Preview */}
          <div id="projects-dashboard" className="pt-8 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black font-['Orbitron'] tracking-wide">Workspace</h2>
                <p className="text-gray-400 mt-1 text-sm">Manage your active agent environments</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <TerminalSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filter environments..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-[#00f0ff] rounded-full animate-spin" />
                <div className="text-[#00f0ff] font-mono text-xs tracking-widest animate-pulse">INITIALIZING NEURAL NET...</div>
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-6 shadow-xl">
                  <Activity size={32} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Environments</h3>
                <p className="text-gray-400 text-sm max-w-sm text-center mb-6">Initialize a new project to spin up a local AI agent instance.</p>
                <button onClick={() => setShowNew(true)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                  <Plus size={16} /> Deploy First Project
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filtered.map((p, i) => {
                    const progress = Math.floor(Math.random() * 40) + 60; // Mock progress for dashboard visual
                    const isReact = p.template?.includes('react') || p.template?.includes('vite');

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(`/workspace/${p.id}`)}
                        className="group relative bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-[#00f0ff]/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,240,255,0.1)] flex flex-col"
                        key={p.id}
                      >
                        {/* Fake Project Thumbnail / Header */}
                        <div className="h-32 w-full relative overflow-hidden bg-[#0c0c14]">
                          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(0,240,255,1)_0%,rgba(112,0,255,1)_100%)]" />
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] bg-repeat" />

                          <div className="absolute top-4 right-4 flex gap-2">
                            <div className="px-2 py-1 rounded bg-black/50 backdrop-blur text-[10px] font-mono text-gray-300 border border-white/10">
                              {p.template || 'blank'}
                            </div>
                            <button onClick={(e) => deleteProject(e, p.id)} className="w-6 h-6 rounded bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#ff003c] hover:border-[#ff003c]/50 transition-colors z-10">
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="absolute bottom-4 left-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isReact ? 'bg-[#0a1929] text-[#61dafb]' : 'bg-[#1a1a24] text-white'} border border-white/10`}>
                              {isReact ? <Code2 size={20} /> : <Folder size={20} />}
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00f0ff] transition-colors">{p.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2 flex-1 mb-4">{p.description || 'No description provided.'}</p>

                          {/* Mock Progress Bar representing Agent completion or build status */}
                          <div className="mb-4">
                            <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1.5 uppercase tracking-wider">
                              <span>Agent Status</span>
                              <span className="text-[#00f0ff]">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#7000ff] to-[#00f0ff] rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} />
                              <span>{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#00f0ff] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-mono uppercase tracking-widest text-[10px]">
                              Open Workspace <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-gray-600 font-mono tracking-widest uppercase border-t border-white/5 mt-auto bg-[#0a0a0f] z-20">
          MobCloud AI // Simulated Multi-Agent Architecture
        </footer>
      </div>

      {/* Modals */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <NewProjectModal open={showNew} onClose={() => setShowNew(false)} onCreated={(p) => navigate(`/workspace/${p.id}`)} />
    </div>
  );
}
