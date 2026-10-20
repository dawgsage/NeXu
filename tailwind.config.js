/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nexu: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#34D399',
        },
        navy: {
          DEFAULT: '#001F3F',
          50: '#E6EDF5',
          100: '#CCDAEB',
          200: '#99B5D7',
          300: '#6690C3',
          400: '#336BAF',
          500: '#001F3F',
          600: '#001933',
          700: '#001326',
          800: '#000D1A',
          900: '#00060D',
        },
        emerald: {
          DEFAULT: '#2ECC71',
          50: '#EAFBF1',
          100: '#D5F7E3',
          200: '#AAEFC7',
          300: '#80E7AB',
          400: '#55DF8F',
          500: '#2ECC71',
          600: '#25A35A',
          700: '#1C7A44',
          800: '#12512D',
          900: '#092817',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
