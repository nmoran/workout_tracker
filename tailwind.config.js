/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names.
  // It removes unused classes from the final CSS bundle.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // You can add custom colors, fonts, spacing, etc. here
    },
  },
  plugins: [],
};
