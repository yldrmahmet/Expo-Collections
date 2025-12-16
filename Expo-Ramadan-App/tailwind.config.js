/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Ramazan Teması - WCAG AA uyumlu
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#4CAF50',
        },
        surface: {
          DEFAULT: '#F5F5F5',
          elevated: '#FFFFFF',
        },
        today: {
          bg: '#E8F5E9',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#424242',
          muted: '#757575',
          'on-primary': '#FFFFFF',
        },
        divider: '#E0E0E0',
        error: '#D32F2F',
      },
      fontSize: {
        // Erişilebilirlik: minimum 16px
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['40px', { lineHeight: '48px' }],
        'hero': ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        // Touch target için minimum 48dp
        'touch-min': '48px',
        'touch-comfortable': '56px',
        'touch-large': '64px',
      },
      borderRadius: {
        'card': '12px',
        'button': '24px',
      },
    },
  },
  plugins: [],
};
