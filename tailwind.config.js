/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0F261B',
          800: '#183D2B', // Primary Deep Forest
          700: '#23523B',
          600: '#30694D',
        },
        botanical: {
          DEFAULT: '#397653',
          dark: '#2A5A3E',
          light: '#4C926A',
          subtle: '#EEF5ED',
        },
        leaf: {
          DEFAULT: '#8EBF78',
          dark: '#73A55D',
          light: '#A7D494',
          subtle: '#F2F8EE',
        },
        ivory: {
          50: '#FDFCF7',
          100: '#F8F7F0', // Primary Warm Ivory Background
          200: '#EFECE0',
          300: '#E2DEC9',
        },
        sage: {
          50: '#F4F7F1',
          100: '#E9EFE4', // Soft Sage Surface
          200: '#D5E1CC',
          300: '#BDCDB2',
          text: '#64786A',
        },
        charcoal: {
          DEFAULT: '#202B24', // Main Text
          muted: '#526258',   // Secondary Text
          subtle: '#78897F',
        },
        terracotta: {
          DEFAULT: '#C25E28',
          subtle: '#FDF1EB',
          border: '#F2C9B5',
        },
        alert: {
          warning: '#D97736',
          warningBg: '#FFF7EE',
          warningBorder: '#FED7AA',
          success: '#2D7D46',
          successBg: '#F0F9F3',
          successBorder: '#BBF7D0',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'natural-sm': '0 1px 3px rgba(24, 61, 43, 0.05), 0 1px 2px rgba(24, 61, 43, 0.03)',
        'natural': '0 4px 12px -2px rgba(24, 61, 43, 0.06), 0 2px 6px -1px rgba(24, 61, 43, 0.03)',
        'natural-md': '0 10px 25px -3px rgba(24, 61, 43, 0.08), 0 4px 10px -2px rgba(24, 61, 43, 0.04)',
        'natural-lg': '0 20px 35px -4px rgba(24, 61, 43, 0.1), 0 8px 16px -4px rgba(24, 61, 43, 0.06)',
      },
      borderRadius: {
        'natural': '14px',
        'natural-lg': '20px',
      }
    },
  },
  plugins: [],
}
