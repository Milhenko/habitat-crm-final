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
        'navy-sophisticate': '#1E2D40',
        'warm-bone': '#EBEAE6',
        'rich-black': '#1A1A1A',
        'absolute-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
export default config;