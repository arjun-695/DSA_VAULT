---
name: Modern Elegance
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#414753'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#717785'
  outline-variant: '#c1c6d5'
  surface-tint: '#5e5e5e'
  primary: '#5c5c5c'
  on-primary: '#ffffff'
  primary-container: '#747474'
  on-primary-container: '#fcfcfc'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#5e5b59'
  on-tertiary: '#ffffff'
  tertiary-container: '#777471'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e6e2de'
  tertiary-fixed-dim: '#cac6c2'
  on-tertiary-fixed: '#1d1b19'
  on-tertiary-fixed-variant: '#484644'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Playfair Display
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-mobile: 24px
  margin-desktop: 64px
---

# Modern Elegance Design System

## Brand & Style
Modern Elegance is a design system that blends high-fashion editorial aesthetics with digital-first functionality. The brand personality is sophisticated, authoritative, and unapologetically bold, utilizing a monochromatic core energized by soft, stone-like neutrals. It targets a premium audience that values clarity and an elevated aesthetic experience. 

The style is a fusion of **Minimalism** and **High-Contrast Boldness**. It relies on stark black-and-white contrasts, generous whitespace, and classical serif typography to create a sense of timelessness, while the sharp-edged shapes and flat surfaces provide a modern, structural rigour.

## Colors
The palette is centered on a high-contrast monochromatic foundation. 

*   **Primary (#000000):** Used for core branding, primary actions, and headline text to establish maximum authority.
*   **Secondary (#ffffff):** The primary surface color, providing a clean canvas that allows content to breathe.
*   **Tertiary (#ede8e4):** A warm, stone-like neutral used for subtle backgrounds, section dividers, and decorative containers to soften the starkness of the black and white.
*   **Neutral (#000000):** Leveraged for high-fidelity borders and functional iconography.

The color mode is strictly **light**, emphasizing the editorial feel of black ink on white paper.

## Typography
The system uses **Playfair Display** across all levels to maintain a cohesive, editorial identity. This serif typeface brings a sense of luxury and tradition to the digital interface.

*   **Headlines:** Set with high weight and tight line height for a dramatic, "masthead" effect. Large desktop headlines scale up to 48px.
*   **Body:** Uses a comfortable 18px size with generous line height to ensure legibility despite the serif style.
*   **Labels:** Rendered in medium weights with slight letter spacing to differentiate functional UI text from narrative content.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy, drawing inspiration from premium print magazines. It utilizes a 12-column grid on desktop with substantial margins (64px) to frame the content.

The spacing rhythm is disciplined, based on an 8px base unit. Gaps between elements are intentionally large to create a sense of luxury and focus. On mobile devices, margins compress to 24px, and the grid collapses to a single-column flow, maintaining the vertical rhythm established by the serif typography.

## Elevation & Depth
Depth is communicated through **Bold Borders** and **Tonal Layering** rather than traditional shadows. 

The interface remains largely flat. To indicate hierarchy or interactivity, we use 1px solid black borders or the Tertiary (#ede8e4) background to create "recessed" areas. This approach maintains the high-contrast, graphic nature of the brand without introducing the "muddiness" of soft shadows.

## Shapes
The shape language is **Soft**. While the overall aesthetic is architectural and structured, a subtle 0.25rem (4px) radius is applied to buttons and input fields to prevent the interface from feeling overly aggressive. Large cards or containers may use a slightly increased radius (8px or 12px) to maintain visual harmony with the larger surface area.

## Components
*   **Buttons:** Solid Primary (#000000) backgrounds with Secondary (#ffffff) text. Minimalist, with a 4px corner radius.
*   **Cards:** White backgrounds with a 1px Primary (#000000) border or a subtle Tertiary (#ede8e4) fill.
*   **Inputs:** Clean, 1px black bottom-border or full outline with Playfair Display placeholder text.
*   **Chips:** Small, Tertiary-colored backgrounds with high-contrast black text.
*   **Lists:** Separated by thin, 1px Tertiary lines to maintain the vertical rhythm.