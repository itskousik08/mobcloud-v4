import React from 'react';
import { Wifi, WifiOff, Loader } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function OllamaStatusBar({ compact }) {
  const { ollamaStatus } = useAppStore();

  const states = {
    connected: { icon: <Wifi size={12} />, text: 'Ollama', color: '#10b981', bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.2)' },
    disconnected: { icon: <WifiOff size={12} />, text: compact ? '!' : 'Ollama offline', color: '#f43f5e', bg: 'rgba(244,63,94,.1)', border: 'rgba(244,63,94,.2)' },
    unknown: { icon: <Loader size={12} className="animate-spin" />, text: compact ? '' : 'Checking...', color: '#f59e0b', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.2)' }
  };

  const state = states[ollamaStatus] || states.unknown;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium`}
      style={{ color: state.color, background: state.bg, border: `1px solid ${state.border}` }}>
      {state.icon}
      {!compact && <span>{state.text}</span>}
    </div>
  );
}
