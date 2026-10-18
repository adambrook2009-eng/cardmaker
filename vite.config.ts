import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — чтобы сборка работала и с веб-сервера, и внутри Tauri/Capacitor
export default defineConfig({
  plugins: [react()],
  base: './',
});
