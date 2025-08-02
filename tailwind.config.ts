import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "rgb(209 213 219)",
            "--tw-prose-headings": "rgb(255 255 255)",
            "--tw-prose-lead": "rgb(156 163 175)",
            "--tw-prose-links": "rgb(96 165 250)",
            "--tw-prose-bold": "rgb(255 255 255)",
            "--tw-prose-counters": "rgb(156 163 175)",
            "--tw-prose-bullets": "rgb(75 85 99)",
            "--tw-prose-hr": "rgb(55 65 81)",
            "--tw-prose-quotes": "rgb(229 231 235)",
            "--tw-prose-quote-borders": "rgb(55 65 81)",
            "--tw-prose-captions": "rgb(156 163 175)",
            "--tw-prose-code": "rgb(251 146 60)",
            "--tw-prose-pre-code": "rgb(229 231 235)",
            "--tw-prose-pre-bg": "rgb(17 24 39)",
            "--tw-prose-th-borders": "rgb(75 85 99)",
            "--tw-prose-td-borders": "rgb(55 65 81)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
