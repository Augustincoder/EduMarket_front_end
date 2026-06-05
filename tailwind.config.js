/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        'edu-primary':   'var(--edu-primary)',
        'edu-primary-d': 'var(--edu-primary-d)',
        'edu-accent':    'var(--edu-accent)',
        'edu-urgent':    'var(--edu-urgent)',
        'edu-vip':       'var(--edu-vip)',

        // Neutral
        'edu-bg':      'var(--edu-bg)',
        'edu-surface': 'var(--edu-surface)',
        'edu-border':  'var(--edu-border)',
        'edu-muted':   'var(--edu-muted)',
        'edu-text':    'var(--edu-text)',

        // Status
        'status-open':      'var(--status-open)',
        'status-assigned':  'var(--status-assigned)',
        'status-progress':  'var(--status-progress)',
        'status-review':    'var(--status-review)',
        'status-completed': 'var(--status-completed)',
        'status-canceled':  'var(--status-canceled)',
        'status-disputed':  'var(--status-disputed)',
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Inter"', 'sans-serif'],
        body:    ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Inter"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs':  ['12px', '16px'],
        'sm':  ['13px', '18px'],
        'base':['14px', '20px'],
        'md':  ['15px', '22px'],
        'lg':  ['16px', '24px'],
        'xl':  ['18px', '26px'],
        '2xl': ['20px', '28px'],
        '3xl': ['24px', '32px'],
        '4xl': ['28px', '36px'],
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '10px',
        'lg':  '14px',
        'xl':  '18px',
        '2xl': '24px',
        'full':'9999px',
      },
      boxShadow: {
        'ios':    '0 4px 14px 0 rgba(0, 0, 0, 0.04), 0 2px 5px 0 rgba(0, 0, 0, 0.02)',
        'ios-lg': '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'card':   '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
        'nav':    '0 -0.5px 0 rgba(0,0,0,0.1), 0 -4px 20px rgba(0,0,0,0.02)',
        'sheet':  '0 -10px 40px -10px rgba(0,0,0,0.12)',
        'btn':    '0 8px 20px -4px rgba(0,122,255,0.3)',
        'vip':    '0 8px 20px -4px rgba(175,139,59,0.3)',
      },
      letterSpacing: {
        'ios-display': '-0.022em',
        'ios-text':    '-0.011em',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-down':  'fadeDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        'shimmer':    'shimmer 2.5s infinite',
        'pulse-dot':  'pulseDot 1.2s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.8)' },
          '50%':      { opacity: '1',   transform: 'scale(1.2)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%':           { transform: 'scale(1)' },
        },
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
