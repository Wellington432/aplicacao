import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'horta-dark': 'rgb(var(--palette-horta-dark-rgb) / <alpha-value>)',
        'horta-medium': 'rgb(var(--palette-horta-medium-rgb) / <alpha-value>)',
        'horta-hover': 'rgb(var(--palette-horta-hover-rgb) / <alpha-value>)',
        'horta-light': 'rgb(var(--palette-horta-light-rgb) / <alpha-value>)',
        'brand-red': 'rgb(var(--palette-brand-red-rgb) / <alpha-value>)',
        'brand-yellow': 'rgb(var(--palette-brand-yellow-rgb) / <alpha-value>)',
        'bg-app': 'rgb(var(--palette-bg-app-rgb) / <alpha-value>)',
        'card-border': 'rgb(var(--palette-card-border-rgb) / <alpha-value>)',
        'input-border': 'rgb(var(--palette-input-border-rgb) / <alpha-value>)',
        success: 'rgb(var(--palette-success-rgb) / <alpha-value>)',
        warning: 'rgb(var(--palette-warning-rgb) / <alpha-value>)',
        'warning-ink': 'rgb(var(--palette-warning-ink-rgb) / <alpha-value>)',
        ink: {
          50: 'rgb(var(--palette-ink-50-rgb) / <alpha-value>)',
          100: 'rgb(var(--palette-ink-100-rgb) / <alpha-value>)',
          300: 'rgb(var(--palette-ink-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--palette-ink-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--palette-ink-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--palette-ink-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--palette-ink-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--palette-ink-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--palette-ink-900-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        card: 'var(--radius-card)',
        input: 'var(--radius-control)',
        'card-lg': 'var(--radius-panel)',
        'card-sm': 'var(--radius-card-small)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-lg': 'var(--shadow-card-raised)',
      },
      maxWidth: {
        site: 'var(--layout-max-width)',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      fontSize: {
        display: ['var(--font-size-display)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h1: ['var(--font-size-h1)', { lineHeight: '1.2' }],
        h2: ['var(--font-size-h2)', { lineHeight: '1.3' }],
        h3: ['var(--font-size-h3)', { lineHeight: '1.4' }],
        body: ['var(--font-size-body)', { lineHeight: '1.6' }],
        'body-sm': ['var(--font-size-body-sm)', { lineHeight: '1.5' }],
        caption: ['var(--font-size-caption)', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
    },
  },
  plugins: [],
}
export default config
