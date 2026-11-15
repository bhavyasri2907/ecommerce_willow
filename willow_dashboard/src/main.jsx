import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App.jsx';
import { LiveProvider } from './context/LiveProvider.jsx';
import { ToastProvider } from './context/ToastProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LiveProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LiveProvider>
    </BrowserRouter>
  </React.StrictMode>
);
