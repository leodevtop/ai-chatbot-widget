import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Set the root directory for Vite to 'public'
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/widget.ts',
      name: 'ChatboxWidget',
      formats: ['iife'], // umd,es
      fileName: 'widget',
    },
    rollupOptions: {
      output: {
        globals: {
          lit: 'lit',
        },
        entryFileNames: `widget.js`, // Force .js extension
      },
      // Externalize deps that shouldn't be bundled into the library
      // external: /^lit/, // Removed this line to bundle Lit
    },
  },
});
