/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vedlik: {
          black: '#000000',
          charcoal: '#111111',
          border: 'rgba(255,255,255,0.08)',
          accent: '#14b8a6',
          accentIndigo: '#6366f1',
        },
      },
    },
  },
  plugins: [],
}
