# Dayflow HRMS Implementation Guide

## 1. Design Tokens (tailwind.config.ts)

Update your `tailwind.config.ts` to include these custom tokens from the Dayflow Narrative design system.

```typescript
/** @type {import('tailwindcss').Config} */
export default {
  // ... existing config
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#581c87", // Deep Purple (Purple 900)
          foreground: "#ffffff",
        },
        surface: {
          DEFAULT: "#fff8f5", // Warm Neutral (Stone 50 equivalent)
          dim: "#e0d8d5",
          container: "#faf2ee",
        },
        outline: {
          variant: "#e0d8d5",
        },
      },
      borderRadius: {
        lg: "0.5rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
};
```

## 2. Global Styles (src/index.css or globals.css)

Ensure standard focus rings and background defaults are applied.

```css
@layer base {
  body {
    @apply bg-surface text-slate-900 antialiased;
  }
  :focus-visible {
    @apply outline-none ring-2 ring-primary ring-offset-2;
  }
}
```

## 3. Required Packages

Ensure these dependencies are present in your `package.json`:

- `lucide-react`
- `@tanstack/react-router`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `shadcn/ui` components (Sheet, Button, Avatar, etc.)
