import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['test/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'test/**/*.test-d.{ts,tsx}'],
  },
});
