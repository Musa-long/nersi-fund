import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#0B5D2E', dark: '#073B1E', mid: '#0E7038' },
        gold: { DEFAULT: '#C9971B', light: '#E3B341' },
        alert: '#C8102E',
        cream: '#FAF8F2',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
