import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import { initObservability } from './lib/observability'
import './lib/i18n'

// Handle "Failed to fetch dynamically imported module" (ChunkLoadError)
// This happens when a new version is deployed and old chunks are gone.
window.addEventListener('error', (e) => {
  if (e.message?.includes('Failed to fetch dynamically imported module')) {
    console.warn('Chunk load error detected, reloading page...');
    window.location.reload();
  }
}, true);

initObservability();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
