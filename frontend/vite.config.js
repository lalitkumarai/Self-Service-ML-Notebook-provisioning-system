import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration — production-optimised
 *
 * Bundle strategy:
 *  • React core → separate chunk (most stable, best for long-term caching)
 *  • framer-motion → separate chunk (large, lazy-load friendly)
 *  • recharts + d3 → separate chunk (heavy, only needed on dashboard)
 *  • monaco-editor → separate chunk (very large, only on notebook editor)
 *  • All remaining vendor libs → shared vendor chunk
 */
export default defineConfig({
  base: '/',

  plugins: [
    react(),
  ],

  // ── Dev server ─────────────────────────────────────────────
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },

  // ── Production build ────────────────────────────────────────
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,          // disable in prod — enable if you need Sentry etc.
    minify: 'esbuild',
    cssMinify: true,

    rollupOptions: {
      output: {
        // Human-readable chunk names for easier debugging
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        manualChunks(id) {
          // React runtime — ultra-stable, cache forever
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // React Router v6
          if (id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }

          // Framer Motion — large animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer-motion';
          }

          // Recharts + d3 sub-packages
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3') ||
              id.includes('node_modules/victory')) {
            return 'vendor-charts';
          }

          // Monaco Editor — very large, isolated chunk
          if (id.includes('node_modules/@monaco-editor') ||
              id.includes('node_modules/monaco-editor')) {
            return 'vendor-monaco';
          }

          // Socket.io client
          if (id.includes('node_modules/socket.io-client') ||
              id.includes('node_modules/engine.io-client')) {
            return 'vendor-socket';
          }

          // Everything else from node_modules → general vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },

    // Raise the chunk size warning limit (monaco is legitimately large)
    chunkSizeWarningLimit: 1000,
  },

  // ── Preview server (npm run preview) ──────────────────────
  preview: {
    port: 4173,
    strictPort: true,
  },
});
