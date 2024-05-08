/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        kanit: ["Kanit", " sans-serif"],
      },
    },
  },
  plugins: [],
};
