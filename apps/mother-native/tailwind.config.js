/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1B6B5A",
        secondary: "#2E7A5D",
        accent: "#C8813A",
        brandDark: "#0A0A0A",
        statusHealthy: "#2E7A5D",
        statusDue: "#D97706",
        statusOverdue: "#E51010",
        statusMissed: "#E51010",
        statusUpcoming: "#A0A0A0",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
