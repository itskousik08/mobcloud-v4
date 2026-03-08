import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io('/', { transports: ['websocket', 'polling'] });
  }
  return socketInstance;
}

export function useSocket(projectId, callbacks = {}) {
  const socket = getSocket();
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!projectId) return;

    socket.emit('join-project', projectId);

    const handlers = {
      'file-changed': (data) => callbacksRef.current.onFileChanged?.(data),
      'file-deleted': (data) => callbacksRef.current.onFileDeleted?.(data),
      'ai-chunk': (data) => callbacksRef.current.onAiChunk?.(data),
      'ai-done': (data) => callbacksRef.current.onAiDone?.(data),
      'ai-thinking': (data) => callbacksRef.current.onAiThinking?.(data),
      'ai-action': (data) => callbacksRef.current.onAiAction?.(data),
      'ai-error': (data) => callbacksRef.current.onAiError?.(data),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.emit('leave-project', projectId);
      Object.keys(handlers).forEach(event => socket.off(event));
    };
  }, [projectId]);

  return socket;
}
