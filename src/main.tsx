import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from './i18n/I18nProvider';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
);

// PWA: офлайн-работа и установка на телефон «на главный экран».
// Внутри Tauri/Capacitor service worker не нужен.
const isWrapped = '__TAURI_INTERNALS__' in window || 'Capacitor' in window;
if (import.meta.env.PROD && 'serviceWorker' in navigator && !isWrapped) {
  navigator.serviceWorker.register('./sw.js');
}
