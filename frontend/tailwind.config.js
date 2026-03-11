/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        cyber: ['Orbitron', 'Inter', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#00f0ff', // Cyber cyan
          2: '#ff003c', // Cyber red
          3: '#7000ff', // Neon purple
        },
        surface: {
          DEFAULT: '#0a0a0f',
          1: '#12121a',
          2: '#1a1a24',
          3: '#222230'
        }
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)' },
          '50%': { opacity: .5, boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
