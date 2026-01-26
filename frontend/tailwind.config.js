export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(99 102 241)",
        "primary-dark": "rgb(79 70 229)",
        secondary: "rgb(236 72 153)",
        accent: "rgb(139 92 246)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
      },
    },
  },
  plugins: [],
}