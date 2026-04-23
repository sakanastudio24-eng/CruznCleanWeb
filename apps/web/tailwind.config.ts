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
        charcoal: '#262626',
        ink: '#111111',
        fog: '#a3a3a3',
        canvas: '#f8f8f8',
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
