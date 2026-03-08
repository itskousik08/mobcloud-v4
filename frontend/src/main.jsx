import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#0d0d1a',
          color: '#e2e8f0',
          border: '1px solid #252540',
          borderRadius: '10px',
          fontSize: '13px'
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#0d0d1a' } },
        error: { iconTheme: { primary: '#f43f5e', secondary: '#0d0d1a' } }
      }}
    />
  </BrowserRouter>
);
