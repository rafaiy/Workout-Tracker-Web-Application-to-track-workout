import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['backend/tests/**/*.test.js', 'frontend/tests/**/*.test.js', 'frontend/tests/**/*.test.jsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'backend/src/services/**/*.js',
        'backend/src/schemas/**/*.js',
        'frontend/src/state/**/*.js',
      ],
      thresholds: { statements: 85, branches: 85 },
    },
  },
});
