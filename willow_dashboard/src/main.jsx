import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LiveProvider } from './live/LiveProvider.jsx';
import { ToastProvider } from './components/toast/ToastProvider.jsx';
import './styles/index.css';

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
