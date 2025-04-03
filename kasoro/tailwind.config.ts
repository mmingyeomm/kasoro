import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
    // css variable 등록
      fontFamily: {
        fbpung: ["var(--font-fbpung)"],
      },
    },
  },
  plugins: [],
};
export default config;