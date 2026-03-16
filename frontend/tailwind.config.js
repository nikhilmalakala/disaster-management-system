/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: { pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
      boxShadow: { glow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)' },
    },
  },
  plugins: [],
};
