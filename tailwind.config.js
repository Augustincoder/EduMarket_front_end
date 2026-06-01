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
        display: ['Nunito', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
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
        'card':   '0 1px 4px rgba(26,25,22,0.08), 0 0 0 1px rgba(232,230,223,0.6)',
        'nav':    '0 -1px 0 rgba(232,230,223,0.8), 0 -4px 16px rgba(26,25,22,0.06)',
        'sheet':  '0 -8px 40px rgba(26,25,22,0.12)',
        'btn':    '0 2px 8px rgba(29,158,117,0.30)',
        'vip':    '0 2px 12px rgba(186,117,23,0.35)',
        'accent': '0 2px 8px rgba(83,74,183,0.30)',
      },
      animation: {
        'fade-up':    'fadeUp 0.3s ease-out',
        'fade-down':  'fadeDown 0.3s ease-out',
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
        'shimmer':    'shimmer 1.6s infinite',
        'pulse-dot':  'pulseDot 1.2s ease-in-out infinite',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
        'spin-slow':  'spin 2s linear infinite',
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
