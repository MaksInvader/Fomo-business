import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD644',
          strawberry: '#FF6B6B',
          leaf: '#47B881',
          cream: '#FFF8E7',
          charcoal: '#2F3A3D',
        },
      },
      borderRadius: {
        soft: '1.5rem',
      },
      boxShadow: {
        card: '0 20px 35px -15px rgba(255, 107, 107, 0.35)',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['"Nunito"', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
};
