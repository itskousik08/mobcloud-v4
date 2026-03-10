import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  GitBranch, Database, Shield, Cpu, BarChart2, Bot, Globe,
  Mail, X,
} from 'lucide-react';
import GitPanel from '../Git/GitPanel.jsx';
import DatabasePanel from '../Database/DatabasePanel.jsx';
import SecurityPanel from '../Security/SecurityPanel.jsx';
import CICDPanel from '../CI/CICDPanel.jsx';
import AnalyticsPanel from '../Analytics/AnalyticsPanel.jsx';
import AgentsPanel from '../Agents/AgentsPanel.jsx';
import APITestPanel from '../API/APITestPanel.jsx';
import EmailPanel from '../Email/EmailPanel.jsx';

const TOOLS = [
  { id: 'agents', icon: Bot, label: 'AI Agents', color: '#c084fc' },
  { id: 'git', icon: GitBranch, label: 'Git', color: '#34d399' },
  { id: 'security', icon: Shield, label: 'Security', color: '#10b981' },
  { id: 'api', icon: Globe, label: 'API Tester', color: '#22d3ee' },
  { id: 'email', icon: Mail, label: 'Email', color: '#f59e0b' },
  { id: 'db', icon: Database, label: 'Database', color: '#22d3ee' },
  { id: 'cicd', icon: Cpu, label: 'CI/CD', color: '#f59e0b' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics', color: '#818cf8' },
];

function ToolPanel({ toolId, projectId, onClose }) {
  const title = TOOLS.find(t => t.id === toolId)?.label || toolId;

  function renderContent() {
    try {
      switch (toolId) {
        case 'git': return <GitPanel projectId={projectId} />;
        case 'db': return <DatabasePanel projectId={projectId} />;
        case 'security': return <SecurityPanel projectId={projectId} />;
        case 'cicd': return <CICDPanel projectId={projectId} />;
        case 'api': return <APITestPanel />;
        case 'agents': return <AgentsPanel projectId={projectId} />;
        case 'analytics': return <AnalyticsPanel projectId={projectId} />;
        case 'email': return <EmailPanel projectId={projectId} />;
        default: return <div style={{ padding: 20, color: 'var(--muted)' }}>Coming soon</div>;
      }
    } catch (err) {
      return (
        <div style={{ padding: 20 }}>
          <p style={{ color: '#f43f5e', fontSize: 13 }}>Failed to load panel</p>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>{err.message}</p>
        </div>
      );
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      width: 340, flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface2)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', flex: 1 }}>{title}</span>
        <button onClick={onClose} className="btn-icon" style={{ width: 26, height: 26 }}>
          <X size={13} />
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default function ToolsSidebar({ projectId }) {
  const [activeTool, setActiveTool] = useState(null);

  function toggle(toolId) {
    setActiveTool(prev => prev === toolId ? null : toolId);
  }

  return (
    <div style={{ display: 'flex', height: '100%', flexShrink: 0, position: 'relative' }}>
      {/* Floating panel - positioned absolutely to avoid layout shift */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', right: '100%', top: 0, bottom: 0,
              zIndex: 50, display: 'flex', overflow: 'hidden',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
            }}>
            <ToolPanel toolId={activeTool} projectId={projectId} onClose={() => setActiveTool(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar icon column */}
      <div style={{
        display: 'flex', flexDirection: 'column', background: 'var(--surface)',
        borderLeft: '1px solid var(--border)', width: 48, flexShrink: 0,
        alignItems: 'center', padding: '8px 0', gap: 2,
      }}>
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button key={tool.id} onClick={() => toggle(tool.id)} title={tool.label} style={{
              width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 1, transition: 'all 0.15s',
              background: isActive ? `${tool.color}18` : 'transparent',
              color: isActive ? tool.color : 'var(--muted)',
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text2)'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}>
              <tool.icon size={15} />
              <span style={{ fontSize: 8, lineHeight: 1 }}>{tool.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
