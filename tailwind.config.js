/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "var(--primary-color)",
        "secondary": "var(--secondary-color)",
        "tertiary": "var(--tertiary-color)",
        "seere-text": "var(--seere-text)"
      },
      fontFamily: {
        "jarkata": ["Plus Jakarta Sans", "sans-serif"]
      }
    },
  },
  plugins: [],
}
