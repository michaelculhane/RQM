/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edf1f9',
          100: '#d0dbf1',
          200: '#a2b7e3',
          300: '#7493d5',
          400: '#4670c7',
          500: '#2555b0',
          600: '#1B4792',
          700: '#163a7a',
          800: '#102c5e',
          900: '#0b1e40',
        },
      },
    },
  },
  plugins: [require(require.resolve('@tailwindcss/typography', { paths: [__dirname] }))],
}
