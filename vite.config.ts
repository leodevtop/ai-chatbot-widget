import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: '.', // Set the root directory for Vite to 'public'
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/mount.ts'),
      name: 'ChatboxWidget',
      formats: ['iife'], // umd,es
      fileName: () => 'widget.js'
    },
    rollupOptions: {
      // external: ['lit'], // not bundle lit
      output: {
        globals: {
          lit: 'lit'
        }
      }
    }
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
});
