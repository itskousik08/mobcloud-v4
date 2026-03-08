/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        dark: {
          50: '#f8fafc',
          900: '#020209',
          800: '#0a0a18',
          700: '#0d0d1a',
          600: '#111120',
          500: '#1a1a2e',
          400: '#252540',
          300: '#2d2d50',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn .3s ease',
        'slide-up': 'slideUp .3s ease',
        'pulse-slow': 'pulse 3s infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow: { '0%,100%': { boxShadow: '0 0 20px rgba(99,102,241,.3)' }, '50%': { boxShadow: '0 0 40px rgba(99,102,241,.6)' } }
      }
    }
  },
  plugins: []
};
