/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#FDE047',
          DEFAULT: '#D4AF37', // Metallic Gold
          dark: '#B8860B',
        },
        navy: '#0a0f18',
        maroon: '#4a0e17'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}