/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        flipBlue: '#2874f0',
        flipYellow: '#ff9f00',
        flipGreen: '#388e3c',
        flipRed: '#ff6161',
        flipBg: '#f1f3f6',
        flipWhite: '#ffffff',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
