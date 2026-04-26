/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
    extend: {
      colors: {
        whoop: {
          black: '#0a0a0a',
                      dark: '#1a1a1a',
                      card: '#242424',
                      accent: '#00ff87',
                      red: '#ff3b5c',
                      yellow: '#ffd60a',
                      text: '#e0e0e0',
                      muted: '#888888',
            },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
          },
    },
  },
  plugins: [],
    };
