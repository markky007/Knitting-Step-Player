---
version: alpha
name: Harvey
description: Harvey's identity is confident, editorial and restrained — a near-black warm ink on crisp white, paired with an expressive serif for display and a clean neutral sans for everything else. The system leans on generous whitespace, hairline neutral borders and subtle warm-gray tiers, with a bright electric-yellow used only as a sparing accent surface. Dark footer surfaces anchor the page, and interactions stay quiet and typographic rather than colorful.
colors:
  primary: "#0F0E0D"
  ink: "#0F0E0D"
  on-dark: "#FFFFFF"
  surface: "#FFFFFF"
  surface-muted: "#F2F1F0"
  surface-warm: "#DBD9D1"
  surface-dark: "#1F1D1A"
  surface-black: "#000000"
  muted: "#706D66"
  muted-light: "#8F8B85"
  muted-lighter: "#ADABA5"
  ink-soft: "#33312C"
  border: "#CCCAC6"
  border-light: "#E5E5E3"
  accent: "#F6F202"
typography:
  hero-display:
    fontFamily: HarveySerifFont
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.9px
  display-serif:
    fontFamily: HarveySerifFont
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.32px
  title-serif:
    fontFamily: HarveySerifFont
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.24px
  title-lg:
    fontFamily: HarveySansFont
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.32px
  title-md:
    fontFamily: HarveySansFont
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.24px
  title-sm:
    fontFamily: HarveySansFont
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: normal
  body-lg:
    fontFamily: HarveySansFont
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: normal
  body:
    fontFamily: HarveySansFont
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: normal
  body-tight:
    fontFamily: HarveySansFont
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: normal
  body-strong:
    fontFamily: HarveySansFont
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: normal
  label:
    fontFamily: HarveySansFont
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: normal
  caption:
    fontFamily: HarveySansFont
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: normal
  button:
    fontFamily: HarveySansFont
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: normal
  nav-link:
    fontFamily: HarveySansFont
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: normal
rounded:
  sm: 3px
  md: 4px
  lg: 6px
  xl: 8px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px
  gutter: 40px
  section: 64px
  section-lg: 128px
components:
  navbar:
    backgroundColor: rgba(0, 0, 0, 0)
    textColor: "{colors.ink}"
    height: 106px
    borderColor: "{colors.ink}"
    borderWidth: 0px
    position: fixed
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
  footer:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-dark}"
    height: 665px
    columns: "5"
    borderColor: "{colors.on-dark}"
    borderWidth: 0px
  footer-link:
    textColor: "{colors.on-dark}"
    typography: "{typography.label}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.xl}"
    padding: 12px 20px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.xl}"
    padding: 12px 20px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.md}"
    typography: "{typography.body}"
    padding: 12px 16px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.xl}"
    boxShadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px
    padding: 32px
  card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xl}"
    padding: 32px
  chip:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  blockquote:
    textColor: "{colors.ink}"
    typography: "{typography.display-serif}"
  divider:
    borderColor: "{colors.border}"
    borderWidth: 1px
---

# Harvey

## Overview

Harvey's identity is confident, editorial and restrained — the visual language of a modern law firm rather than a typical SaaS startup. The system pairs a warm near-black ink (**Ink**, `{colors.ink}` — #0F0E0D) with crisp white paper (`{colors.surface}` — #FFFFFF), then lets an expressive serif carry all the gravitas at display sizes while a clean neutral sans handles everything functional. Hierarchy is made through type contrast and generous whitespace, not color: the serif headline versus sans body is the primary signal, reinforced by warm-gray tiers and hairline borders.

