import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TYPESCRIPT LESSON: defineConfig() is a helper function that provides
// type-checking and auto-complete for Vite's configuration object.
// Without it you'd just export a plain object with no type safety.
export default defineConfig({
  plugins: [react()],
  base: '/workout_tracker/', // GitHub Pages serves at /repo-name/
});
