# Knitting Step Player — Implementation Spec

Oct 4, 2026 · @MexZ

Version 0.2 · Audience: AI coding and planning agents · Supersedes the Thai draft v0.1

## 0. How agents must use this document

- This document is the single source of truth for scope and behavior. Reference requirement IDs (e.g. F-PLY-3) in plans, commits and tests.
- MUST / SHOULD / MAY follow RFC 2119 meaning.
- Visual design is NOT defined here. The owner supplies `DESIGN.md` at the repo root. Before any UI work, read it and derive design tokens from it. If it is missing, stop UI work and ask. Never invent colors, fonts, spacing or radii.
- When asked for an implementation plan, output: milestones, tasks (each with files touched, requirement IDs, tests, definition of done), dependency order, and a list of ambiguities. If an ambiguity changes architecture, ask instead of guessing.
- Do not implement anything marked Phase 2+ or Out of scope.

## 1. Product summary

A web app (Quasar PWA) that 'plays' a knitting or crochet pattern step by step, like LEGO build instructions. The user imports a pattern, the app splits it into steps, and the user taps Next/Back. A 3D model in the center of the screen shows the work as it stands after the current step, with the stitches belonging to the current step highlighted.

Primary context of use: a phone or tablet propped up next to the user while their hands are busy. Therefore: large tap targets, screen stays awake, fully usable offline.

| Term | Meaning |
| --- | --- |
| Part | An independently worked piece (head, body, arm) |
| Step | One instruction unit: a round or a row |
| Rnd / Row | Round (worked in the round) / row (worked flat) |
| sc, inc, dec | Single crochet; increase (1 stitch becomes 2); decrease (2 stitches become 1) |
| Magic ring | Adjustable loop used to start a round-worked piece |
| Stitch count | Number of stitches in the working round/row after completing a step |

## 2. Scope

**In scope (MVP = Phase 1):** native JSON pattern import; step player with repeat counter; procedural 3D model for round and flat parts; pattern library; materials page; progress persistence; PWA/offline; i18n (th, en).

**Out of scope for MVP:** backend, auth, sync; free-text pattern parsing (Phase 2, but specified in section 7 so the domain model supports it); AI import from PDF/images (Phase 4); sharing and public library (Phase 3); pattern authoring UI; cable, lace and colorwork geometry; yarn physics; AR.

## 3. Decisions

| ID | Decision | Rationale |
| --- | --- | --- |
| D-1 | Schema supports `knit` and `crochet`. MVP renders round parts (spiral or joined) and flat parts. | Stitch counts map directly to geometry |
| D-2 | No backend in MVP. Local-first with IndexedDB. Supabase is added in Phase 3 behind repository interfaces. | Nothing in MVP needs a server |
| D-3 | three.js used directly inside a Vue composable. No TresJS. | Fewer abstractions, better control of instancing and disposal |
| D-4 | Quasar v2 + Vite, Vue 3 `<script setup lang="ts">`, Pinia, TypeScript `strict`. | Owner's standard stack |
| D-5 | Dexie for IndexedDB. zod for runtime schema validation. | Typed, small, well supported |
| D-6 | Vitest for unit/component tests, Playwright for e2e. | Vite-native |
| D-7 | vue-i18n, locales `th` (default) and `en`. No hard-coded user-facing strings. | Owner is Thai-speaking |
| D-8 | Units are 'stitch units': 1 unit = one stitch width. Gauge only changes the height ratio. | Keeps geometry independent of physical size |
| D-9 | Package manager: pnpm unless the repo already uses another. | Convention |

## 4. Allowed dependencies

`quasar`, `@quasar/extras`, `vue`, `vue-router`, `pinia`, `vue-i18n`, `three`, `zod`, `dexie`, Quasar PWA mode (workbox), `vitest`, `@vue/test-utils`, `@playwright/test`, ESLint/Prettier. Any other dependency requires a written justification in the plan. Do not add `@supabase/supabase-js` before Phase 3.

## 5. Architecture

Layering rule: `domain`, `parser` and `geometry` are pure TypeScript and MUST NOT import from `vue`, `quasar` or `three`. Only `scene` imports `three`. Only `components`/`pages` import `quasar`.

