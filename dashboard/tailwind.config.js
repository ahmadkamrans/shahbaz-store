/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "custom-blue": "#002C57",
        "custom-red": "#F44A51",
        "custom-blue-light": "#16487A",
      },
      backgroundImage: {
        "custom-gradient-red":
          "linear-gradient(270deg, #FF7A7F 0%, #F44A51 45.4%)",
        "custom-gradient-blue":
          "linear-gradient(90deg, #002C57 0%, #16487A 100%)",
      },
      fontFamily: {
        "open-sans-regular": ["Open-Sans-Regular", "sans-serif"],
        "open-sans-medium": ["Open-Sans-Semi-Bold", "sans-serif"],
        "open-sans-bold": ["Open-Sans-Bold", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
    },
  },
  plugins: [],
};
