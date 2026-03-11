import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { api } from './utils/api';
import HomePage from './pages/HomePage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';

export default function App() {
  const { setModels, setOllamaStatus, setSelectedModel, selectedModel, theme } = useAppStore();

  useEffect(() => {
    // Apply theme
    if (theme === 'light') document.documentElement.classList.add('light-mode');
    else document.documentElement.classList.remove('light-mode');
  }, [theme]);

  useEffect(() => {
    async function check() {
      try {
        const status = await api.getOllamaStatus();
        setOllamaStatus(status.connected ? 'connected' : 'disconnected');
        if (status.connected) {
          const { models } = await api.getModels();
          setModels(models);
          if (!selectedModel && models.length > 0) setSelectedModel(models[0].name);
        }
      } catch { setOllamaStatus('disconnected'); }
    }
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workspace/:projectId" element={<WorkspacePage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
