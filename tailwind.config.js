/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app:        'var(--bg-app)',
        card:       'var(--bg-card)',
        hero:       'var(--bg-hero)',
        'hero-soft':'var(--bg-hero-soft)',
        tag:        'var(--bg-tag)',
        accent:     'var(--accent)',
        'accent-light': 'var(--accent-light)',
        'accent-soft':  'var(--accent-soft)',
        border:     'var(--border)',
        primary:    'var(--text-primary)',
        muted:      'var(--text-muted)',
        'on-hero':  'var(--text-on-hero)',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '28px',
      }
    },
  },
  plugins: [],
}