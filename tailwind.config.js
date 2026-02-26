/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#D1F366", // Lime Green
                "primary-dark": "#b0cc56",
                lavender: "#B8B2E1",
                charcoal: "#1A1A1A",
                "background-light": "#F4F5F7",
                "background-dark": "#0F0F0F",
                white: "#FFFFFF",
                "card-light": "#FFFFFF",
                "card-dark": "#1C1C1E",
                danger: "#FF5B5B",
                "failure-bg": "#FFF1F1",
                "failure-border": "#FFD1D1",
                "failure-border": "#FFD1D1",
                "audit-lime": "#bef264",
                "audit-lavender": "#ddd6fe",
                "audit-red": "#fecaca",
                "audit-grey": "#F5F5F7",
                "audit-border": "#E5E7EB",
                "accent-lime": "#84cc16",
                "accent-lavender": "#a78bfa",
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                display: ['"Public Sans"', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: "24px",
                xl: "32px",
            },
        },
    },
    plugins: [],
}