Density is deliberately low. Sections breathe with 64–128px vertical rhythm (`{spacing.section}`, `{spacing.section-lg}`), content sits in a centered constrained column, and near-black product screenshots and dark footer surfaces anchor the page against the white field. Color is used almost monochromatically — a single bright electric-yellow (`{colors.accent}` — #F6F202) appears only as a sparing accent surface, never as text or interactive fill.

Interactions stay quiet and typographic. Buttons are ink-on-white or white-on-ink, borders are neutral hairlines, and elevation comes from tonal contrast (dark panel on cream) rather than layered shadow.

**Key Characteristics:**
- Two-typeface split: an expressive serif (`{typography.hero-display}`) for display, a neutral sans for all UI and body
- Warm near-black ink (`{colors.ink}`) on crisp white (`{colors.surface}`) as the core contrast
- Only two font weights in play — 400 and 500; heavier cuts are deliberately absent
- Generous whitespace with a 64/128px section rhythm
- Electric-yellow (`{colors.accent}`) reserved strictly as a rare accent surface
- Depth from tonal contrast and dark surfaces, not shadow
- Hairline neutral borders (`{colors.border}`, 1px) instead of heavy dividers or cards
- Small, restrained corner radii (3–8px) with pills reserved for chips

## Colors

The palette is essentially monochrome — warm grays climbing from near-black to white — with a single high-voltage yellow held in reserve. There are no gradients anywhere in the system; every surface is a flat tone.

### Brand & Ink
- **Ink** (`{colors.ink}` / `{colors.primary}` — #0F0E0D): the warm near-black used for nearly all text, primary buttons, and the footer field. This is the dominant color of the system, appearing on all 8 pages as the primary text role.
- **Ink Soft** (`{colors.ink-soft}` — #33312C): a slightly lifted warm charcoal for secondary text and subtle surfaces; also the text color inside chips.

### Surfaces
- **Paper White** (`{colors.surface}` — #FFFFFF): the base page and card background.
- **Muted Gray** (`{colors.surface-muted}` — #F2F1F0): quiet fills for chips and section blocks.
- **Warm Gray** (`{colors.surface-warm}` — #DBD9D1): a warmer tonal tier for banners and blocks; used sparingly.
- **Surface Dark** (`{colors.surface-dark}` — #1F1D1A): the near-black panel for dark cards and product screenshots.
- **True Black** (`{colors.surface-black}` — #000000): deepest anchor, used behind textured banners.

### Text & Neutrals
- **Muted** (`{colors.muted}` — #706D66): secondary body copy and captions.
- **Muted Light** (`{colors.muted-light}` — #8F8B85): tertiary text, metadata.
- **Muted Lighter** (`{colors.muted-lighter}` — #ADABA5): faintest text, used rarely.
- **On Dark** (`{colors.on-dark}` — #FFFFFF): text and links on dark footer and dark cards.

### Hairlines & Borders
- **Border** (`{colors.border}` — #CCCAC6): the default 1px hairline on cards, inputs, and dividers — the workhorse border, seen on 7 of 8 pages.
- **Border Light** (`{colors.border-light}` — #E5E5E3): an even fainter rule for the quietest separations.

### Accent
- **Electric Yellow** (`{colors.accent}` — #F6F202): a bright, almost fluorescent yellow used ONLY as an accent surface (never text, never a border). It appears on all 8 pages but at tiny weight — a single deliberate pop against the monochrome field.

### Theming
There is no separate dark-mode token block. Instead, dark is handled compositionally: the footer (`{colors.primary}`) and dark cards (`{colors.surface-dark}`) invert to white text (`{colors.on-dark}`) inline. Treat dark surfaces as intentional anchors within a light page, not a global theme toggle.

## Typography

Type is the heart of this system: an editorial serif for display moments and a neutral sans for everything else.

### Font Family
- **HarveySerifFont** — the expressive display serif. Used only for hero headlines, section display titles, and blockquotes; always weight 400. It carries the brand's law-firm gravitas.
- **HarveySansFont** — the clean neutral sans that handles all UI, body, labels, navigation, and buttons. Weights 400 and 500 only.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 72px | 400 | 1.05 | -0.9px | Serif hero headline (h1) |
| `{typography.display-serif}` | 32px | 400 | 1.05 | -0.32px | Serif section display, blockquotes |
| `{typography.title-serif}` | 24px | 400 | 1.05 | -0.24px | Smaller serif titles (h3) |
| `{typography.title-lg}` | 32px | 500 | 1.1 | -0.32px | Sans large title |
| `{typography.title-md}` | 24px | 500 | 1.3 | -0.24px | Sans medium title/subhead |
| `{typography.title-sm}` | 20px | 500 | 1.3 | normal | Sans small title |
| `{typography.body-lg}` | 20px | 400 | 1.6 | normal | Lead paragraph copy |
| `{typography.body}` | 16px | 400 | 1.5 | normal | Default body, nav links |
| `{typography.body-tight}` | 16px | 400 | 1.3 | normal | Compact body |
| `{typography.body-strong}` | 16px | 500 | 1.3 | normal | Emphasized body |
| `{typography.label}` | 14px | 500 | 1.3 | normal | Labels, footer links, chips |
| `{typography.caption}` | 14px | 400 | 1.3 | normal | Captions, metadata |
| `{typography.button}` | 14px | 500 | 1.45 | normal | Button text |
| `{typography.nav-link}` | 16px | 400 | 1.5 | normal | Header nav links |

### Principles
Only two weights exist across the entire system: **400** (regular / all serif, all body) and **500** (medium — the heaviest cut, used for titles, labels, buttons). There is no 600/700 bold — emphasis comes from size and from switching to the serif, not from weight. Letter-spacing is negative and tightening as type grows larger (-0.9px at 72px down to normal at ≤20px), a classic display-tightening strategy. Line-height inverts with size: tight 1.05 for serif display, opening to 1.5–1.6 for readable body copy.

### Note on Font Substitutes
Both families are proprietary. For the serif, substitute a high-contrast editorial serif such as **Playfair Display** or **Newsreader** at weight 400, and keep the tight negative tracking. For the sans, use **Inter** or **Söhne**-like neutral grotesque; restrict to weights 400 and 500 to preserve the restrained, no-bold character.

## Layout

### Spacing System
The scale is 4px-based and steps: `{spacing.xs}` 4px, `{spacing.sm}` 8px, `{spacing.md}` 12px, `{spacing.lg}` 16px, `{spacing.xl}` 20px, `{spacing.2xl}` 24px, `{spacing.3xl}` 32px, `{spacing.gutter}` 40px, `{spacing.section}` 64px, `{spacing.section-lg}` 128px. The most-used values in evidence are 16px, 8px, and 32px — the everyday padding/gap rhythm — while 64px and 128px govern the space between marketing sections.

### Grid & Container
The layout is a wide single-column marketing flow with a centered, constrained content width and generous top/bottom whitespace. Within it: a clean logo wall runs a ~6-column grid with even gutters, and feature blocks use a symmetric two-column card grid (e.g. "For Law Firms" / "For In-House"). The gutter token (`{spacing.gutter}` — 40px) sets column spacing. Full-bleed screenshot banners break the constrained column for emphasis.

### Whitespace Philosophy
Whitespace is the primary compositional tool. Sections are separated by 64–128px of vertical air, headings sit well apart from their subheads and CTAs, and the constrained column keeps line lengths comfortable. The restraint is deliberate — emptiness signals confidence and lets the serif headlines and dark product shots land with impact.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Base | Flat white paper (`{colors.surface}`), no shadow | Page background, most sections |
| Hairline | 1px border (`{colors.border}`) | Cards, inputs, dividers — separation without lift |
| Tonal | Dark surface on cream (`{colors.surface-dark}`, `{colors.surface-black}`) | Product screenshots, dark cards, footer — depth by contrast |
| Shadow | Soft drop shadow (0 10px 15px -3px / 0 4px 6px -4px, both rgba(0,0,0,0.1)) | Framed product screenshot, cookie modal — the rare lifted element |

**Shadow philosophy.** Elevation comes from surface change, not shadows. The system is nearly flat: separation is achieved with hairline borders and, more powerfully, by dropping near-black panels onto the cream field. A single soft shadow (the only one in the tokens, on `{components.card}`) is reserved for genuinely floating elements like the framed hero screenshot and the cookie modal. Everywhere else, tonal contrast does the work.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 3px | Smallest rounding, subtle detail |
| `{rounded.md}` | 4px | Inputs (`{components.input}`) |
| `{rounded.lg}` | 6px | Occasional medium containers |
| `{rounded.xl}` | 8px | Buttons, cards — the dominant radius |
| `{rounded.full}` | 9999px | Pills — chips only |

The geometry is restrained and buttoned-up. Small radii dominate: 8px (`{rounded.xl}`) is the workhorse for buttons and cards, 4px for inputs. These soft-but-tight corners avoid any playful curvature. Full pill rounding (`{rounded.full}`) is used deliberately and only for chips (`{components.chip}`) — labels and tags. Image frames, logo grids, and banners stay sharp-edged rectangles, creating a purposeful tension between softly-rounded UI controls and crisp editorial imagery.

## Components

### Navigation
**`navbar`** — A fixed header (`{components.navbar.position}`) 106px tall with a transparent background (`rgba(0,0,0,0)`) — it floats over the page with no backdrop blur and no border (`{components.navbar.borderWidth}` — 0px). Nav links use `{typography.nav-link}` (16px/400) in Ink (`{colors.ink}`). The header carries a CTA button (`hasCtaButton: true`). On mobile the nav collapses into a hamburger icon.

**`nav-link`** — Ink-colored (`{colors.ink}`), 16px regular; quiet and typographic, relying on the serif/sans system rather than color for emphasis.

### Buttons
**`button-primary`** — Ink fill (`{colors.primary}`) with white text (`{colors.on-dark}`), `{typography.button}` (14px/500), 8px radius (`{rounded.xl}`), padding 12px 20px. The default high-emphasis action.

**`button-secondary`** — White surface (`{colors.surface}`) with Ink text, 1px border (`{colors.border}`), same 8px radius and 12px 20px padding. The quiet alternate.

### Cards & Containers
**`card`** — White surface, Ink text, 1px hairline border (`{colors.border}`), 8px radius (`{rounded.xl}`), 32px padding. Carries the system's single soft shadow (0 10px 15px -3px / 0 4px 6px -4px at 10% black) for lifted moments.

**`card-dark`** — Near-black surface (`{colors.surface-dark}`) with white text, 8px radius, 32px padding, no border — used for the dark product/feature blocks.

### Inputs & Forms
**`input`** — White surface, Ink text, 1px border (`{colors.border}`), 4px radius (`{rounded.md}`), `{typography.body}` (16px), padding 12px 16px. Tighter radius than buttons, keeping form fields crisp.

### Badges & Chips
**`chip`** — Muted-gray fill (`{colors.surface-muted}`), Ink-soft text (`{colors.ink-soft}`), `{typography.label}` (14px/500), full pill radius (`{rounded.full}`), padding 4px 12px. The only pill-shaped element in the system.

### Misc
**`link`** — Ink text (`{colors.ink}`), `{typography.body}`; inline and quiet.

**`blockquote`** — Rendered in the display serif (`{typography.display-serif}`, 32px/400) in Ink — editorial pull-quotes.

**`divider`** — 1px hairline in `{colors.border}`.

### Footer
**`footer`** — A tall (665px) static footer on the Ink field (`{colors.primary}`) with white text (`{colors.on-dark}`), organized in 5 columns and no border. Footer links use `{typography.label}` (14px/500) in near-white (#FAFAF9), with ~35 links across the columns. No CTA button in the footer. It anchors the page as the dark counterweight to the cream body.

## Do's and Don'ts

### Do
- Keep the two-typeface split — HarveySerifFont for display/blockquotes, HarveySansFont for everything else; never add a third family.
- Use only weights 400 and 500 (`{typography.body}`, `{typography.label}`); emphasis comes from size and the serif, not heavier cuts.
- Reach for the serif (`{typography.hero-display}`, `{typography.display-serif}`) for headlines and quotes to carry gravitas.
- Create depth with tonal contrast — drop `{colors.surface-dark}` panels onto white — rather than shadows.
- Separate content with 1px hairlines (`{colors.border}`) and generous 64–128px section spacing (`{spacing.section}`, `{spacing.section-lg}`).
- Keep the electric yellow (`{colors.accent}`) as a rare accent surface only.
- Use 8px radius (`{rounded.xl}`) for buttons and cards, 4px (`{rounded.md}`) for inputs, and reserve pills (`{rounded.full}`) for chips.

### Don't
- Don't use `{colors.accent}` for text, borders, or interactive fills — it is an accent surface exclusively.
- Don't add bold weights (600/700) — the system tops out at 500.
- Don't set the serif at body sizes or the sans at hero sizes; each family has a defined lane.
- Don't stack heavy shadows — the single soft `{components.card}` shadow is the ceiling; prefer flat and hairline.
- Don't introduce saturated brand colors; the palette is warm-neutral monochrome.
- Don't round UI controls into pills beyond chips, or leave image frames rounded — keep frames sharp.
- Don't crowd sections; the whitespace rhythm is part of the brand.

## Responsive Behavior

This is a two-viewport analysis (desktop and mobile screenshots only); no intermediate breakpoint pixel values were captured, so specific breakpoints are unknown.

What the evidence shows: on desktop, content sits in a centered constrained column with multi-column structures — a ~6-column logo wall and a symmetric two-column card grid (Law Firms / In-House). On mobile, everything stacks into a single narrow column preserving the same vertical rhythm, cards go full-width, and the header nav condenses to a hamburger icon. The fixed 106px header (`{components.navbar}`) and 5-column footer (`{components.footer}`) both reflow — the footer columns stack on narrow screens.

Touch targets are supported by the button padding of 12px 20px (`{components.button-primary}`) and input padding of 12px 16px (`{components.input}`), giving comfortably tappable heights. Because only two viewports were captured, mid-range behavior is inferred and this section is scored low.

## Iteration Guide

1. **Reference tokens, never hex.** Edit colors via `{colors.*}` and type via `{typography.*}` so the monochrome-plus-accent system stays coherent.
2. **New buttons inherit from `{components.button-primary}` / `{components.button-secondary}`** — keep 8px radius (`{rounded.xl}`) and 12px 20px padding; don't invent new button shapes.
3. **Keep the weight ceiling at 500.** If a new style needs emphasis, scale up size or switch to HarveySerifFont — never add a bolder cut.
4. **Dark surfaces are compositional, not a theme.** Add dark blocks by using `{colors.surface-dark}` / `{colors.primary}` with `{colors.on-dark}` text inline, following the footer and dark-card pattern.
5. **The accent (`{colors.accent}`) is an unbreakable boundary** — it may only ever be a small surface, never text/border/interactive.
6. **Elevation stays flat.** Prefer hairline `{colors.border}` and tonal contrast; the single `{components.card}` shadow is the only permitted shadow.
7. **Respect the section rhythm** — new sections use `{spacing.section}` (64px) or `{spacing.section-lg}` (128px) vertical spacing to keep the airy cadence.

## Known Gaps

- **Hover, focus, and active states** were not captured — button, link, and input interaction states are inferred from static styling only.
- **Animation and transitions** (banner reveals, nav behavior on scroll) are not represented in the evidence.
- **Exact breakpoint values** are unknown — only desktop and mobile viewports were captured, so mid-range reflow is inferred.
- **Header CTA styling** is confirmed present (`hasCtaButton: true`) but its exact variant (primary vs secondary) wasn't isolated.
- **The transparent navbar** may gain a background/blur on scroll; the captured state shows `rgba(0,0,0,0)` with no backdrop filter, which may only be the top-of-page state.
- **Accent-yellow usage context** is limited — it registers on all pages but at very low weight, so its precise placement is not fully documented.
- **Auth-walled product surfaces** (the actual Harvey app dashboards shown in screenshots) were not directly inspected; dark-panel styling is inferred from marketing shots.
- No token values were dropped during grounding, so the token set reflects the measured evidence completely.