```
src/
  domain/        types.ts, schema.ts (zod), analyze.ts (derived counts + validation)
  parser/        Phase 2: tokenizer.ts, grammar.ts, abbreviations.ts, parsePattern.ts
  geometry/      roundBuilder.ts, flatBuilder.ts, assembly.ts, types.ts (StitchLayout)
  scene/         useStitchScene.ts, stitchGeometry.ts, highlight.ts, cameraRig.ts
  stores/        pattern.store.ts, player.store.ts, settings.store.ts
  repositories/  PatternRepository.ts, ProgressRepository.ts, dexie/*, (supabase/* in Phase 3)
  components/    PlayerViewport, StepCard, StepList, RepeatCounter, ImportDialog, MaterialsPanel
  pages/         LibraryPage, ImportPage, PatternPage, PlayPage, SettingsPage
  css/           tokens.scss  (generated from DESIGN.md, see F-UI-1)
  i18n/          th.ts, en.ts
tests/           unit/, e2e/, fixtures/
```

Data flow: `Pattern` (domain) → `analyze()` → `buildLayout()` (geometry, returns typed arrays) → `useStitchScene` (uploads to InstancedMesh) ← `player.store` (step/iteration state).

## 6. Domain model

```ts
type OpCode =
  | 'sc' | 'hdc' | 'dc' | 'ch' | 'sl_st'              // crochet
  | 'co' | 'k' | 'p' | 'k2tog' | 'ssk' | 'kfb' | 'bo' // knit
  | 'inc' | 'dec';                                    // shared

interface Op { kind: 'op'; code: OpCode; n: number }              // n >= 1
interface Group { kind: 'group'; repeat: number; items: StepItem[] } // repeat >= 1
type StepItem = Op | Group;

interface Yarn { id: string; name: string; colorHex: string; weight?: string }
interface Step {
  id: string; label: string;      // 'Rnd 3', 'Row 12'
  raw: string;                    // original instruction text
  items: StepItem[];
  expectedCount?: number;         // number in parentheses in the source text
  yarnId?: string;                // switch to this yarn from this step on
  note?: string;
  view?: { camera?: [number, number, number]; focus?: 'new' | 'all' };
  modelRef?: string;              // Phase 2: GLB for this step
}
interface Part {
  id: string; name: string; kind: 'round' | 'flat';
  start: { kind: 'magic_ring' | 'chain' | 'cast_on'; count?: number };
  stuffed?: boolean; steps: Step[];
}
interface PartPlacement { partId: string; position: [number, number, number]; rotation: [number, number, number] }
interface Pattern {
  schemaVersion: 1; id: string; title: string; craft: 'knit' | 'crochet';
  gauge?: { stitchWidthMm: number; stitchHeightMm: number };
  materials: { yarns: Yarn[]; tools: string[]; notes?: string };
  parts: Part[]; assembly?: PartPlacement[];
}
```

**Derived data** (computed by `domain/analyze.ts`, never persisted): per step `stitchesBefore`, `stitchesAfter`, and the list of repeat iterations.

| Op | Consumes | Produces |
| --- | --- | --- |
| sc, hdc, dc, k, p | 1 | 1 |
| inc, kfb | 1 | 2 |
| dec, k2tog, ssk | 2 | 1 |
| ch, co | 0 | 1 |
| sl\_st, bo | 1 | 0 |

Each op is multiplied by `n`; a group is multiplied by `repeat`. `stitchesAfter` = sum of produced. For the first step of a part with `start.kind = 'magic_ring'` (foundation round), all ops consume 0 and `stitchesBefore` = 0. For `chain`/`cast_on` starts, `stitchesBefore` = `start.count`. For all other steps, `stitchesBefore` = previous step's `stitchesAfter`.

**Validation** (returns issues, never throws): `CONSUMPTION_MISMATCH` (error) when total consumed ≠ `stitchesBefore` (except foundation round); `COUNT_MISMATCH` (warning) when `expectedCount` is set and ≠ `stitchesAfter`; `EMPTY_STEP` (error); `UNKNOWN_YARN` (error); duplicate ids (error).

## 7. Pattern import

- **F-IMP-1 (MVP)** The user can import a `.json` file (file picker and drag-and-drop) matching `Pattern`. Validate with zod, then `analyze()`. On failure show a list of issues with JSON path and message. Nothing is saved until the user confirms.
- **F-IMP-2 (MVP)** After a successful parse show a review screen: title, parts, steps with computed vs expected counts, warnings highlighted. The user confirms or cancels.
- **F-IMP-3 (Phase 2)** Free-text import using the grammar below. Parser returns `{ pattern, issues }` and MUST NOT throw. Unparseable lines become issues with line/column; the user can edit the text and re-parse on the review screen.
- **F-IMP-4 (Phase 4)** PDF/image import through a Supabase Edge Function. Output goes through the same review screen. API keys MUST NOT exist on the client.

**Text grammar (Phase 2, informative for now)**

