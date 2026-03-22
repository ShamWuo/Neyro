import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            /** text-primary / text-secondary: main copy (separate from bg-primary = brand fill) */
            textColor: {
                primary: "var(--text-primary)",
                secondary: "var(--text-secondary)",
            },
            backgroundColor: {
                primary: "var(--accent)",
            },
            borderColor: {
                primary: "var(--accent)",
            },
            colors: {
                /** Marketing / dark landing (used by (landing)/landing) */
                background: "#08080c",
                foreground: "#fafafa",
                "border-glass": "rgba(255, 255, 255, 0.08)",
                "bg-surface-glass": "rgba(255, 255, 255, 0.04)",
                "bg-deep": "#030712",
                brand: "var(--brand)",
                accent: {
                    DEFAULT: "var(--accent)",
                    light: "var(--accent-light)",
                    dark: "var(--accent-dark)",
                },
                teal: {
                    DEFAULT: "var(--teal)",
                    light: "var(--teal-light)",
                },
                amber: {
                    DEFAULT: "var(--amber)",
                    light: "var(--amber-light)",
                },
                coral: {
                    DEFAULT: "var(--coral)",
                    light: "var(--coral-light)",
                },
                "bg-primary": "var(--bg-primary)",
                "bg-card": "var(--bg-card)",
                "bg-subtle": "var(--bg-subtle)",
                "bg-hover": "var(--bg-hover)",
                border: "var(--border-default)",
                "border-strong": "var(--border-strong)",
                "text-primary": "var(--text-primary)",
                "text-secondary": "var(--text-secondary)",
                "text-muted": "var(--text-muted)",
                "text-placeholder": "var(--text-placeholder)",
            },
            fontFamily: {
                sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
                display: ['"Instrument Serif"', 'serif'],
                mono: ['"DM Mono"', 'monospace'],
            },
            borderRadius: {
                card: "10px",
                button: "7px",
                input: "8px",
                modal: "14px",
                pill: "999px",
            },
            boxShadow: {
                card: "0 1px 4px var(--shadow-default)",
                hover: "0 2px 8px var(--shadow-default)",
                modal: "0 4px 20px var(--shadow-default)",
                focus: "0 0 0 3px rgba(108,99,255,0.1)",
            },
            animation: {
                'fade-slide-up': 'fadeSlideUp 200ms ease-out forwards',
                'capture': 'captureExpand 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'slide-in-right': 'slideInRight 250ms ease-out',
                'checkmark-burst': 'checkmarkBurst 400ms ease-out',
            },
            keyframes: {
                fadeSlideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                captureExpand: {
                    '0%': { opacity: '0', transform: 'scale(0.8)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                checkmarkBurst: {
                    '0%': { transform: 'scale(0.5)', opacity: '0' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
