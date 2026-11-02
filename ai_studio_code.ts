import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        razy: {
          bg: 'var(--razy-bg)',
          surface: 'var(--razy-surface)',
          elevated: 'var(--razy-elevated)',
          primary: '#8B5CF6',
          secondary: '#EC4899',
          border: 'var(--razy-border)',
          text: {
            primary: 'var(--razy-text-primary)',
            secondary: 'var(--razy-text-secondary)',
          },
          status: {
            success: '#22C55E',
            warning: '#F59E0B',
            error: '#EF4444',
          },
        },
      },
      backgroundImage: {
        'cta-gradient': 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
        'ambient-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.18), transparent 70%)',
        'card-fade':
          'linear-gradient(180deg, rgba(8, 9, 15, 0) 0%, rgba(8, 9, 15, 0.95) 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-manrope)', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'ambient-purple': '0 0 40px -10px rgba(139, 92, 246, 0.25)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;