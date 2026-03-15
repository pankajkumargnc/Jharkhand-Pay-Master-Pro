import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Jharkhand-Pay-Master-Pro/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 1. Chunk size warning limit ko badha diya (2MB tak)
    chunkSizeWarningLimit: 2000, 
    
    rollupOptions: {
      output: {
        // 2. Badi libraries ko alag-alag chunks mein divide kar rahe hain (Manual Chunking)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Recharts ko alag chunk mein
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // PDF aur Excel libraries (jspdf, html2canvas, xlsx) ko alag chunk mein
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('xlsx')) {
              return 'vendor-docs';
            }
            // Lucide icons ko alag chunk mein
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Baaki saari libraries ek common vendor file mein
            return 'vendor';
          }
        },
      },
    },
  },
});