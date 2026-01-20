/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                heading: ["var(--font-outfit)", "sans-serif"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                accent: "var(--accent-orange)",
                primary: "#8B5CF6",
                surface: "#FAFAF9",
            },
            boxShadow: {
                soft: "0 2px 8px rgba(0,0,0,0.05)",
                softMd: "0 4px 12px rgba(0,0,0,0.07)",
            },
            borderRadius: {
                lg: "12px",
                xl: "16px",
                "2xl": "20px",
            },
        },
    },
    plugins: [],
};
