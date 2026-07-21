# Atlas Visual Design System Cheat Sheet

This reference tracks the CSS custom properties and visual anatomy tokens defined from the Figma SSOT.

Figma Source of Truth: [Atlas Visual SSOT](https://www.figma.com/design/bVRNvc1roScaoHUlBABt9T/Atlas-Visual-SSOT?m=dev) (fileKey = `bVRNvc1roScaoHUlBABt9T`)

---

## 1. Color Palette Tokens

```css
--atlas-primary: #237FE1;             /* Core blue primary action */
--atlas-primary-dark: #0563C7;        /* Hover / active states */
--atlas-primary-light: #ABD2FB;       /* Soft outline borders / secondary highlights */

--atlas-secondary: #EB9F0A;           /* High-contrast amber secondary / warning alert */
--atlas-secondary-dark: #BD7D00;      /* Secondary dark text / icon hover */
--atlas-secondary-light: #FFF0D2;     /* Secondary soft background highlights */

--atlas-complementary: #3C8500;       /* Green success margins / completion */
--atlas-complementary-dark: #2C6100;  /* Growth text alerts */
--atlas-complementary-light: #CFE1A8; /* Growth background indicators */

--atlas-destructive: #E1430A;         /* Risk red / guardrail violations */
--atlas-destructive-dark: #A1330B;    /* Fatal text warnings */
--atlas-destructive-light: #FFC0A9;   /* Risk background overlays */

--atlas-neutral-text: #31373D;        /* Warm slate primary text */
--atlas-neutral-muted: #707172;       /* Slate secondary text */
--atlas-neutral-border: #EBEBEB;      /* Soft structural line border */
--atlas-neutral-bg: #F5F5F5;          /* General background fill */
```

---

## 2. Typography Scale

Wrap your sections in the class `.atlas-surface` to automatically configure:

| Component class / Tag | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.atlas-page-heading` | Libre Franklin | `40px` | `400` | `44px` | `-0.8px` |
| `h1` / `.atlas-h1` | Libre Franklin | `28px` | `500` | `36px` | `-0.8px` |
| `h2` / `.atlas-h2` | Libre Franklin | `22px` | `28px` | `36px` | `-0.8px` |
| `h3` / `.atlas-h3` | Libre Franklin | `18px` | `24px` | `36px` | `-0.144px` |
| `h4` / `.atlas-h4` | Libre Franklin | `16px` | `20px` | `36px` | `-0.128px` |
| `h5` / `.atlas-h5` (Eyebrow) | Inter | `12px` | `700` | `22px` | `-0.12px` (Uppercase) |
| `.atlas-body-lg` | Inter | `16px` | `400` | `24px` | `-0.2px` |
| `p` / `.atlas-body-md` | Inter | `14px` | `400` | `22px` | `-0.056px` |
| `small` / `.atlas-body-sm` | Inter | `12px` | `400` | `20px` | `-0.1px` |

---

## 3. Shape & Corner Radii

- **Small Corner (`--atlas-radius-sm: 20px`)**: Action buttons, fields, badge pills.
- **Medium Corner (`--atlas-radius-md: 24px`)**: Main layout containers, cards, modals.
- **Large Corner (`--atlas-radius-lg: 28px`)**: Whole dashboard wrappers or panels above 600px width.

---

## 4. Spacing Scale

- `xs`: `4px`
- `sm`: `8px`
- `md`: `16px`
- `lg`: `24px`
- `xl`: `32px`
- `xxl`: `48px`

---

## 5. Layout Panels & Glassmorphism

Three predefined container primitives are defined for UI layouts:

1. **Regular Panel (`.atlas-panel`)**:
   Structured lists, tables, actions. Uses opaque `#F5F5F5` background, `#D9DADB` border, 24px radius, 20px padding.
2. **Semi-Translucent Panel (`.atlas-panel-semi`)**:
   Hover overlays, settings screens, flyouts. Uses `rgba(245,245,245,0.75)` with `224px` backdrop-blur, white border, 24px radius, 20px padding.
3. **Translucent Panel (`.atlas-panel-translucent`)**:
   Dynamic widgets, strategy workspaces overlaying backgrounds. Uses `rgba(245,245,245,0.1)` with `224px` backdrop-blur, white border, 24px radius, 16px padding.
