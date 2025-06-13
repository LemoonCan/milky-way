/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7FA4C0',
        secondary: {
          pink: '#E66D86',
          yellow: '#F9D770',
          green: '#73C8A9',
        },
      },
      borderRadius: {
        'hand': '20px',
      },
    },
  },
  plugins: [],
} 