```
line    := label ':' items [ '(' int ')' ]          // trailing (int) = expectedCount
label   := ( 'Rnd' | 'Round' | 'R' | 'Row' ) int [ '-' int ]   // ranges expand to one step per number
items   := item ( ',' item )*
item    := group | op
group   := '(' items ')' ( 'x' | '*' ) int
op      := code [ 'x' int ] | int code | code int      // 'sc', 'sc x6', '6 sc', 'sc6'
```

Case-insensitive. An alias table maps variants to `OpCode` (e.g. `2sc`/`inc` → `inc`, `sc2tog`/`dec` → `dec`). Part headers are lines starting with `#` or `Part:`.

| Input | Expected |
| --- | --- |
| `Rnd 1: 6 sc (6)` | 1 step, `sc` n=6, expectedCount 6 |
| `Rnd 2: inc x6 (12)` | `inc` n=6, 12 |
| `Rnd 3: (sc, inc) x6 (18)` | group repeat 6 of \[sc 1, inc 1\], 18 |
| `Rnd 4-6: sc x18 (18)` | 3 steps labelled Rnd 4, 5, 6 |

## 8. 3D model

- **F-3D-1 (MVP)** The viewport sits in the center of the play screen. Orbit/zoom with touch and mouse. A control resets the camera.
- **F-3D-2 (MVP)** Stitches from earlier steps are shown in their yarn color. Stitches of the current step (or current repeat iteration) are tinted toward the accent token. New stitches animate in sequentially (total ≤ 400 ms), disabled by the animation setting and by `prefers-reduced-motion`.
- **F-3D-3 (MVP)** Auto-focus: on step change the camera eases (300 ms) to frame the highlighted stitches. Manual orbiting pauses auto-focus until the next step change. User can disable it.
- **F-3D-4 (MVP)** After the last step of the last part, if there is more than one part, show an assembly view of all parts using `assembly` placements (default: spaced along X). With one part, show the finished piece.
- **F-3D-5 (Phase 2)** If a step has `modelRef`, load that GLB (lazy `GLTFLoader`) instead of the procedural model for that step.

**Layout algorithm (pure functions in `geometry/`)**

Constants: `w = 1` (stitch width), `h = gauge ? heightMm / widthMm : 0.9`, `depth = 0.8`. Each step renders exactly `stitchesAfter` stitch instances (the new round or row).

```
Round part, step i, N = stitchesAfter:
  r_i  = N * w / (2π)                    // ring radius
  dr   = r_i - r_(i-1)                   // r_(-1) = 0
  dy   = sqrt(max(h² - dr², 0))          // profile arc length per round is h
  y_i  = y_(i-1) + dy                    // y_(-1) = 0
  for k in 0..N-1:
    θ        = 2π * k / N + (i % 2) * π / N     // stagger alternate rounds
    position = (r_i cosθ, y_i, r_i sinθ)
    local X  = (-sinθ, 0, cosθ)                  // tangent
    local Y  = normalize(cosθ * dr, dy, sinθ * dr) // along the profile (up and outward)
    local Z  = X × Y
    scale    = (2π r_i / N, h, depth)

Flat part, step i, N = stitchesAfter:
  position = ((k + 0.5) * w - N * w / 2, i * h, 0); axes = identity; scale = (w, h, depth)
```

This makes a round that adds 6 stitches per round grow as a flat disc and one that adds fewer curve into a sphere, matching real amigurumi behavior. Output: `StitchLayout { matrices: Float32Array; stepOffsets: Uint32Array; stepIds: string[] }`, deterministic for a given pattern.

**Rendering rules (`scene/`)**

- One `InstancedMesh` per part, capacity = total stitches, instance order = step order then `k`. Visible stitches = `mesh.count = cum[stepIndex]` where `cum` is the prefix sum of `stitchesAfter`.
- Highlight range = `[cum[i-1], cum[i])`. When a repeat iteration `j` of `R` is active, highlight `[start + floor(j*N/R), start + floor((j+1)*N/R))` and visible count = `start + floor((j+1)*N/R)`.
- Base stitch geometry: one low-poly rounded shape (≤ 100 triangles) shared by all instances. `MeshStandardMaterial`, hemisphere + one directional light, no shadows on mobile.
- Render on demand (requestAnimationFrame only while animating or damping). Cap DPR at 2. Handle `webglcontextlost`. Dispose geometries, materials and renderer on unmount. Load `three` with dynamic `import()`.
- `MAX_STITCHES_PER_SCENE = 20000`. If exceeded, render only the current part and show a non-blocking warning.
- Read the accent and background colors from CSS variables at runtime and update on theme change. No colors hard-coded in `scene/`.

