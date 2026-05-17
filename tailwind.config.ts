import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111318",
        paper: "#f7f4ee",
        moss: "#6f7b4d",
        clay: "#b35b45",
        ocean: "#256f8d",
        plum: "#6d4d7e"
      },
      boxShadow: {
        soft: "0 20px 70px rgba(17, 19, 24, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
