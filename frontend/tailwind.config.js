/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon purple accent color
        'neon-purple': '#9333EA',
        'neon-purple-dark': '#7C3AED',
        'neon-purple-light': '#A855F7',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #1e1b4b, #000000)',
      },
    },
  },
  plugins: [],
}

