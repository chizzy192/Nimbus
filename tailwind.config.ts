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
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drift: {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(12px,-8px)' },
          '100%': { transform: 'translate(0,0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.0)' },
          '50%': { boxShadow: '0 0 28px 4px rgba(16,185,129,0.35)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'ring-pulse': 'ringPulse 2.4s ease-out infinite',
        ticker: 'ticker 40s linear infinite',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 0.6s ease-out both',
        shimmer: 'shimmer 6s linear infinite',
        drift: 'drift 14s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        sweep: 'sweep 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
