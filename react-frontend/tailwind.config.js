/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* KeetCode design tokens — dark */
        keet: {
          bg:       '#09090b',
          surface:  '#18181b',
          elevated: '#27272a',
          border:   'rgba(255,255,255,0.08)',
          cyan:     '#22d3ee',
          indigo:   '#6366f1',
          /* Light-mode tokens */
          'light-bg':      '#f8fafc',
          'light-surface': '#ffffff',
          'light-elevated':'#f1f5f9',
          'light-border':  '#e2e8f0',
          'light-text':    '#0f172a',
          'light-muted':   '#64748b',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 0 rgba(34,211,238,0.3)" },
          "50%":       { boxShadow: "0 0 20px 4px rgba(34,211,238,0.6)" },
        },
        "pulse-glow-indigo": {
          "0%, 100%": { boxShadow: "0 0 8px 0 rgba(99,102,241,0.3)" },
          "50%":       { boxShadow: "0 0 20px 4px rgba(99,102,241,0.55)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        "shimmer-light": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.4" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "theme-icon-in": {
          from: { opacity: "0", transform: "rotate(-90deg) scale(0.7)" },
          to:   { opacity: "1", transform: "rotate(0deg) scale(1)" },
        },
      },
      animation: {
        "accordion-down":    "accordion-down 0.2s ease-out",
        "accordion-up":      "accordion-up 0.2s ease-out",
        "pulse-glow":        "pulse-glow 2s ease-in-out infinite",
        "pulse-glow-indigo": "pulse-glow-indigo 2s ease-in-out infinite",
        "fade-in-up":        "fade-in-up 0.5s ease-out both",
        "shimmer":           "shimmer 1.4s ease infinite",
        "float":             "float 3s ease-in-out infinite",
        "glow-pulse":        "glow-pulse 2s ease-in-out infinite",
        "spin-slow":         "spin-slow 3s linear infinite",
        "theme-icon-in":     "theme-icon-in 0.25s ease-out both",
      },
      backgroundImage: {
        'dot-grid':       "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        'dot-grid-light': "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      boxShadow: {
        'glow-cyan':    '0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1)',
        'glow-indigo':  '0 0 20px rgba(99, 102, 241, 0.35), 0 0 40px rgba(99, 102, 241, 0.12)',
        'card-hover':   '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.08)',
        'card-live':    '0 0 30px rgba(99, 102, 241, 0.15)',
        'card-light':   '0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
