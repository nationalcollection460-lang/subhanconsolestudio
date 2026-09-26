/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Extra steps so colour opacity modifiers like border-white/12 work.
      opacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        22: '0.22',
        35: '0.35',
        45: '0.45',
        85: '0.85',
        92: '0.92',
      },
      colors: {
        ink: {
          950: '#05060f',
          900: '#080b1a',
          850: '#0b1024',
          800: '#101733',
          700: '#182348',
          600: '#243066',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bdd0ff',
          300: '#91adff',
          400: '#6182fb',
          500: '#3f5cf2',
          600: '#2c3fdd',
          700: '#2531b3',
          800: '#232e8f',
          900: '#222c72',
        },
        neon: {
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          pink: '#f472b6',
          lime: '#a3e635',
          amber: '#fbbf24',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.25), 0 20px 60px -20px rgba(56,189,248,0.45)',
        card: '0 24px 60px -30px rgba(2,6,23,0.9)',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-25px, 25px) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.5)', opacity: '0' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        riseFade: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        blob: 'blob 16s ease-in-out infinite',
        'blob-slow': 'blob 24s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
        rise: 'riseFade 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
