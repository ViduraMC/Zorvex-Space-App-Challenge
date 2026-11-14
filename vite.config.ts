import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    // three.js, post-processing and the particle engine make one ~1.2 MB bundle (375 kB gzipped)
    chunkSizeWarningLimit: 1500,
  },
});
