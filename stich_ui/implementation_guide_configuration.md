# Dayflow HRMS Implementation Guide

## 1. Design Tokens (tailwind.config.ts)

Add these tokens to your `theme.extend` section.

```typescript
{
  colors: {
    primary: {
      DEFAULT: '#581c87', // Deep Purple
      foreground: '#ffffff',
    },
    surface: {
      DEFAULT: '#fff8f5', // Warm Neutral Background
      dim: '#e0d8d5',
      container: '#faf2ee',
    },
    outline: {
      variant: '#e0d8d5',
    }
  },
  borderRadius: {
    lg: '0.5rem',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  }
}
```

## 2. Shared Components

- `components/layout/TopAppBar.tsx`: The primary header with logo and user menu.
- `components/layout/NavigationDrawer.tsx`: Sidebar for Admin desktop and mobile drawer.
- `components/layout/BottomNavBar.tsx`: Mobile navigation for Employees.

## 3. Shell Layouts

- `components/layout/EmployeeShell.tsx`: Uses top navigation on desktop, bottom navigation on mobile.
- `components/layout/AdminShell.tsx`: Uses persistent sidebar on desktop, menu drawer on mobile.

## 4. Global Styles (globals.css)

Ensure `lucide-react` icons are styled consistently and focus rings use the primary purple.

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

## 5. Required Packages

Ensure these are in your `package.json`:

- `lucide-react`
- `@tanstack/react-router`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
