/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        typing: "typing 3s steps(10, end), blink 0.7s step-end infinite",
      },
      keyframes: {
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blink: {
          "50%": { "border-color": "transparent" },
        },
      },
    },
  },
  plugins: [],
};
