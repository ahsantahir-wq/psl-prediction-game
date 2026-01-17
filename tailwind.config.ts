import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      colors: {
        // Deep Navy / Charcoal Background
        navy: {
          50: '#E8EAF0',
          100: '#D1D5E1',
          200: '#A3ABC3',
          300: '#7581A5',
          400: '#475787',
          500: '#1A2D69',  // Deep Navy
          600: '#152454',
          700: '#101B3F',
          800: '#0B122A',
          900: '#060915',
          950: '#030409',
        },
        charcoal: {
          50: '#F5F5F6',
          100: '#EBEBED',
          200: '#D7D7DB',
          300: '#C3C3C9',
          400: '#AFAFB7',
          500: '#2D3748',  // Charcoal
          600: '#242C3A',
          700: '#1B212B',
          800: '#12161D',
          900: '#090B0E',
          950: '#040507',
        },
        // Muted Teal - Primary CTA & Correct/Accuracy
        teal: {
          50: '#E6F7F7',
          100: '#CCEFEF',
          200: '#99DFDF',
          300: '#66CFCF',
          400: '#33BFBF',
          500: '#14B8A6',  // Muted Teal
          600: '#109387',
          700: '#0C6E68',
          800: '#084A49',
          900: '#04252A',
          950: '#021215',
        },
        // Amber - Live Questions & Warnings
        amber: {
          50: '#FEF8E6',
          100: '#FDF1CC',
          200: '#FBE399',
          300: '#F9D566',
          400: '#F7C733',
          500: '#F59E0B',  // Soft Amber
          600: '#C47E09',
          700: '#935F07',
          800: '#623F04',
          900: '#312002',
          950: '#181001',
        },
      },
      backgroundColor: {
        DEFAULT: '#1A2D69',  // Deep Navy default
      },
    },
  },
  plugins: [],
} satisfies Config;
