/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brutalBg: '#f4f4f0',
        brutalNeon: '#ccff00',
        brutalPink: '#ff00ff'
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '3px 3px 0px 0px rgba(0,0,0,1)'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'], // Import this in index.css
      }
    },
  },
  plugins: [],
}
