import { defineConfig } from 'vitest/config.js';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['src/features/workouts/workoutReducer.js'],
      thresholds: { statements: 85 },
      reporter: ['text', 'html']
    }
  }
});
