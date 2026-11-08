/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1B5E20',
        leaf: '#388E3C',
        sprout: '#C8E6C9',
        cream: '#FFFDF5',
        earth: '#795548',
        sun: '#FFC857',
        urgent: '#D32F2F',
        caution: '#F9A825',
        calm: '#2E7D32',
      },
      fontFamily: {
        heading: ['Poppins', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 6px 20px -8px rgba(27, 94, 32, 0.28)',
        card: '0 4px 14px rgba(27, 94, 32, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        },
      },
      animation: {
        floatUp: 'floatUp 0.35s ease-out both',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
