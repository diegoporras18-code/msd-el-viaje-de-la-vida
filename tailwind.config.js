/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ciruela: { DEFAULT: '#1A0B16', 900: '#12070F', 800: '#24111F', 700: '#33182C' },
        rosa: '#F4A6C4',
        fucsia: '#E2457F',
        marfil: '#F7ECF1',
        bruma: '#C9B3C0',
      },
      fontFamily: {
        display: ['"Bodoni Moda Variable"', '"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk Variable"', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      screens: { xs: '420px' },
    },
  },
  plugins: [],
};
