import '@/api/totoafyaClient'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Disable browser context menus (except inside input fields/textareas)
window.addEventListener('contextmenu', (e) => {
  const target = e.target;
  const isInput = target.tagName === 'INPUT' || 
                  target.tagName === 'TEXTAREA' || 
                  target.isContentEditable;
  if (!isInput) {
    e.preventDefault();
  }
});

// Prevent gesture zoom (pinch-to-zoom) on mobile Safari
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
