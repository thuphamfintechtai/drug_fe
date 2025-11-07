/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#054f67",
        secondary: "#077CA3",
        third: "#00C0E8",
      },
    },
  },
  plugins: [],
};
