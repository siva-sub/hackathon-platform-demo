/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}", // Added pages directory
  ],
  darkMode: 'class', // To match existing setup in index.html
  theme: {
    extend: {
      colors: { // Copied from existing tailwind.config in index.html
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
        secondary: {"50":"#f0f9ff","100":"#e0f2fe","200":"#bae6fd","300":"#7dd3fc","400":"#38bdf8","500":"#0ea5e9","600":"#0284c7","700":"#0369a1","800":"#075985","900":"#0c4a6e","950":"#082f49"},
        neutral: {"50":"#f8fafc","100":"#f1f5f9","200":"#e2e8f0","300":"#cbd5e1","400":"#94a3b8","500":"#64748b","600":"#475569","700":"#334155","750":"#283344","800":"#1e293b","900":"#0f172a","950":"#020617"}
      },
      typography: (theme) => ({ // Copied from existing tailwind.config in index.html
        DEFAULT: {
          css: {
            color: theme('colors.neutral.700'),
            a: {
              color: theme('colors.primary.600'),
              '&:hover': {
                color: theme('colors.primary.700'),
              },
            },
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.neutral.900'),
            },
          },
        },
        invert: { // For dark mode
          css: {
            color: theme('colors.neutral.300'),
            a: {
              color: theme('colors.primary.400'),
              '&:hover': {
                color: theme('colors.primary.300'),
              },
            },
             'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.neutral.100'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    // require('@tailwindcss/typography'), // Consider adding if you use prose extensively
  ],
}
