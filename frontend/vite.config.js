import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Big Burguer',
        short_name: 'Big Burguer',
        description: 'Sistema de fechamento de caixa',
        theme_color: '#0f1117',
        background_color: '#0f1117',
        display: 'standalone',
        start_url: '/Big-Burguer/',
        scope: '/Big-Burguer/',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cacheia os assets do app (JS, CSS, HTML)
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Estratégia: serve do cache, atualiza em background
        runtimeCaching: [
          {
            // Chamadas às Edge Functions do Supabase — não cachear
            urlPattern: /supabase\.co\/functions/,
            handler: 'NetworkOnly',
          },
          {
            // Auth do Supabase — não cachear
            urlPattern: /supabase\.co\/auth/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],

  base: '/Big-Burguer/',

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('react') || id.includes('react-dom')) return 'vendor';
          if (id.includes('@supabase')) return 'supabase';
        },
      },
    },
    chunkSizeWarningLimit: 300,
    minify: 'oxc',
    target: 'esnext',
    oxcOptions: {
      drop: ['console', 'debugger'],
    },
  },
});