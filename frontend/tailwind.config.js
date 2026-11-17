/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#f8f9fc',
          card: '#ffffff',
          blue: '#0d6efd',
          'blue-hover': '#0b5ed7',
          'blue-light': '#eff6ff',
          orange: '#f97316',
          'orange-light': '#fff7ed',
          green: '#10b981',
          'green-light': '#ecfdf5',
          pink: '#ec4899',
          'pink-light': '#fdf2f8',
          purple: '#a855f7',
          'purple-light': '#faf5ff',
          text: '#1e293b',
          muted: '#64748b',
          border: '#f3f4f6',
          'border-dark': '#e2e8f0',
          warning: '#f59e0b',
          'warning-light': '#fffbeb',
          error: '#ef4444',
          'error-light': '#fef2f2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'section': '32px',
        'btn': '12px',
        'input': '12px',
        'badge': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(13, 110, 253, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'cta': '0 10px 25px -3px rgba(13, 110, 253, 0.25)',
      },
    },
  },
  plugins: [],
}
