/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // important — enables dark:... utilities by toggling class on <html>
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F8EF7',
          secondary: '#2AC3FF',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #4F8EF7 0%, #2AC3FF 100%)',
      },
    },
  },
  plugins: [],
};
