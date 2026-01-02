/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        bg: {
          light: '#ffffff',
          dark: '#0a0a0a',
        },
        text: {
          light: '#1a1a1a',
          dark: '#e5e5e5',
        },
        border: {
          light: '#e5e5e5',
          dark: '#262626',
        },
        card: {
          light: '#ffffff',
          dark: '#171717',
        },
      },
    },
  },
  plugins: [],
}
