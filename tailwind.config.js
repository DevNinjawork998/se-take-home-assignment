/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mcdonald: {
          red: "#DA291C",
          yellow: "#FFC72C",
          green: "#27AE60",
        },
      },
    },
  },
  plugins: [],
};
