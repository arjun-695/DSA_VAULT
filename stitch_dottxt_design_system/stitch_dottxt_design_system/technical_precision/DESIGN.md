---
name: Technical Precision
colors:
  surface: '#0b141c'
  surface-dim: '#0b141c'
  surface-bright: '#313a43'
  surface-container-lowest: '#060f16'
  surface-container-low: '#141c24'
  surface-container: '#182028'
  surface-container-high: '#222b33'
  surface-container-highest: '#2d363e'
  on-surface: '#dae3ee'
  on-surface-variant: '#c0c7d4'
  inverse-surface: '#dae3ee'
  inverse-on-surface: '#29313a'
  outline: '#8b919d'
  outline-variant: '#414752'
  surface-tint: '#a2c9ff'
  primary: '#a2c9ff'
  on-primary: '#00315c'
  primary-container: '#58a6ff'
  on-primary-container: '#003a6b'
  inverse-primary: '#0060aa'
  secondary: '#7bdb80'
  on-secondary: '#00390e'
  secondary-container: '#007124'
  on-secondary-container: '#91f294'
  tertiary: '#d5bbff'
  on-tertiary: '#41008b'
  tertiary-container: '#b88eff'
  on-tertiary-container: '#4c069d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004882'
  secondary-fixed: '#97f999'
  secondary-fixed-dim: '#7bdb80'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#005319'
  tertiary-fixed: '#ecdcff'
  tertiary-fixed-dim: '#d5bbff'
  on-tertiary-fixed: '#270058'
  on-tertiary-fixed-variant: '#5a21ab'
  background: '#0b141c'
  on-background: '#dae3ee'
  surface-variant: '#2d363e'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  sidebar_width: 260px
  panel_width: 480px
  gutter: 16px
  margin_mobile: 16px
  margin_desktop: 24px
---

## Brand & Style
The design system is engineered for high-density, data-intensive workflows within the developer ecosystem. It prioritizes information architecture and rapid scanning over decorative elements. 

The aesthetic is a fusion of **Modern Minimalist** and **Functional Industrialism**. By utilizing a "No-Shadow" policy, the UI relies entirely on 1px crisp borders and tonal shifting to establish hierarchy. The environment is immersive, utilizing a deep-space palette that reduces eye strain during prolonged sessions of technical analysis. The emotional response is one of controlled efficiency, reliability, and structured logic.

## Colors
The palette is rooted in a layered dark-mode logic. 
- **Surface Tiers:** Use `#0D1117` for the main application background and `#161B22` for containers, cards, and sidebars to create subtle depth.
- **Accents:** The Primary Blue (`#58A6FF`) is reserved for interactive states, primary actions, and focus indicators. The Secondary Green (`#238636`) is used for success states and algorithmic optimizations.
- **Outlines:** All structural boundaries must use `#30363D`. 
- **Status:** Use `#F85149` for errors/unoptimized code and `#D29922` for warnings or complexity alerts.

## Typography
This design system employs a dual-font strategy. **Inter** handles all UI labels, navigation, and headers to maintain professional clarity. **JetBrains Mono** is utilized for all technical data points, including Big O notation, timestamps, memory usage, and code snippets.

For high-density layouts, prioritize `body-sm` for table content. Use `mono-label` specifically for data that requires character-level alignment. Line heights are kept tight to maximize vertical information density.

## Layout & Spacing
The layout follows a **Strict Fixed-Fluid Hybrid** model.
- **Sidebar:** A fixed 260px left-hand navigation allows for persistent access to data structures and categories.
- **Content:** A fluid central area for data tables and visualization.
- **Slide-out Panels:** Right-aligned panels at a fixed 480px width are used for deep-dive analysis of specific algorithms without losing context of the main list.

The spacing rhythm is based on a **4px baseline grid**. Components should use 8px (small), 12px (medium), or 16px (large) internal padding. Data tables should minimize vertical padding (6px-8px) to increase the number of visible rows.

## Elevation & Depth
Elevation is expressed through **Tonal Stacking** and **Surface Contrast**.
1. **Level 0 (Canvas):** `#0D1117` - The furthest back layer.
2. **Level 1 (Card/Sidebar):** `#161B22` - Used for primary UI containers.
3. **Level 2 (Hover/Active):** `#1C2128` - Used to indicate interactivity.

**Borders:** Use 1px solid `#30363D` for all containers. Avoid shadows entirely. To differentiate a focused element (like a modal or active input), change the border color to the primary accent (`#58A6FF`) rather than adding a shadow.

## Shapes
The shape language is "Soft-Industrial." A consistent radius of **6px (0.375rem)** is applied to buttons, inputs, and cards. This provides enough rounding to feel modern while maintaining the rigid, structured feel of a developer tool. Tags and status badges use a 4px radius to feel distinct from interactive buttons.

## Components
- **Data Tables:** Use a header row with `#161B22` background and a 1px bottom border. Text within cells should be `body-sm` (Inter) for descriptions and `mono-label` (JetBrains Mono) for metrics.
- **Buttons:** 
  - *Primary:* Solid `#238636` with white text.
  - *Secondary:* Transparent with `#30363D` border and `#C9D1D9` text.
- **Status Badges:** Compact, 20px height, using low-opacity background tints of the status color (e.g., 15% green background with solid green text).
- **Sidebar Navigation:** Use active state indicators consisting of a 2px vertical line of `#58A6FF` on the far left of the nav item.
- **Input Fields:** Background `#0D1117`, border `#30363D`. On focus, border transitions to `#58A6FF` with no outer glow.
- **Slide-out Panels:** These should slide from the right, anchored to the top/bottom, with a 1px left border of `#30363D` to separate them from the main canvas.