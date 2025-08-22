/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ["Fraunces", "sans-serif"],
      },
      colors: {
        secondary: "#947B62",
        background: "#ffffff",
        selected: "#F5F0EA",
      },
    },
  },
  plugins: [],
}

