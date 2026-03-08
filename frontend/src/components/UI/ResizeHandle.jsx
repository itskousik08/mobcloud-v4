import React, { useRef } from 'react';

export default function ResizeHandle({ onResize }) {
  const dragging = useRef(false);
  const startX = useRef(0);

  function handleMouseDown(e) {
    dragging.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(e) {
      if (!dragging.current) return;
      const dx = e.clientX - startX.current;
      startX.current = e.clientX;
      onResize(dx);
    }

    function onUp() {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="resize-handle flex-shrink-0"
      style={{ width: 3, cursor: 'col-resize', background: '#1a1a2e', transition: 'background .2s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#6366f1'}
      onMouseLeave={e => e.currentTarget.style.background = '#1a1a2e'}
    />
  );
}
