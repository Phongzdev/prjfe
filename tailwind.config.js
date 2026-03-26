/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b35',
        secondary: '#2d3748',
      }
    },
  },
  plugins: [],
}