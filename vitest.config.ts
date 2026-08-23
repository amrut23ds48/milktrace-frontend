import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Default to 'node' — avoids the jsdom/undici/Node-20 incompatibility on CI.
    // Files that need DOM APIs declare: // @vitest-environment jsdom
    environment: 'node',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

