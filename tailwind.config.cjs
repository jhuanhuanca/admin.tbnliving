/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 30px rgba(0,0,0,.35)',
        card: '0 10px 24px rgba(0,0,0,.35)',
      },
      colors: {
        bg: {
          DEFAULT: '#ffffff', // Fondo blanco
          2: '#f5f5f5', // Gris claro
          3: '#eef1ef',
        },
        nav: {
          DEFAULT: '#222d25', // Verde oscuro (Navbar/Sidebar)
          2: '#1b231e',
        },
        panel: {
          DEFAULT: '#ffffff', // superficies (cards/tablas)
          2: '#f5f5f5',
        },
        border: '#d7ddd9',
        text: {
          DEFAULT: '#222d25', // Verde oscuro (texto)
          muted: '#222d25',
        },
        brand: {
          DEFAULT: '#54b144', // Verde claro
          2: '#6ac85a',
        },
        success: '#54b144',
        danger: '#f6465d',
        warn: '#ffb020',
        info: '#1e90ff',
      },
      borderRadius: {
        xl2: '1rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.2s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}

