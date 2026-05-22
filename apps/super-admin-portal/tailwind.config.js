/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // TotoAfya Design Tokens
        'toto-teal': '#1B6B5A',
        'toto-teal-dark': '#145244',
        'toto-green': '#2E7A5D',
        'toto-red': '#E51010',
        'toto-amber': '#F9A825',
        'toto-ochre': '#C8813A',
        'toto-purple': '#7C3AED',
        'toto-black': '#0A0A0A',
        'toto-gray': '#666666',
        'toto-light': '#A0A0A0',
        'toto-surface': '#F7F5F0',
        'toto-warm': '#FDFCF8',
        'toto-white': '#FFFFFF',
      },
      boxShadow: {
        'teal-glow': '0 8px 30px rgba(27,107,90,0.25)',
        'teal-glow-sm': '0 4px 16px rgba(27,107,90,0.18)',
        'card': '0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08)',
        'float': '0 20px 60px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
