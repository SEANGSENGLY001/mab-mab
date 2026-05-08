import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register service worker for cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — auto-reload to activate it
            window.location.reload();
          }
        });
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_ACTIVATED') {
          console.log('[SW] Activated:', event.data.version);
        }
      });
    }).catch((err) => {
      console.warn('[SW] Registration failed:', err.message);
    });

    // Periodically check for SW updates
    setInterval(() => {
      navigator.serviceWorker.getRegistration('/sw.js').then((reg) => {
        if (reg) reg.update();
      });
    }, 60000); // Every 60s
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
