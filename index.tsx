import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initGlobalButtonSound } from './components/casino/CasinoAudio';

// Initialize universal button click sound across all of chix9ja app
initGlobalButtonSound();

// Register standard PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('ServiceWorker registered successfully:', reg))
      .catch((err) => console.warn('ServiceWorker registration failed:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);