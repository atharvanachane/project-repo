/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4F46E5', light: '#818CF8', dark: '#3730A3' },
        surface: '#F8FAFC',
      }
    }
  },
  plugins: []
}
