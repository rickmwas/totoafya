import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
