# Design System Spec — CRM Login Screen (RTL / Arabic Site)

Design specification for a CRM login screen, adapted for a **right-to-left (RTL) Arabic interface** using a **Kufi Arabic font**. This document is written in English so any model can follow it precisely — but the actual site content, labels, and copy should be in Arabic.

---

## 1. Direction & Layout Mirroring

- Overall direction: `dir="rtl"`, all text `text-align: right`.
- The whole layout mirrors: the dark hero panel (originally left) moves to the **right side**, the light login/form panel (originally right) moves to the **left side**.
- Any directional icon (arrows, "continue" chevrons) must be flipped horizontally (`transform: scaleX(-1)` or swapped for a left-pointing icon), since "forward" in RTL points left.
- Numbers and stats (12K+, 98%, 99.9%) stay in standard LTR numerals embedded inside the RTL text — do not reverse digit order.
- Icons inside inputs, checkboxes next to labels, avatars next to quotes — all mirror their side (right↔left swapped from the original screenshot).

## 2. Typography

- **Font family:** a modern Arabic Kufi typeface — prefer `"Noto Kufi Arabic"`, `"Cairo"`, or `"IBM Plex Sans Arabic"` as fallback, then generic `sans-serif`.
- No extra letter-spacing — Kufi relies on clean, squared letterforms rather than spacing for legibility.
- Weight scale:
  - Hero H1 (large marketing headline): **Bold/800**, ~40–48px, `line-height: 1.15`
  - Section headings (e.g. "Welcome back"): **Bold/700**, ~28px
  - Body / descriptive text: **Regular/400**, medium gray, ~15px
  - Field labels: **Medium/600**, small (~11–12px), muted gray, sits directly above each input
  - Stat numbers: **Bold/800**, large (~26–30px)

## 3. Color Palette

| Use | Color |
|---|---|
| Dark hero panel background | near-black `#0B0B0C`–`#101012`, with a subtle radial amber glow (~8% opacity) in one corner |
| Form panel background | **off-white**, not pure white — e.g. `#F7F6F3` or `#FAF9F7` |
| Primary / accent color | warm orange `#E8862B`–`#F0902E`, used as a gradient on buttons (`linear-gradient(90deg, #E8862B, #F2A23D)`) |
| Cards inside the dark panel | near-transparent white overlay `rgba(255,255,255,0.04)`, no visible border, no shadow |
| Text on dark background | white `#FFFFFF` primary, light gray `#C9C9CC` secondary |
| Text on light background | near-black `#1A1A1A` primary, gray `#6B6B70` secondary |
| Input borders | very light gray `#E4E2DE` / `#EAEAE7`, single 1px line, **no shadow** |
| Input background | pure white `#FFFFFF` (contrasts gently against the off-white panel) |

## 4. Core Principle: "Light, Simple, No Heavy Visual Weight"

- **No strong shadows anywhere.** Where a shadow exists, it's barely visible (`box-shadow: 0 1px 2px rgba(0,0,0,0.04)`), used only for the faintest separation — never for depth or elevation drama.
- **Borders are simple** — a single thin line, light color, no gradients or double borders.
- Separation between elements relies on **subtle background tone shifts** (off-white vs. white, or 4% white overlay on dark) rather than heavy borders or shadows.
- Medium-to-large rounded corners (`border-radius: 12–20px`) across cards, inputs, and buttons.

## 5. Cards

### a. Small Stat Cards (inside the dark hero panel)
```
background: rgba(255,255,255,0.04)
border: none  /* or 1px solid rgba(255,255,255,0.06) if a touch more separation is needed */
border-radius: 16px
padding: 20px
box-shadow: none
```
Content: small orange icon at top → large bold white number → small gray label beneath. Three cards sit in a horizontal row; in RTL the row still reads right-to-left in logical order.

### b. Testimonial / Quote Card
```
background: rgba(255,255,255,0.04)
border-radius: 20px
padding: 24px
box-shadow: none
```
Content: circular avatar (single letter on orange background) placed on the **right** side of the quote in RTL, quote text in regular weight, name + title below in lighter gray.