## 9. Step player

State (`player.store`): `{ patternId, partIndex, stepIndex, iteration: number | null, view: 'steps' | 'assembly' | 'complete' }`.

- **F-PLY-1** Show for the current step: label, instruction text, stitches after step, note, yarn change callout, and global progress (current of total).
- **F-PLY-2** `next()` / `prev()`: Next, ArrowRight, Space and swipe-left go forward. Back, ArrowLeft and swipe-right go back. At the first step Back is disabled. After the last step, Next goes to assembly (more than one part), then to a completion screen.
- **F-PLY-3 Repeat counter.** If a step has a top-level group with `repeat > 1` and the setting `countRepeats` is on (default on), entering the step sets `iteration = 0` and shows 'Repeat 1/R'. `next()` increments `iteration` until `R-1`, then moves to the next step. `prev()` decrements; at iteration 0 it moves to the previous step with `iteration` = its last (if it has a repeat group). Steps without such a group have `iteration = null`.
- **F-PLY-4** A step list drawer shows all parts and steps; selecting one jumps there. Completed, current and upcoming steps are visually distinct.
- **F-PLY-5** Persist progress on every change, debounced 300 ms, and flush on `visibilitychange: hidden`. Opening an unfinished pattern asks 'Continue from \<label>' or 'Start over'.
- **F-PLY-6** Request Screen Wake Lock while on the play page; re-acquire on `visibilitychange`; no-op if unsupported.
- **F-PLY-7** Yarn change and part change are surfaced as explicit callouts on the step where they occur.

## 10. Library and materials

- **F-LIB-1 (MVP)** Library lists saved patterns with search and a status chip (not started / in progress / done). Delete asks for confirmation. A bundled sample pattern is available on first run.
- **F-LIB-2 (MVP)** Materials page before starting: yarn swatches with names, tools, notes, and gauge when present.
- **F-LIB-3 (Phase 2)** Export a pattern to `.json` and re-import it (backup without a backend).

## 11. UI contract (design-agnostic)

- **F-UI-1** Convert `DESIGN.md` tokens into `src/css/tokens.scss` CSS variables (`--kp-*`) and Quasar brand colors. All components and the scene read these variables only. If `DESIGN.md` does not define a needed token, add it to a `TODO-tokens.md` and ask the owner.
- Routes: `/` Library, `/import`, `/pattern/:id` (materials), `/play/:id`, `/settings`.
- Play layout regions: top bar (title, part, progress, menu), central 3D viewport, step card, control bar (Back, Next). On `xs`/`sm` portrait the step card is a bottom sheet under the viewport; on `md+` landscape it is a side panel. The viewport stays centered in both.
- Required UI states: model loading, WebGL unsupported (show message and step list without 3D), empty library, import error, parse warning, first/last step, completion, offline, dark mode.
- Accessibility: WCAG 2.2 AA; tap targets ≥ 48 px; the highlight never relies on color alone (also outline or pulse); respect `prefers-reduced-motion`; all controls keyboard reachable with visible focus; the canvas has a text alternative that announces the step label and count.
- i18n: all strings via vue-i18n keys; `th` default, `en` fallback.

## 12. Persistence and future backend

```ts
interface PatternRepository { list(): Promise<PatternSummary[]>; get(id: string): Promise<Pattern | null>; save(p: Pattern): Promise<void>; remove(id: string): Promise<void> }
interface ProgressRepository { get(patternId: string): Promise<Progress | null>; save(p: Progress): Promise<void> }
interface Progress { patternId: string; partIndex: number; stepIndex: number; iteration: number | null; view: string; updatedAt: number }
```

Stores depend only on these interfaces. Dexie tables (MVP): `patterns` (id, title, updatedAt) and `progress` (patternId).

Phase 3 (informative): Supabase tables `patterns(id uuid, owner uuid default auth.uid(), data jsonb, updated_at)` and `progress(owner, pattern_id, state jsonb, updated_at)`, RLS on every table with `owner = auth.uid()`; Storage bucket for GLB files; last-write-wins by `updated_at`. Phase 4: Edge Function `import-pattern` calling an LLM, authenticated users only, rate limited.

## 13. Non-functional requirements

- **Performance:** ≥ 30 fps with 20,000 instances on a mid-range phone (about 4 GB RAM, 2021 class); step change updates the scene within 100 ms; initial JS excluding the `three` chunk ≤ 250 KB gzip; `three` loads lazily on first play or preview.
- **Offline:** service worker precaches the app shell and sample patterns; the whole play flow works with no network.
- **Browsers:** last 2 versions of Chrome, Edge, Firefox, Safari; iOS Safari 16+; WebGL2 required, graceful fallback otherwise.
- **Privacy:** imported patterns stay on the device in MVP. Sample patterns bundled with the app MUST be original works.

