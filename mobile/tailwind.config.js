/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  // NOTE: This points to your "app" and "src" folders
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "sn-pro-medium": ["SNProMedium"],
        "sn-pro-bold": ["SNProBold"],
        "sn-pro-black": ["SNProBlack"],
        "sn-pro-regular": ["SNProRegular"],
        "sn-pro-extrabold": ["SNProExtraBold"],
      },
    },
  },
  plugins: [],
};
