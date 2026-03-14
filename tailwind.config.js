/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Colors based on the app's design system
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "#4CAF50",
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4CAF50",
          600: "#43a047",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
        },
        // Semantic colors
        success: {
          DEFAULT: "#4CAF50",
          light: "#e8f5e9",
        },
        warning: {
          DEFAULT: "#FF9800",
          light: "#fff3e0",
        },
        danger: {
          DEFAULT: "#ef5350",
          light: "#ffebee",
        },
        info: {
          DEFAULT: "#2196F3",
          light: "#e3f2fd",
          dark: "#1976d2",
        },
        // Neutral colors
        neutral: {
          50: "#f8f9fa",
          100: "#f5f5f5",
          200: "#e0e0e0",
          300: "#bdbdbd",
          400: "#9e9e9e",
          500: "#757575",
          600: "#666",
          700: "#424242",
          800: "#333",
          900: "#1a1a1a",
        },
        // Background colors
        background: {
          DEFAULT: "#f8f9fa",
          card: "#ffffff",
          input: "#f5f5f5",
        },
        // Text colors
        text: {
          DEFAULT: "#1a1a1a",
          secondary: "#666",
          muted: "#9e9e9e",
          inverse: "#ffffff",
        },
        // Border colors
        border: {
          DEFAULT: "#e0e0e0",
          light: "#f5f5f5",
          focus: "#4CAF50",
        },
      },
      // Typography scale
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["15px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "26px" }],
        "2xl": ["20px", { lineHeight: "28px" }],
        "3xl": ["24px", { lineHeight: "32px" }],
        "4xl": ["28px", { lineHeight: "36px" }],
      },
      // Font weights
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      // Spacing scale (based on 4px grid)
      spacing: {
        "0.5": "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        3.5: "14px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        10: "40px",
        12: "48px",
        14: "56px",
        16: "64px",
      },
      // Border radius scale
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
        // Special radius for continuous curves (iOS style)
        continuous: "999px",
      },
      // Shadows (CSS box-shadow for New Architecture)
      boxShadow: {
        none: "none",
        xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
        DEFAULT: "0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04)",
        md: "0 4px 6px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
        xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
        // Special shadows for cards and buttons
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 20px rgba(0, 0, 0, 0.12)",
        button: "0 4px 8px rgba(76, 175, 80, 0.3)",
        "button-danger": "0 4px 8px rgba(239, 83, 80, 0.3)",
        dropdown: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
      // Z-index scale
      zIndex: {
        hide: -1,
        auto: "auto",
        base: 0,
        docked: 10,
        dropdown: 100,
        sticky: 110,
        banner: 120,
        overlay: 130,
        modal: 140,
        popover: 150,
        skipLink: 160,
        toast: 170,
        tooltip: 180,
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities }) {
      addUtilities({
        // Safe area utilities
        ".pb-safe": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".pt-safe": {
          paddingTop: "env(safe-area-inset-top)",
        },
        ".px-safe": {
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        },
        // Tabular nums for counters
        ".tabular-nums": {
          fontVariantNumeric: "tabular-nums",
        },
        // iOS continuous border radius
        ".rounded-continuous": {
          borderCurve: "continuous",
        },
      });
    },
  ],
};
