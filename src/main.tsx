// =============================================================================
// main.tsx — The entry point for the React application
//
// TYPESCRIPT LESSON: The .tsx extension means TypeScript + JSX.
// Use .ts for plain TypeScript files, .tsx for files with JSX (React components).
// =============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Import Tailwind CSS
import { App } from './App';

// Find the <div id="root"> element in index.html
// LESSON: Non-null assertion operator `!`
// `document.getElementById('root')` returns `HTMLElement | null`.
// The `!` at the end tells TypeScript: "I know this won't be null."
// Use this sparingly — only when you're certain the value exists.
const rootElement = document.getElementById('root')!;

// Create the React root and render the App component
createRoot(rootElement).render(
  // StrictMode is a development tool that helps find potential problems.
  // It renders components twice to detect side effects, shows warnings, etc.
  // It has NO effect in production builds.
  <StrictMode>
    <App />
  </StrictMode>
);
