/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16233A',      // headings, primary text
        slate: '#3B5773',    // primary actions, links
        gold: '#C9A227',     // price figures ONLY
        paper: '#F7F5F0',    // page background
        muted: '#6B7280',    // secondary text, metadata
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};