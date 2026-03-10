import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Theme ──────────────────────────────────────
      theme: 'dark',
      toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // ── Personality ────────────────────────────────
      personality: 'professional',
      userName: '',
      userCity: '',
      setPersonality: (personality) => set({ personality }),
      setUserName: (userName) => set({ userName }),
      setUserCity: (userCity) => set({ userCity }),

      // ── Ollama ─────────────────────────────────────
      ollamaStatus: 'unknown',
      models: [],
      selectedModel: '',
      setOllamaStatus: (s) => set({ ollamaStatus: s }),
      setModels: (m) => set({ models: m }),
      setSelectedModel: (m) => set({ selectedModel: m }),

      // ── Projects ───────────────────────────────────
      projects: [],
      currentProject: null,
      setProjects: (p) => set({ projects: p }),
      setCurrentProject: (p) => set({ currentProject: p }),
      addProject: (p) => set(s => ({ projects: [p, ...s.projects] })),
      removeProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id) })),

      // ── File Explorer ──────────────────────────────
      fileTree: [],
      setFileTree: (tree) => set({ fileTree: tree }),

      // ── Editor ─────────────────────────────────────
      openFiles: [],
      activeFile: null,
      openFile: (file) => set(s => {
        const exists = s.openFiles.find(f => f.path === file.path);
        if (exists) return { activeFile: exists };
        return { openFiles: [...s.openFiles, file], activeFile: file };
      }),
      closeFile: (filePath) => set(s => {
        const updated = s.openFiles.filter(f => f.path !== filePath);
        const wasActive = s.activeFile?.path === filePath;
        return {
          openFiles: updated,
          activeFile: wasActive ? (updated[updated.length - 1] || null) : s.activeFile
        };
      }),
      setActiveFile: (file) => set({ activeFile: file }),
      updateFileContent: (filePath, content) => set(s => ({
        openFiles: s.openFiles.map(f => f.path === filePath ? { ...f, content, dirty: true } : f),
        activeFile: s.activeFile?.path === filePath ? { ...s.activeFile, content, dirty: true } : s.activeFile
      })),
      markFileSaved: (filePath) => set(s => ({
        openFiles: s.openFiles.map(f => f.path === filePath ? { ...f, dirty: false } : f),
        activeFile: s.activeFile?.path === filePath ? { ...s.activeFile, dirty: false } : s.activeFile
      })),
      closeAllFiles: () => set({ openFiles: [], activeFile: null }),

      // ── Preview ────────────────────────────────────
      previewUrl: '',
      previewMode: 'desktop',
      setPreviewUrl: (url) => set({ previewUrl: url }),
      setPreviewMode: (mode) => set({ previewMode: mode }),

      // ── Chat / AI ──────────────────────────────────
      chatMessages: {},
      isAiThinking: false,
      aiThinkingSteps: [],
      aiActions: [],

      getMessages: (projectId) => {
        return get().chatMessages[projectId] || [];
      },
      addMessage: (msg) => set(s => {
        const projectId = s.currentProject?.id || 'global';
        const msgs = s.chatMessages[projectId] || [];
        return {
          chatMessages: {
            ...s.chatMessages,
            [projectId]: [...msgs, { ...msg, id: Date.now() + Math.random() }]
          }
        };
      }),
      updateLastMessage: (updates) => set(s => {
        const projectId = s.currentProject?.id || 'global';
        const msgs = [...(s.chatMessages[projectId] || [])];
        if (!msgs.length) return {};
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...updates };
        return { chatMessages: { ...s.chatMessages, [projectId]: msgs } };
      }),
      clearMessages: (projectId) => set(s => ({
        chatMessages: { ...s.chatMessages, [projectId]: [] }
      })),
      setIsAiThinking: (v) => set({ isAiThinking: v }),
      setAiThinkingSteps: (steps) => set({ aiThinkingSteps: steps }),
      addAiThinkingStep: (step) => set(s => ({
        aiThinkingSteps: [...s.aiThinkingSteps, step]
      })),
      addAiAction: (action) => set(s => ({
        aiActions: [...s.aiActions.slice(-50), { ...action, time: Date.now() }]
      })),

      // ── Panel visibility ───────────────────────────
      showExplorer: true,
      showPreview: true,
      showChat: true,
      togglePanel: (panel) => set(s => ({ [`show${panel}`]: !s[`show${panel}`] })),

      // ── Mobile ─────────────────────────────────────
      mobilePanel: 'chat',
      setMobilePanel: (p) => set({ mobilePanel: p }),

      // ── Notifications ──────────────────────────────
      notifications: [],
      addNotification: (n) => set(s => ({
        notifications: [
          { ...n, id: Date.now(), read: false, time: new Date().toISOString() },
          ...s.notifications.slice(0, 49)
        ]
      })),
      markAllRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true }))
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'mobcloud-store-v4',
      partialize: (s) => ({
        theme: s.theme,
        personality: s.personality,
        userName: s.userName,
        userCity: s.userCity,
        selectedModel: s.selectedModel,
        previewMode: s.previewMode,
      })
    }
  )
);