## 14. Delivery plan

| Milestone | Tasks | Definition of done |
| --- | --- | --- |
| M0 Scaffold | Quasar PWA project, TS strict, ESLint/Prettier, Vitest, Playwright, i18n, CI script, token pipeline from DESIGN.md | `build`, `lint`, `test` pass; tokens visible in a demo page |
| M1 Domain | Types, zod schema, `analyze()` with validation, 3 fixtures (ball, hat, flat swatch) | Unit tests cover every validation code and counting rule |
| M2 Geometry | `roundBuilder`, `flatBuilder`, `assembly`, prefix sums | Property tests: instance count = sum of `stitchesAfter`; `r_i` grows with N; flat 6-per-round growth yields dy ≈ 0; output deterministic |
| M3 Scene | `useStitchScene`, instancing, highlight, camera rig, dispose, context-loss | Fixture renders; step change moves `mesh.count` and highlight; no leaks after 50 mount/unmount cycles |
| M4 Player | Stores, StepCard, RepeatCounter, StepList, keyboard/swipe, wake lock, progress persistence | e2e: import fixture → Next through all steps → reload → resume works |
| M5 Import/Library | JSON import + review screen, Library, Materials, Settings | Invalid JSON shows precise issues; valid JSON saves and appears in Library |
| M6 Hardening | PWA offline, a11y pass, performance pass on a real phone, dark mode | NFRs in section 13 met and recorded in the PR |
| Phase 2 | Text parser + review editing, GLB per step, export/import, 20k+ LOD | Parser table tests from section 7 pass |

## 15. Test strategy

- **Unit:** analyze/validation, op counting table, geometry invariants, prefix sums and repeat-slice math, store transitions for `next()`/`prev()` including repeat boundaries and part/assembly boundaries.
- **Component:** StepCard, RepeatCounter, ImportDialog issue list.
- **e2e (Playwright, Chromium with SwiftShader for WebGL):** import → play → reload-resume; canvas is non-blank (read pixels); offline mode after first load; keyboard-only navigation.
- Fixtures live in `tests/fixtures/` and double as sample patterns.

## 16. Fixture (minimal valid pattern)

```json
{
  "schemaVersion": 1, "id": "sample-ball", "title": "Sample Ball", "craft": "crochet",
  "materials": { "yarns": [{ "id": "y1", "name": "Main", "colorHex": "#E07A5F" }], "tools": ["3.0 mm hook"] },
  "parts": [{
    "id": "body", "name": "Body", "kind": "round", "start": { "kind": "magic_ring" }, "stuffed": true,
    "steps": [
      { "id": "s1", "label": "Rnd 1", "raw": "6 sc in magic ring (6)", "yarnId": "y1", "expectedCount": 6,
        "items": [{ "kind": "op", "code": "sc", "n": 6 }] },
      { "id": "s2", "label": "Rnd 2", "raw": "inc x6 (12)", "expectedCount": 12,
        "items": [{ "kind": "op", "code": "inc", "n": 6 }] },
      { "id": "s3", "label": "Rnd 3", "raw": "(sc, inc) x6 (18)", "expectedCount": 18,
        "items": [{ "kind": "group", "repeat": 6, "items": [
          { "kind": "op", "code": "sc", "n": 1 }, { "kind": "op", "code": "inc", "n": 1 }] }] },
      { "id": "s4", "label": "Rnd 4", "raw": "sc x18 (18)", "expectedCount": 18,
        "items": [{ "kind": "op", "code": "sc", "n": 18 }] }
    ]
  }]
}
```

## 17. Guardrails for agents

- Do not simulate yarn physics. The model is an approximation (preview quality); label it as such in the UI.
- Do not add a backend, auth or network calls in MVP.
- Do not hard-code colors, fonts or spacing; use tokens from `DESIGN.md`.
- Keep `domain`, `parser`, `geometry` free of framework imports (section 5).
- Every new behavior needs a test tied to a requirement ID.
- Prefer small PRs per milestone task; do not mix refactors with features.

## 18. Assumptions to confirm with the owner

1. MVP targets crochet-style round and flat parts first (knit ops exist in the schema and validate, but no knit-specific stitch appearance in MVP).
2. Mobile-first, installable PWA; desktop is secondary.
3. Default locale is Thai with English fallback.
4. Default stitch proportion is `h = 0.9 w` when no gauge is given.
5. No pattern authoring UI; users only import existing patterns.
