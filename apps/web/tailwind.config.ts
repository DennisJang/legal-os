import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          primary: '#1D1D1F',
          secondary: '#86868B',
          blue: '#0071E3',
          green: '#34C759',
        },
      },
      spacing: {  
        'safe' : '20px',
        'section': '48px',
      },
      letterspacing: {
        'h1': '-0.04em',
        'h2': '-0.02em',
        'body': '-0.022em',
      },
      borderradius: {
        'card': '18px',
        'btn': '14px',
      },
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'apple-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      backdropBlur: {
        'glass': '20px'
      }
    },
  },
  plugins: [],
};

export default config;
