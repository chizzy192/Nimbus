import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nimbus: {
          bg: '#050d0a',
          'bg-2': '#0c1e14',
          'bg-3': '#112a1a',
          900: '#064e3b',
          700: '#047857',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
          100: '#d1fae5',
        },
        oracle: {
          safe: '#22d3ee',
          warning: '#fbbf24',
          trigger: '#f87171',
        },
        text: {
          DEFAULT: '#ecfdf5',
          muted: '#6ee7b7',
          dim: '#34d399',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        head: ['Syne', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(16, 185, 129, 0.12)',
        strong: 'rgba(16, 185, 129, 0.25)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        ringPulse: {
          '0%': { transform: 'scale(0.85)', opacity: '0.6' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'ring-pulse': 'ringPulse 2.4s ease-out infinite',
        ticker: 'ticker 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
