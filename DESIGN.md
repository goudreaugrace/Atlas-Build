---
version: alpha
name: AtlasVisualSSOT
description: Central visual guidelines for Project Atlas synced from Figma SSOT (fileKey=bVRNvc1roScaoHUlBABt9T).
colors:
  primary: "#237FE1"
  primary-dark: "#0563C7"
  primary-light: "#ABD2FB"
  secondary: "#EB9F0A"
  secondary-dark: "#BD7D00"
  secondary-light: "#FFF0D2"
  complementary: "#3C8500"
  complementary-dark: "#2C6100"
  complementary-light: "#CFE1A8"
  destructive: "#E1430A"
  destructive-dark: "#A1330B"
  destructive-light: "#FFC0A9"
  neutral-text: "#31373D"
  neutral-muted: "#707172"
  neutral-border: "#EBEBEB"
  neutral-bg: "#F5F5F5"
  page: "#EEF0F1"
typography:
  headings:
    fontFamily: "Libre Franklin"
    fontWeight: 500
  body:
    fontFamily: "Inter"
    fontWeight: 400
  page-heading:
    fontFamily: "Libre Franklin"
    fontSize: "{variables.font-size-highlight-large}"
    fontWeight: 400
    lineHeight: "44px"
    letterSpacing: "-0.8px"
  h1:
    fontFamily: "Libre Franklin"
    fontSize: "{variables.font-size-heading-h1-page-title}"
    fontWeight: 500
    lineHeight: "36px"
    letterSpacing: "-0.8px"
  h2:
    fontFamily: "Libre Franklin"
    fontSize: "{variables.font-size-heading-h2-section-title}"
    fontWeight: 500
    lineHeight: "28px"
    letterSpacing: "-0.8px"
  h3:
    fontFamily: "Libre Franklin"
    fontSize: "{variables.font-size-heading-h3-subsection-title}"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "-0.144px"
  h4:
    fontFamily: "Libre Franklin"
    fontSize: "{variables.font-size-heading-h4-paragraph-title}"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "-0.128px"
  h5:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "22px"
    letterSpacing: "-0.12px"
    textTransform: "uppercase"
  body-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "-0.056px"
  body-lg:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "-0.2px"
  body-sm:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "-0.1px"
variables:
  font-size-highlight-large: "40px"
  font-size-heading-h1-page-title: "28px"
  font-size-heading-h2-section-title: "22px"
  font-size-heading-h3-subsection-title: "18px"
  font-size-heading-h4-paragraph-title: "16px"
  typography-font-weight-regular: 400
gradients:
  gradient-01: "linear-gradient(107.873deg, rgb(241, 238, 231) 0%, rgb(229, 240, 252) 100%)"
  gradient-02: "linear-gradient(107.873deg, rgb(226, 238, 250) 0%, rgb(230, 236, 217) 100%)"
  gradient-03: "linear-gradient(107.873deg, rgb(255, 240, 210) 0%, rgb(245, 245, 245) 100%)"
  gradient-04: "linear-gradient(107.873deg, rgb(207, 225, 168) 0%, rgb(255, 240, 210) 100%)"
  gradient-05: "linear-gradient(149.878deg, rgb(35, 127, 225) 51.552%, rgb(136, 180, 41) 99.331%)"
  gradient-06: "linear-gradient(147.865deg, rgb(235, 159, 10) 53.108%, rgb(129, 192, 104) 102.38%)"
  gradient-07: "linear-gradient(147.865deg, rgb(142, 188, 41) 53.108%, rgb(35, 127, 225) 102.38%)"
rounded:
  sm: 20px                      # Small round corner - for elements under 300px
  md: 24px                      # Medium round corner - for elements under 600px
  lg: 28px                      # Large round corner - for elements above 600px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  card:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: 20px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  badge-success:
    backgroundColor: "{colors.complementary-light}"
    textColor: "{colors.complementary-dark}"
    rounded: "9999px"
    padding: "4px 12px"
---

## Overview

Central visual identity sheet for **Project Atlas**, a strategy co-pilot for PepsiCo's Central Negotiation Office (CNO). 
This identity moves away from default corporate dark purples to an airy, trust-building palette featuring collaborative friendly blues (Primary), strategic warm ambers (Secondary), and operational greens (Complementary).

The identity is governed by soft circular curves (round corner tokens ranging from `20px` to `28px`) and structured spacing rules to deliver professional information-dense interfaces that remain elegant and readable.

## Colors

The palette is grouped into distinct tier functions as synchronized directly from the visual guidelines page:

