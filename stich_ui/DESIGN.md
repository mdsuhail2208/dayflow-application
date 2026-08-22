---
name: Dayflow Narrative
colors:
  surface: "#fff8f5"
  surface-dim: "#e0d8d5"
  surface-bright: "#fff8f5"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#faf2ee"
  surface-container: "#f4ece8"
  surface-container-high: "#eee7e3"
  surface-container-highest: "#e9e1dd"
  on-surface: "#1e1b19"
  on-surface-variant: "#4c4451"
  inverse-surface: "#33302d"
  inverse-on-surface: "#f7efeb"
  outline: "#7d7482"
  outline-variant: "#cfc2d2"
  surface-tint: "#7c43ab"
  primary: "#3e0069"
  on-primary: "#ffffff"
  primary-container: "#581c87"
  on-primary-container: "#ca8efc"
  inverse-primary: "#e0b6ff"
  secondary: "#712ae2"
  on-secondary: "#ffffff"
  secondary-container: "#8a4cfc"
  on-secondary-container: "#fffbff"
  tertiary: "#252727"
  on-tertiary: "#ffffff"
  tertiary-container: "#3b3d3d"
  on-tertiary-container: "#a7a7a7"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#f2daff"
  primary-fixed-dim: "#e0b6ff"
  on-primary-fixed: "#2d004f"
  on-primary-fixed-variant: "#632892"
  secondary-fixed: "#eaddff"
  secondary-fixed-dim: "#d2bbff"
  on-secondary-fixed: "#25005a"
  on-secondary-fixed-variant: "#5a00c6"
  tertiary-fixed: "#e2e2e2"
  tertiary-fixed-dim: "#c6c7c6"
  on-tertiary-fixed: "#1a1c1c"
  on-tertiary-fixed-variant: "#454747"
  background: "#fff8f5"
  on-background: "#1e1b19"
  surface-variant: "#e9e1dd"
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built for a modern HR platform that balances administrative authority with human-centric warmth. The aesthetic follows a **Corporate / Modern** style, characterized by exceptional clarity, structured information density, and a high-end editorial feel.

The interface prioritizes a "calm productivity" atmosphere. It avoids the clinical coldness of traditional enterprise software by utilizing warm-toned neutrals and deep, sophisticated accents. The visual hierarchy is established through intentional whitespace and subtle tonal shifts rather than aggressive borders or heavy shadows.

**Key Attributes:**

- **Authoritative:** Trustworthy through precise alignment and systematic typography.
- **Approachable:** Friendly through soft geometry and legible, accessible type scales.
- **Efficient:** High signal-to-noise ratio focusing on data clarity and task completion.

## Colors

The palette is anchored by a warm stone background, which provides a more comfortable reading experience than pure white. The primary brand color is a deep, majestic purple, used strategically for call-to-actions and brand presence.

- **Background:** Use the stone-50 (`#fafaf9`) for the main canvas to create a sophisticated, parchment-like warmth.
- **Surface:** Pure white (`#ffffff`) is reserved for cards, modals, and input fields to lift them off the background.
- **Primary:** Deep Purple (`#581c87`) is the primary driver of action.
- **Secondary:** A lighter Violet (`#7c3aed`) is used for accents and secondary interactive elements.
- **Borders:** Use a soft stone-200 (`#e7e5e4`) for subtle containment and separation.
- **Interactive States:** Hover states should darken the primary color slightly, while the focus ring uses a soft violet glow with a 2px offset.

## Typography

The typography system uses **Inter** exclusively to maintain a clean, systematic, and highly legible interface. The scale is designed to handle complex HR data while maintaining an elegant editorial flow.

- **Contrast:** High contrast between titles (600/700 weight) and body text (400 weight) is essential for rapid scanning.
- **Display Type:** Reserved for dashboard overviews and empty states, using tight letter spacing for a modern look.
- **Labels:** Use Medium (500) or SemiBold (600) weights for UI labels and buttons to ensure they stand out against body content.
- **Readability:** Maintain a line length of 60-75 characters for long-form content, such as employee handbooks or policy descriptions.

## Layout & Spacing

This design system utilizes a **Fluid Grid** approach within defined constraints to ensure the dashboard scales effectively across devices.

- **Grid System:** A 12-column grid for desktop with 24px gutters. For tablet (768px - 1024px), use an 8-column grid. For mobile, use a 4-column grid.
- **Rhythm:** All spacing is based on a 4px baseline, but primary layout gaps should stick to 16px (md) or 24px (lg) for a generous, airy feel.
- **Safe Zones:** Always maintain a minimum 40px margin on desktop to prevent content from feeling "trapped" at the screen edges.
- **Information Density:** For data-heavy tables, use "Compact" spacing (8px vertical padding). For marketing or landing pages, use "Spacious" spacing (32px+ vertical gaps).

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. The goal is to make the UI feel grounded and physical without being distracting.

- **Level 0 (Base):** The background (`#fafaf9`).
- **Level 1 (Cards):** White surface with a 1px border (`#e7e5e4`). No shadow, or an extremely subtle 2px blur.
- **Level 2 (Dropdowns/Popovers):** White surface with a 1px border and a soft ambient shadow (0px 4px 12px rgba(0, 0, 0, 0.05)).
- **Level 3 (Modals):** White surface with a more pronounced shadow (0px 12px 32px rgba(0, 0, 0, 0.1)) and a backdrop blur of 8px on the background layer.
- **Depth Color:** Shadows should never be pure black; they should have a hint of the neutral stone or primary purple to keep the UI feeling warm.

## Shapes

The shape language is consistently **Rounded**, communicating friendliness and safety—critical traits for HR software.

- **Standard Components:** Buttons, inputs, and cards use the `rounded-lg` (8px) setting.
- **Inner Elements:** Elements nested inside a card (like an image or a secondary block) should use 4px or 6px to maintain visual nested harmony.
- **Circular Elements:** Avatars and status indicators should always be fully rounded (pill/circle) to differentiate "people" from "objects."

## Components

### Buttons

- **Primary:** Deep purple background, white text. 8px corner radius. On hover, darken to `#4c1d95`.
- **Secondary:** Stone-100 background, stone-900 text. Subtle border.
- **Ghost:** No background, purple text. Used for less frequent actions.

### Input Fields

- **Default:** White background, stone-200 border, 8px radius. 12px horizontal padding.
- **Focus:** 1px border shifts to purple, with a 3px soft purple outer glow (0.2 opacity).
- **Labels:** Always placed above the input in `label-md`.

### Cards

- **Container:** White background, stone-200 border.
- **Header:** Often includes a light stone-50 bottom border to separate title from content.

### Chips & Tags

- **Status Tags:** Use low-saturation background colors (e.g., light green for "Active") with high-saturation text of the same hue for maximum accessibility and a modern "soft" look.

### Lists & Tables

- **Rows:** 1px bottom border (`#e7e5e4`). No vertical borders. Hover state uses a very faint stone-50 background tint.

### Navigation

- **Sidebar:** Use a slightly darker neutral or a muted version of the primary color to provide a strong structural anchor for the application. Icons should be line-based and 20px in size.
