/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: {
      background: '#FFFEEC', foreground: '#28301F', card: '#FEFEFA', border: '#DBDCD7',
      primary: { DEFAULT: '#434923', foreground: '#FFFEEC' }, secondary: { DEFAULT: '#ECEBDD', foreground: '#434923' },
      muted: { DEFAULT: '#F0F0E9', foreground: '#6C6F5E' }, accent: { DEFAULT: '#858D51', foreground: '#FFFFFF' },
      olive: { 50: '#F5F5EF', 100: '#ECEBDD', 200: '#CECEAA', 300: '#A9AC87', 400: '#949873', 500: '#858D51', 600: '#646B41', 700: '#434923', 800: '#343A1D', 900: '#252A16' },
      gold: '#DDB96F', stone: '#DBDCD7'
    },
    fontFamily: { sans: ['DM Sans', 'Inter', 'sans-serif'], display: ['Cormorant Garamond', 'Georgia', 'serif'] },
    boxShadow: { soft: '0 12px 40px rgba(45, 51, 29, 0.08)', card: '0 4px 18px rgba(45, 51, 29, 0.06)' },
    borderRadius: { '2xl': '1.25rem' }
  } }, plugins: []
};