- **Primary ({colors.primary}):** Core brand color. Used for high-emphasis buttons, active sidebar items, navigation highlights, and core brand indicators.
- **Secondary ({colors.secondary}):** High-contrast warning/amber. Used for timeline highlights, readiness progress levels, secondary alerts, and priority attention flags.
- **Complementary ({colors.complementary}):** Green contrast. Used for growth trends, margin improvements, completed approval steps, and positive feedback highlights.
- **Destructive ({colors.destructive}):** Tension red. Used for guardrail violations, risk panels, negative trends, and action alerts.
- **Neutral Text ({colors.neutral-text}):** Set to `#31373D` (not solid black) for warm, professional readability.
- **Neutral Border ({colors.neutral-border}):** A soft `#EBEBEB` layer for keeping containers clean without jarring lines.

### Brand Gradients & Abstract Styling
The Figma file defines seven gradient styles (Gradient-01 through Gradient-07). Use these exact CSS values for any gradient surface:
- **Gradient-01 ({gradients.gradient-01}):** Warm cream-to-blue subtle wash (`linear-gradient(107.873deg, rgb(241,238,231) 0%, rgb(229,240,252) 100%)`). Used for soft ambient backgrounds.
- **Gradient-02 ({gradients.gradient-02}):** Blue-to-green crossover (`linear-gradient(107.873deg, rgb(226,238,250) 0%, rgb(230,236,217) 100%)`). Used for transitional data states.
- **Gradient-03 ({gradients.gradient-03}):** Amber-to-white fade (`linear-gradient(107.873deg, rgb(255,240,210) 0%, rgb(245,245,245) 100%)`). Used for warning-highlighted surfaces.
- **Gradient-04 ({gradients.gradient-04}):** Green-to-amber warmth (`linear-gradient(107.873deg, rgb(207,225,168) 0%, rgb(255,240,210) 100%)`). Used for success-to-attention transitions.
- **Gradient-05 ({gradients.gradient-05}):** Primary blue-to-green brand blend (`linear-gradient(149.878deg, rgb(35,127,225) 51.552%, rgb(136,180,41) 99.331%)`). Used for high-fidelity vector backgrounds and hero sections.
- **Gradient-06 ({gradients.gradient-06}):** Amber-to-green (`linear-gradient(147.865deg, rgb(235,159,10) 53.108%, rgb(129,192,104) 102.38%)`). Used for financial alert-to-success transitions.
- **Gradient-07 ({gradients.gradient-07}):** Green-to-blue (`linear-gradient(147.865deg, rgb(142,188,41) 53.108%, rgb(35,127,225) 102.38%)`). Used for milestone-to-brand transitions.

### System Background Images (Asset Synced)
To establish deep textural environments, our layouts rely on actual visual PNG background styles located inside the repository at **`app/assets/images/backgrounds/`**. All seven backgrounds are soft-blurred gradient mesh images designed to sit behind glassmorphic panels without competing with foreground content.

| Asset | File Path | Description | Typical Use Case |
| :--- | :--- | :--- | :--- |
| **BG-01** | `app/images/backgrounds/BG-01.png` | Vibrant green-to-blue mesh gradient with golden yellow accent. Cool, fresh, optimistic. | Central workspace page background; hero section backdrop for active dashboards. |
| **BG-02** | `app/images/backgrounds/BG-02.png` | Deep royal blue with lime green and mustard gold curves. Airy, modern, calm. | Administrative or executive side navigation bar; dark-textured sidebar layouts. |
| **BG-03** | `app/images/backgrounds/BG-03.png` | Warm earthy palette — pale golden yellow, olive green, soft orange. Low-saturation, cozy. | Contextual container highlight; glassmorphic card overlays during metrics presentations. |
| **BG-04** | `app/images/backgrounds/BG-04.png` | Cool green-to-teal-to-deep-blue vertical gradient with soft blurred orb in lower right. Serene, natural. | Workspace hero banners; AI Debrief page background; strategy workspace headers. |
| **BG-05** | `app/images/backgrounds/BG-05.png` | Bright sky blue transitioning to teal and emerald green with blurred organic shape. Uplifting, clean. | Home page hero banner; overview dashboard hero section. |
| **BG-06** | `app/images/backgrounds/BG-06.png` | Warm golden-amber upper field fading to grassy green with a lime/teal blurred orb. Energetic, fresh. | Alert and notification hero sections; "What changed" summary banners; financial highlight surfaces. |
| **BG-07** | `app/images/backgrounds/BG-07.png` | Minimalist warm off-white base with small cluster of soft pastel shapes (peach, blue, lime) in bottom-right corner. Airy, gentle. | Light-mode canvas background for content-heavy pages; subtle backdrop behind translucent panels where minimal visual interference is required. |

**Usage rules:**
- Reference backgrounds in CSS via relative path: `background-image: url('app/images/backgrounds/BG-XX.png');`
- Always pair with `background-size: cover; background-position: center; background-repeat: no-repeat;`
- When using a background image behind a panel, apply the panel's glassmorphic properties (`backdrop-filter`, translucent bg, border) on top — the background image provides the color texture, the panel provides readability.
- Background images are **never** used as solid fills — they always sit behind a translucent or semi-translucent layer.

