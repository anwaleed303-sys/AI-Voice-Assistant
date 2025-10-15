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
        primary: "#1890ff",
        secondary: "#52c41a",
        background: "#0a0a0a",
        surface: "#1a1a1a",
        ai: {
          primary: "#1677ff",
          secondary: "#722ed1",
          accent: "#13c2c2",
          glow: "#69b1ff",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wave: "wave 1.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": {
            boxShadow: "0 0 5px #1677ff, 0 0 10px #1677ff, 0 0 15px #1677ff",
          },
          "100%": {
            boxShadow: "0 0 10px #1677ff, 0 0 20px #1677ff, 0 0 30px #1677ff",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
