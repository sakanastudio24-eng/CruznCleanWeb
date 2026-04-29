import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#6A0F1B',
        burgundy: '#6A0F1B',
        burgundyAccent: '#8C1C2C',
        ink: '#0D0D0D',
        fog: '#A1A1A1',
        canvas: '#141414',
        line: '#1F1F1F',
      },
      fontFamily: {
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