## Typography

Atlas mixes two font families to separate executive summary structure from technical reading content:

1. **Libre Franklin** is reserved for **headings and structural page titles** (H1–H4); Figma uses **Medium weight (500)** for H1–H4 and **Regular (400)** for the large page heading.
2. **Inter** is reserved for **body paragraphs, metadata, data grid text, inputs, and eyebrow labels**; configured as highly legible sans-serif.

### Complete Heading & Paragraph Scale (verified via Figma MCP)

| Style | Font | Weight | Size | Line Height | Letter Spacing | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Heading** | Libre Franklin | 400 (Regular) | 40px | 44px | -0.8px | Hero / highlight-large text |
| **H1** (Page Title) | Libre Franklin | 500 (Medium) | 28px | 36px | -0.8px | Top-level page titles |
| **H2** (Section Title) | Libre Franklin | 500 (Medium) | 22px | 28px | -0.8px | Major section headers |
| **H3** (Subsection Title) | Libre Franklin | 500 (Medium) | 18px | 24px | -0.144px | Subsection headers |
| **H4** (Paragraph Title) | Libre Franklin | 500 (Medium) | 16px | 20px | -0.128px | Card / panel titles |
| **H5** (Eyebrow) | Inter | 700 (Bold) | 12px | 22px | -0.12px | **Uppercase** — used as eyebrow labels above headings or as section category tags |
| **Paragraph Large** | Inter | 400 (Regular) | 16px | 24px | -0.2px | Long-form descriptive text |
| **Paragraph Standard** | Inter | 400 (Regular) | 14px | 22px | -0.056px | Default body text |
| **Paragraph Small** | Inter | 400 (Regular) | 12px | 20px | -0.1px | Captions, metadata, secondary info |

### H5 Eyebrow — Special Rules
- **H5 is NOT a Libre Franklin heading.** It uses **Inter Bold 700** at **12px**, **uppercase**, with a tight `-0.12px` tracking.
- Use H5 as **eyebrow labels** above H1–H3 headings (e.g. a small uppercase category tag sitting above a section title), or as standalone category badges inside panel headers.
- **Do not render H5 as an H4.** H4 is 16px Libre Franklin Medium; H5 is 12px Inter Bold uppercase. They are visually distinct.

Spacing around headings should use standard vertical margin scale derived from spacing rules to prevent text collisions.

## Layout & Spacing

Atlas follows a structured layout baseline scale:
- Gap items inside components (metadata clusters, sidebar menus): `xs` (4px) or `sm` (8px).
- Inter-panel component sections, buttons grids: `md` (16px) or `lg` (24px).
- Main page border layouts, grid structures: `xl` (32px) or `xxl` (48px).

## Shapes

Atlas breaks away from harsh retro sharp corners. All containers, selectors, borders, and interaction states use soft curved shapes:
- **Small Rounded (`sm: 20px`)**: Cards under 300px width, input fields, badges, action buttons, dropdown containers.
- **Medium Rounded (`md: 24px`)**: Group surfaces under 600px, main dashboard panels, chatbox bubbles, modals.
- **Large Rounded (`lg: 28px`)**: Larger dashboards wrappers, main section panels, cards above 600px width.

## Panel & Container Structural Anatomy

Atlas layouts follow a consistent container visual hierarchy to keep complex negotiation data legible, lightweight, and cohesive:

### 1. The Adaptive Page Layout Wrapper
* **Global Margins:** The page wrapper is horizontally centered using `margin: 0 auto` — no fixed side margins. Content is constrained by the container width alone, allowing margins to scale fluidly with the viewport.
* **Workspace Area Constraints:** Core interactive blocks sit inside a container with `max-width: 1380px`, centered with `margin: 0 auto`. The reference frame is 1728px wide, giving approximately `174px` of natural whitespace per side at that viewport — but this is emergent, not hardcoded.
* **Fixed Vertical Offsets:** 
  - Standard top header modules maintain a fixed height of **`128px`** (contains logo references, navigation clusters, and page titles).
  - Component blocks stack vertically separated by standard gaps of **`32px`** or **`48px`** (`xl` or `xxl` layout spacing) depending on section depth.

### 2. Panel Component Variants & Glassmorphism Properties
Our architecture utilizes specific glassmorphic container variations depending on UI context:

