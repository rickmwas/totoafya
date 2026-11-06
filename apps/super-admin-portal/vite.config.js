import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  envDir: '../../',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@totoafya/business-logic': path.resolve(__dirname, '../../packages/business-logic/src/index.ts'),
      '@totoafya/api-client': path.resolve(__dirname, '../../packages/api-client/index.js'),
      '@totoafya/auth': path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@totoafya/design-system': path.resolve(__dirname, '../../packages/design-system/src/index.ts'),
      '@totoafya/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/index.js'),
      '@/api/totoafyaClient': path.resolve(__dirname, '../../packages/api-client/index.js'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5003,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
          }
        },
      },
    },
  },
});
