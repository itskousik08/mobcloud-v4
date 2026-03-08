import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { api } from './utils/api';
import HomePage from './pages/HomePage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';

export default function App() {
  const { setModels, setOllamaStatus, setSelectedModel, selectedModel } = useAppStore();

  useEffect(() => {
    // Check Ollama status on load
    const checkOllama = async () => {
      try {
        const status = await api.getOllamaStatus();
        setOllamaStatus(status.connected ? 'connected' : 'disconnected');

        if (status.connected) {
          const { models } = await api.getModels();
          setModels(models);
          if (!selectedModel && models.length > 0) {
            setSelectedModel(models[0].name);
          }
        }
      } catch {
        setOllamaStatus('disconnected');
      }
    };

    checkOllama();
    const interval = setInterval(checkOllama, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workspace/:projectId" element={<WorkspacePage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
