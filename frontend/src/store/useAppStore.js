import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // Ollama
      ollamaStatus: 'unknown',
      models: [],
      selectedModel: '',
      setOllamaStatus: (status) => set({ ollamaStatus: status }),
      setModels: (models) => set({ models }),
      setSelectedModel: (model) => set({ selectedModel: model }),

      // Projects
      projects: [],
      currentProject: null,
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) => set(s => ({ projects: [project, ...s.projects] })),
      removeProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id) })),

      // File tree
      fileTree: [],
      setFileTree: (tree) => set({ fileTree: tree }),
      openFiles: [],
      activeFile: null,
      openFile: (file) => {
        const { openFiles } = get();
        const exists = openFiles.find(f => f.path === file.path);
        if (!exists) {
          set({ openFiles: [...openFiles, file], activeFile: file });
        } else {
          set({ activeFile: file });
        }
      },
      closeFile: (filePath) => {
        const { openFiles, activeFile } = get();
        const filtered = openFiles.filter(f => f.path !== filePath);
        const newActive = activeFile?.path === filePath
          ? filtered[filtered.length - 1] || null
          : activeFile;
        set({ openFiles: filtered, activeFile: newActive });
      },
      setActiveFile: (file) => set({ activeFile: file }),
      updateFileContent: (filePath, content) => {
        const { openFiles, activeFile } = get();
        const updated = openFiles.map(f => f.path === filePath ? { ...f, content, modified: true } : f);
        set({ openFiles: updated });
        if (activeFile?.path === filePath) {
          set({ activeFile: { ...activeFile, content, modified: true } });
        }
      },
      markFileSaved: (filePath) => {
        const { openFiles, activeFile } = get();
        const updated = openFiles.map(f => f.path === filePath ? { ...f, modified: false } : f);
        set({ openFiles: updated });
        if (activeFile?.path === filePath) {
          set({ activeFile: { ...activeFile, modified: false } });
        }
      },

      // Chat
      messages: [],
      isAiThinking: false,
      aiThinking: [],
      currentStreamText: '',
      setMessages: (msgs) => set({ messages: msgs }),
      addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
      updateLastMessage: (update) => {
        const { messages } = get();
        if (messages.length === 0) return;
        const updated = [...messages];
        updated[updated.length - 1] = { ...updated[updated.length - 1], ...update };
        set({ messages: updated });
      },
      setIsAiThinking: (val) => set({ isAiThinking: val }),
      setAiThinking: (steps) => set({ aiThinking: steps }),
      addAiThinkingStep: (step) => set(s => ({ aiThinking: [...s.aiThinking, step] })),
      setCurrentStreamText: (text) => set({ currentStreamText: text }),
      clearChat: () => set({ messages: [], aiThinking: [] }),

      // Preview
      previewMode: 'desktop',
      setPreviewMode: (mode) => set({ previewMode: mode }),
      previewUrl: '',
      setPreviewUrl: (url) => set({ previewUrl: url }),

      // Layout
      showFileExplorer: true,
      showChat: true,
      showPreview: true,
      showEditor: true,
      togglePanel: (panel) => set(s => ({ [panel]: !s[panel] })),

      // Sidebar
      sidebarView: 'files', // files | search | history
      setSidebarView: (view) => set({ sidebarView: view }),

      // Prompt history
      promptHistory: [],
      addToHistory: (prompt) => set(s => ({
        promptHistory: [{ prompt, timestamp: Date.now() }, ...s.promptHistory.slice(0, 49)]
      })),

      // Notifications
      notifications: [],
      addNotification: (n) => set(s => ({
        notifications: [{ ...n, id: Date.now() }, ...s.notifications].slice(0, 20)
      })),
    }),
    {
      name: 'mobclowd-storage',
      partialize: (s) => ({
        theme: s.theme,
        selectedModel: s.selectedModel,
        promptHistory: s.promptHistory,
        showFileExplorer: s.showFileExplorer,
        showChat: s.showChat,
        showPreview: s.showPreview,
      })
    }
  )
);