### c. Login/Form "Card"
No separate card container needed — it's built directly on the off-white panel background; label + input pairs stack with no extra wrapping box.

## 6. Inputs

```
background: #FFFFFF
border: 1px solid #E7E5E1
border-radius: 12px
padding: 14px 16px
box-shadow: none
```
- Small gray icon inside the input sits on the **right** side in RTL (mirrored from the original's left-side icon).
- On `:focus`: border shifts to the primary orange `border-color: #E8862B` plus a faint halo `box-shadow: 0 0 0 3px rgba(232,134,43,0.12)` — this is the *only* shadow allowed, and it's purely for interaction feedback.
- Password field's show/hide "eye" icon sits on the **left** side inside the input in RTL.
- The label sits directly above the input, right-aligned.
- The "Forgot password?" link sits on the **left** end of the same row as the label (mirrored from the original), styled in the accent orange.

## 7. Buttons

### Primary CTA
```
background: linear-gradient(90deg, #F2A23D, #E8862B)
color: #FFFFFF
border: none
border-radius: 14px
padding: 16px 20px
font-weight: 700
box-shadow: 0 4px 14px rgba(232,134,43,0.25)  /* faint colored shadow under the button only — not a general pattern */
```
- The directional arrow inside the button sits at the far **left** of the button and points **left**, since forward motion in RTL points left (mirrored from the original's right-pointing arrow).
- Hover state: slightly stronger shadow or ~5% lighter gradient — no drastic change.

### Secondary Buttons (e.g. header "Buy now" style)
```
background: transparent or near-transparent white
border: 1px solid light gray
border-radius: 10px
padding: 8px 16px
box-shadow: none
```

## 8. Badges / Pills

```
background: rgba(255,255,255,0.06)  /* on dark background */
border-radius: 999px
padding: 6px 14px
font-size: 12px
color: #E8862B  /* or white text with a small orange dot */
```
Small orange dot before the label text — in RTL this visually lands on the right side of the text.

## 9. Checkbox

```
size: 18x18
border-radius: 4px
border: 1px solid #D8D6D1
checked-background: #E8862B
```
Sits on the **right** side of its associated label ("Keep me signed in") in RTL.

## 10. Tables — Same Design Language

Same "no shadow, simple border" principle:
```
table background: #FFFFFF
header row background: #F7F6F3 (matches the light panel background)
header text: dark gray, small bold, right-aligned
row border: 1px solid #EFEDE9 (bottom divider only, no vertical borders)
row hover: background rgba(232,134,43,0.04)
outer container border-radius: 16px
box-shadow: none
cell padding: 12px 16px
```
- Numeric columns (dates, amounts) stay LTR within the cell; the cell itself is right-aligned unless it's a purely numeric column, in which case left-aligning the number improves readability.
- Status badges inside table cells follow the same Pill style as Section 8.

## 11. Shadow Rules — Golden Rule Summary

Use shadow in **exactly 3 places**, always very light:
1. Input focus state (faint colored halo)
2. Primary button (faint colored shadow beneath, for a "clickable" cue)
3. True floating elements like dropdowns/modals (`0 8px 24px rgba(0,0,0,0.08)`)

Everything else (cards, regular inputs, tables, header) = **no shadow at all**. Rely only on background contrast and thin borders.

## 12. Cheat Sheet

| Element | Background | Border | Shadow | Radius |
|---|---|---|---|---|
| Hero panel | near-black + subtle glow | — | — | — |
| Form panel | off-white | — | — | — |
| Stat/Testimonial card | 4% white overlay (on dark) | none / very faint | none | 16–20px |
| Input | white | 1px light gray | none (except focus) | 12px |
| Primary button | orange gradient | none | faint colored | 14px |
| Badge/Pill | translucent light | none | none | 999px |
| Table | white | bottom divider only | none | 16px (container) |

## 13. Note on Language

- All copy, labels, and content on the site should be written in **Arabic**.
- The specification above (colors, spacing, borders, shadows) applies regardless of content language.
- Use a genuine Kufi Arabic web font (`Noto Kufi Arabic` / `Cairo`) — don't fall back to a Latin-only font stack for Arabic text.
