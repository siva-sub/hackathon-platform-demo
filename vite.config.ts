import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    base: mode === 'production' ? '/' : '/',
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'AIzaSyD2pZch7uFZX2KJFvE6Qm-5JAClp52Y2oc'),
      'process.env.SMTP_USERNAME': JSON.stringify(env.SMTP_USERNAME || 'hello@sivasub.com'),
      'process.env.SMTP_TOKEN': JSON.stringify(env.SMTP_TOKEN || 'FPE6NLUAYCUD6KLX'),
      'process.env.SMTP_SERVER': JSON.stringify(env.SMTP_SERVER || 'smtp.protonmail.ch'),
      'process.env.SMTP_PORT': JSON.stringify(env.SMTP_PORT || '587'),
      'process.env.GCP_PROJECT_ID': JSON.stringify(env.GCP_PROJECT_ID || 'southern-splice-415011'),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
        '@/components': fileURLToPath(new URL('./components', import.meta.url)),
        '@/src': fileURLToPath(new URL('./src', import.meta.url)),
        '@/utils': fileURLToPath(new URL('./utils', import.meta.url)),
        '@/services': fileURLToPath(new URL('./services', import.meta.url)),
        '@/hooks': fileURLToPath(new URL('./hooks', import.meta.url)),
        '@/contexts': fileURLToPath(new URL('./contexts', import.meta.url)),
        '@/types': fileURLToPath(new URL('./types', import.meta.url)),
      }
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            lexical: ['lexical', '@lexical/react', '@lexical/rich-text'],
            ui: ['framer-motion', 'lucide-react', 'react-hot-toast'],
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'lexical',
        '@lexical/react',
        '@lexical/rich-text',
        '@lexical/plain-text',
        '@lexical/selection',
        '@lexical/utils',
        'framer-motion',
        'lucide-react'
      ]
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    }
  };
});
