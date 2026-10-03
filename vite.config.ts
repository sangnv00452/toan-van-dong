import { defineConfig } from 'vitest/config';

// base './' keeps every asset path relative, so the built site works from any
// host sub-path (online) and from the local preview server (offline).
export default defineConfig({
  base: './',
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  // Ship the animated explainer page alongside the games.
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        explainer: 'presentation/giai-thich-he-thong.html',
      },
    },
  },
  test: { include: ['tests/**/*.test.ts'] },
});
