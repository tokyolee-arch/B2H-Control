import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivi: {
          primary: '#0a0e14',
          card: '#111820',
          cardHover: '#161e28',
          border: '#1e2a38',
          textPrimary: '#e8edf3',
          textSecondary: '#7a8ba0',
          textDim: '#4a5a6e',
          accentBlue: '#3b8bff',
          accentGreen: '#00d68f',
          accentOrange: '#ff9f43',
          accentRed: '#ff4757',
          accentPurple: '#a78bfa',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
