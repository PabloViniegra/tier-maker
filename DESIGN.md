---
version: alpha
name: tier-maker
description: Cursor-inspired developer-tool aesthetic built exclusively on Shadcn UI + Tailwind v4. Dark-first, dense, precise.
colors:
  primary: "#2E62D4"
  on-primary: "#FAFAFA"
  background: "#1A1A1A"
  surface: "#242424"
  overlay: "#2E2E2E"
  foreground: "#E6E6E6"
  muted: "#313131"
  muted-fg: "#9C9C9C"
  border: "#333333"
  destructive: "#DC4A2A"
  on-destructive: "#FAFAFA"
typography:
  h1:
    fontFamily: Cal Sans
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.2
  h2:
    fontFamily: Cal Sans
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
  h3:
    fontFamily: Cal Sans
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: Cal Sans
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.35
  body-md:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.4
  body-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: Geist Mono
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: 2px
  md: 3px
  lg: 6px
  xl: 8px
  2xl: 11px
  3xl: 13px
  4xl: 16px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 10px 10px
    height: 32px
  button-primary-hover:
    backgroundColor: "#2455BF"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 10px 10px
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 10px 10px
  button-outline-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-destructive:
    backgroundColor: transparent
    textColor: "{colors.destructive}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 6px 12px
    height: 32px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 16px
  popover:
    backgroundColor: "{colors.overlay}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 8px
  badge:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-fg}"
    rounded: "{rounded.sm}"
    padding: 2px 6px
  separator:
    backgroundColor: "{colors.border}"
---

## Overview

Cursor IDE translated to a web UI. The aesthetic is dark, dense, and
precise — a professional tool for people who live in their editor.
Surfaces are near-black with barely-visible borders. The single primary
color (electric blue) is reserved exclusively for action and focus.
Everything else is neutral.

The system is built exclusively on Shadcn UI primitives themed via CSS
custom properties. No third-party component libraries. All tokens live
in `globals.css` as OKLCH values; the hex values in this document are
sRGB approximations for agent consumption.

**Default mode:** dark. Light mode is supported via the theme toggle
(hotkey `D`) but is not the primary design target.

## Colors

The palette has one chromatic color — the electric blue primary — and a
neutral dark ramp for everything else.

### Dark mode (primary)

- **Primary (`#2E62D4`):** Electric blue. Used for primary buttons,
  focus rings, active states, sidebar highlights. The actual CSS value
  is `oklch(0.62 0.22 250)` (display-P3 gamut); `#2E62D4` is the
  closest sRGB approximation. Never use it decoratively.
- **On-primary (`#FAFAFA`):** White text on primary backgrounds.
- **Background (`#1A1A1A`):** The base canvas. Near-black, not pure black
  — preserves depth headroom below.
- **Surface (`#242424`):** Cards, panels, sidebars. Elevated one step
  above background.
- **Overlay (`#2E2E2E`):** Dropdowns, modals, popovers. One step above
  surface.
- **Foreground (`#E6E6E6`):** Primary text. Slightly off-white to avoid
  harsh contrast on near-black backgrounds.
- **Muted (`#313131`):** Secondary backgrounds — hover states, tags,
  secondary buttons. Also functions as a subtle lift on interactive
  elements.
- **Muted-fg (`#8A8A8A`):** De-emphasised text — metadata, captions,
  placeholder text.
- **Border (`#333333`):** Structural separation. In CSS this is
  `oklch(1 0 0 / 12%)` (12% white opacity on dark), which composites
  to approximately `#333` on the base background.
- **Destructive (`#DC4A2A`):** Errors, delete actions, danger states.
  Never use for anything neutral.

### Light mode

Light mode mirrors the structure but inverts the ramp. Background is
near-white (`#FAFAFA`), surfaces step down slightly. The primary and
destructive colors are identical in both modes. Borders use
`oklch(0 0 0 / 12%)` (12% black opacity).

## Typography

Two typefaces. No exceptions.

- **Cal Sans** — display headings (`h1`–`h6`). Purpose-built for
  headlines: geometric, confident, legible at large sizes. Loaded via
  `@fontsource/cal-sans`.
- **Geist** — all body copy, UI labels, inputs, buttons. Neutral,
  legible, optimized for dense interfaces. Loaded via `next/font/google`.
- **Geist Mono** — code, keyboard shortcuts, monospace contexts.

### Scale

| Token | Family | Size | Weight | Line-height |
|---|---|---|---|---|
| `h1` | Cal Sans | 2rem | 600 | 1.2 |
| `h2` | Cal Sans | 1.5rem | 600 | 1.25 |
| `h3` | Cal Sans | 1.25rem | 600 | 1.3 |
| `h4` | Cal Sans | 1.125rem | 600 | 1.35 |
| `body-md` | Geist | 0.8125rem (13px) | 400 | 1.4 |
| `body-sm` | Geist | 0.75rem (12px) | 400 | 1.4 |
| `label` | Geist | 0.75rem | 500 | 1.4 |
| `mono` | Geist Mono | 0.8125rem | 400 | 1.4 |

