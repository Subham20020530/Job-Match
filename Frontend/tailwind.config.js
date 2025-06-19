/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1fc',
          100: '#cce3f9',
          200: '#99c7f3',
          300: '#66abee',
          400: '#338fe8',
          500: '#0A66C2',
          600: '#0952a2',
          700: '#073d81',
          800: '#052961',
          900: '#021430',
        },
        secondary: {
          50: '#e8fcfa',
          100: '#d1f9f5',
          200: '#a3f3eb',
          300: '#75eee0',
          400: '#47e8d6',
          500: '#1EBEA5',
          600: '#189886',
          700: '#127267',
          800: '#0c4c47',
          900: '#062624',
        },
        navy: {
          50: '#e9edf1',
          100: '#d3dbe4',
          200: '#a7b7c9',
          300: '#7b93ae',
          400: '#4f6f93',
          500: '#14304F',
          600: '#102640',
          700: '#0c1d30',
          800: '#081320',
          900: '#040a10',
        },
        success: {
          500: '#10B981',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
        '16': '128px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};