/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'brutal': '8px 8px 0px 0px rgba(24,24,27,1)',
        'brutal-sm': '4px 4px 0px 0px rgba(24,24,27,1)',
      }
    },
  },
  plugins: [],
}