**Base font size is 13px** set on `body` (`font-size: 0.8125rem`). The
`html` element stays at 16px to preserve rem-based spacing calculations.
Line-height is 1.4 globally — tighter than standard web defaults, matching
the density of professional developer tools.

## Layout & Spacing

The spacing scale is built on an 8px base unit, matching Tailwind's
default 4px grid at the small end.

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Icon gaps, tight inline spacing |
| `sm` | 8px | Intra-component padding, small gaps |
| `md` | 16px | Standard component padding, section gaps |
| `lg` | 24px | Card padding, larger section gaps |
| `xl` | 32px | Page section spacing |
| `2xl` | 48px | Major layout zones |

Layouts are information-dense. Prefer `sm`/`md` over `lg`/`xl` for
component internals. Reserve large spacing for page-level structure.

## Elevation & Depth

Depth is expressed through surface color steps — not shadows.

| Level | Token | Color | Usage |
|---|---|---|---|
| Base | `background` | `#1A1A1A` | Page canvas |
| Raised | `surface` | `#242424` | Cards, panels, sidebar |
| Floating | `overlay` | `#2E2E2E` | Dropdowns, modals, tooltips |

**Shadows** are minimal. A single overlay shadow token exists for
floating elements: `0 8px 24px oklch(0 0 0 / 40%)` in dark mode,
`0 8px 24px oklch(0 0 0 / 15%)` in light mode. Use via the
`shadow-overlay` Tailwind utility class. Do not use multi-level shadow
scales — separation comes from color steps, not blur.

## Shapes

All interactive elements use `rounded.lg` (6px). This is slightly
rounded but reads as precise and technical rather than soft.

| Token | Value | Usage |
|---|---|---|
| `sm` | 2px | Tags, small badges |
| `md` | 3px | Inner elements, small chips |
| `lg` | 6px | **Default.** Buttons, inputs, cards, panels |
| `xl` | 8px | Large cards, modals |
| `2xl` | 11px | Decorative containers |

Never use `rounded-full` for UI controls. Pill-shaped buttons conflict
with the precise, technical aesthetic. Reserve full rounding for
avatars only.

## Components

### Button

All button variants use the same height (32px default) and font style
(`body-md`, Geist). Size variants: `xs` (24px), `sm` (28px), `default`
(32px), `lg` (36px).

- **Primary:** Accent background, white text. The only strongly colored
  button. Use for the single most important action on a page.
- **Ghost:** Transparent background, foreground text. Hover lifts to
  `muted` background. Use for secondary/tertiary actions.
- **Outline:** Like ghost but with a visible border. Use when the
  action needs more visual weight than ghost but shouldn't compete with
  primary.
- **Destructive:** Transparent with destructive-colored text. Hover
  adds a faint destructive tint. Never use a solid red button.

**Focus ring:** All buttons show a 2px solid primary ring on
`focus-visible`. No offset. The ring is the same electric blue as the
primary color.

**Hover:** Ghost and outline buttons lift to `muted` background
(+lightness step). Primary buttons drop to 80% primary opacity on hover. No
color-shift hover effects.

### Input

Height 32px, `body-md` font, `surface` background, `rounded.lg`. Border
is `border` token (12% opacity). Focus state: 2px solid primary ring,
border color switches to primary.

### Card

`surface` background, `rounded.lg`, `lg` padding. No default shadow —
use `shadow-overlay` only when the card needs to float above a
non-surface background.

### Popover / Dropdown

`overlay` background (one step above surface), `rounded.lg`, `sm`
padding, `shadow-overlay`. Thin `border` border.

### Badge / Tag

`muted` background, `muted-fg` text (`#9C9C9C`, 4.7:1 contrast),
`rounded.sm`, tight padding (2px 6px). For status indicators and
metadata labels only.

## Do's and Don'ts

**Do:**
- Use `primary` exclusively for primary actions and focus indicators.
- Use Cal Sans only for headings (`h1`–`h6`). Never for body copy.
- Default to `ghost` or `outline` buttons. Reserve `primary` for the
  main call-to-action.
- Express depth through surface color steps (`background` → `surface`
  → `overlay`).
- Use `shadow-overlay` only on floating elements (modals, dropdowns).
- Keep text at `foreground` or `muted-fg` — no other text colors except
  `destructive` for error states.

**Don't:**
- Don't use primary color for decorative or non-interactive elements.
- Don't introduce new typefaces. The system uses two: Cal Sans and Geist.
- Don't use `rounded-full` for buttons or inputs.
- Don't add shadow levels beyond `shadow-overlay`.
- Don't use solid-colored destructive buttons — always transparent
  background with destructive text.
- Don't use light mode as the design target — build for dark first,
  verify light second.
- Don't override Shadcn component structure — theme via CSS custom
  properties only.
