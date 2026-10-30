/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fantasy Adventure Palette (Mapped to CSS variables for theming with opacity support)
        background: 'rgb(var(--background) / <alpha-value>)', 
        surface: 'rgb(var(--surface) / <alpha-value>)',       
        border: 'rgb(var(--border) / <alpha-value>)',         
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
        },
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        adventure: {
          wood: '#8b5a2b',
          parchment: '#f4e8c1',
          stone: '#7f8c8d',
          magic: '#8b5cf6'
        }
      },
      fontFamily: {
        pixel: ['Silkscreen', 'cursive'],
        game: ['Jersey 10', 'cursive'],
        sans: ['Outfit', 'sans-serif'],
        ui: ['Outfit', 'sans-serif'],
        display: ['Silkscreen', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'particle-drift': 'particleDrift 8s linear infinite',
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
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        particleDrift: {
          '0%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' },
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 10px 20px -10px rgba(0, 0, 0, 0.08)',
        'adventure': '4px 4px 0px rgba(226, 220, 208, 0.5), 0 4px 15px rgba(0, 0, 0, 0.03)',
        'adventure-hover': '6px 6px 0px rgba(14, 165, 233, 0.2), 0 8px 25px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