| Panel Style | Background Token | Backdrop Blur | Border Style | Typical Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Panel / Regular** | `var(--colors.neutral-bg, #F5F5F5)` | None | `1px solid var(--colors.gray-50, #D9DADB)` | Primary structured containers (such as data tables, action boards, and core metadata list grids). |
| **Panel / Semi** | `var(--colors.translucent-bg-semi, rgba(245,245,245,0.75))` | **`224px`** blur | `1px solid var(--colors.white, #F5F5F5)` | Modals, flyout context settings, floating cards, or high-priority hover panels overlaying busy background textures. |
| **Panel / Translucent** | `var(--colors.translucent-bg-clear, rgba(245,245,245,0.1))` | **`224px`** blur | `1px solid var(--colors.white, #F5F5F5)` | Highly dynamic graphical widgets, ambient visual backdrops, or blending layers over textured background images. |

*Note: All three panel classes enforce absolute corner rounding of **`md: 24px`** and a **standardized interior padding of `20px` on all sides** with an internal component flex spacing of **`24px` (`gap-6`)**.*

### 4. Standardized Panel Padding Rule

**All panel variants — Panel / Regular, Panel / Semi, and Panel / Translucent — must use a uniform `20px` padding on all four sides.** This is a hard standard:

- `padding: 20px;` (shorthand for `padding: 20px 20px 20px 20px;`)
- Do **not** use asymmetric padding values (e.g. `24px 32px`) on any panel container.
- Do **not** use the older `px: 32px / py: 24px` split — this has been superseded.
- If a panel contains a nested sub-panel, the outer panel uses `20px` and the inner panel also uses `20px`.
- The only exception is the floating AI chat component (`Panel / Translucent`), which uses `16px` padding to keep the input row compact.

### 3. General Design Patterns for Consistent Layout Replication
When using AI tools (Figma Make, Codex, or Hermes) to compose new features, enforce these standardized patterns to preserve visual harmony:

* **Dual-Column Ratio (Dashboard split):**
  - When nesting a side column, utilize a proportional split: **71% relative width** for the primary dashboard component (e.g. `897px`) and **29% relative width** for the contextual panel component (e.g. `365px`).
  - Keep columns aligned with a strict horizontal spacing gap of **`16px` (`gap-4`)**.
  - Always match the exact parent heights of paired columns to preserve horizontal visual balance.
* **Component Header Blocks:**
  - Panel headers (containing card titles on the left and action buttons on the right) must sit inside a full-width row with a fixed height of **`38px`**.
  - All nested lists or form modules must begin exactly **`22px`** below this header block.
* **List Row Elements:**
  - Multi-row listings must maintain standard cell heights of **`61px`** or **`64px`** per row.
  - Rows should wrap their backgrounds inside the smaller **`sm: 20px`** rounding radii.
  - Interactive pill flags, progress indicators, or metadata labels align to the far right inside their respective row.
* **Refined Data Editor Splits:**
  - Within full-width workspace panels, maintain a horizontal layout split: a **24% wide sidebar module** (for structural inputs, margin risk levels, confidence scores, and source tracking) and a **74% wide text-editor area**, separated by a **`24px` central gap (`gap-6`)**.
  - Numbered list loops must render their badges inside circular shapes of exactly **`38px x 38px`**, floated natively alongside active input text elements.

## Do's and Don'ts

- **Do** check DESIGN.md for specific color values instead of hardcoding arbitrary colors in Codex or Hermes.
- **Do** utilize the specific glassmorphism panel style (`Panel / Regular`, `Panel / Semi`, or `Panel / Translucent`) corresponding to the contextual layering of the interface container. 
  - *Regular Panel CSS Properties:* `background: #F5F5F5; border: 1px solid #D9DADB; border-radius: 24px; padding: 20px;`
  - *Semi Panel CSS Properties:* `background: rgba(245, 245, 245, 0.75); backdrop-filter: blur(224px); border: 1px solid #F5F5F5; border-radius: 24px; padding: 20px;`
  - *Translucent Panel CSS Properties:* `background: rgba(245, 245, 245, 0.1); backdrop-filter: blur(224px); border: 1px solid #F5F5F5; border-radius: 24px; padding: 16px;`
- **Do** map tailwind styles to these exact round corners (`rounded-[20px]`, `rounded-[24px]`, etc.) to match the circular visual style in Figma.
- **Do** use `Libre Franklin` font tags only for headers, never for continuous paragraph copy.
- **Do** use official Tailwind **Heroicons** ([github.com/tailwindlabs/heroicons](https://github.com/tailwindlabs/heroicons) or [heroicons.com](https://heroicons.com)) for all UI iconography (like chevron guides, adjust buttons, rocket launches, or presentation sliders) to perfectly mirror the compiled vector layers in Figma.
- **Don't** mix purple or custom gray shades - always map back to `gray-25` (`#EBEBEB`), `gray-50` (`#D9DADB`), and `black` (`#31373D`).
- **Don't** rebuild or invent custom SVG silhouettes for icons when a standard Heroicon match is available.
