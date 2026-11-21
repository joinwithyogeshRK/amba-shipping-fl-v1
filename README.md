# AMBA Shipping & Logistics — website

A rebuild of ambashipping.com. React 19 + TypeScript on Vite, with a
scroll-driven WebGL hero.

Read **CONTENT-AUDIT.md** first: it records what on the old site was verified,
what contradicts itself, and what still needs the client's confirmation.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## Stack and why

| Package | Role |
|---|---|
| `three` + `@react-three/fiber` | the hero scene |
| `@react-three/drei` | helper layer for R3F |
| `gsap` + ScrollTrigger | the single scroll system |
| `lenis` | smooth scrolling, driven by GSAP's ticker |
| `react-router-dom` | routing and legacy URL redirects |

**One animation system, one RAF loop.** Lenis' `autoRaf` defaults to `false`, so
it is driven from `gsap.ticker` exactly as Lenis documents. There is no second
`requestAnimationFrame` loop anywhere, and Drei's `ScrollControls` is not used —
it would compete with page-level GSAP scrolling.

**Scroll never re-renders React.** GSAP writes normalised progress into
`src/lib/scrollState.ts`, a plain mutable object; the R3F render loop reads it
inside `useFrame` and animates Three.js objects directly.

## The scene

`src/three/HeroScene.tsx` holds the camera storyboard — a table of keyframes
mapping scroll progress to camera position, look-at target and pan. Edit that
table to change the choreography; nothing else needs touching.

- **Ocean** (`Ocean.tsx`) — four summed sine waves in a vertex shader with
  analytic normals. One draw call, no render targets, no reflections.
- **Vessel** (`Vessel.tsx`) — built from primitives, **a deliberate placeholder**.
  It is captioned as such in the hero. See *Replacing the vessel* below.

### Performance

- The scene is `React.lazy`, so Three.js (≈245 kB gzipped) never blocks first
  paint. The hero copy and calls to action render immediately.
- The canvas is `position: fixed`, so it takes no part in layout and cannot
  cause a shift when it mounts.
- `frameloop` switches to `demand` once the scene scrolls out of view — the
  render loop genuinely stops rather than rendering invisible frames.
- Device pixel ratio is capped (1.75, or 1.25 on low-power devices) and the
  ocean drops from 128² to 64² segments there.
- No shadow maps and no post-processing.

### Fallbacks

- **No WebGL** → a static sea composition (`StaticSea`). Append **`?nowebgl`**
  to any URL to force this path and check it on a machine that has WebGL.
- **Context lost** mid-session → permanently falls back to the same treatment.
- **`prefers-reduced-motion`** → Lenis never starts (native scrolling is left
  alone), the camera holds its opening composition, the ocean and vessel freeze,
  the sticky fleet sequence is disabled, and all reveals resolve to visible.

## Layout notes

The fleet section holds still for one extra viewport using CSS
`position: sticky` — **not** a GSAP pin. A pin injects a spacer element and
rewrites the document height, which made every scroll position below it jump by
over a thousand pixels on window resize. Sticky is free, resize-safe, and
collapses to normal flow with a media query.

Sections over the canvas carry their own scrim, with feathered top and bottom
edges so consecutive scrims read as one continuous treatment rather than as
stripes across the water.

## Still to configure

### The enquiry form

The form always works and never drops a message, in one of two modes:

- **No backend configured (current).** Submitting composes the enquiry into the
  visitor's own mail client, addressed to `operation@ambashipping.com`. The form
  says so in one line beneath the button.
- **Backend configured.** It POSTs `multipart/form-data` directly and handles
  the success and failure states.

To switch to the second mode, set an endpoint:

```bash
# .env.local
VITE_ENQUIRY_ENDPOINT="https://..."
```

Fields sent are `name`, `email`, `subject` and `message`.

Either way, what it never does is the thing the old site did: render a form
that posts to `#` and silently discards every enquiry sent through it.

### Replacing the vessel

Supply a licensed, draco-compressed `.glb` and swap it into `Vessel.tsx`.
Two constraints:

1. It must be licensed for commercial use, with the source recorded.
2. It must not imply ASLPL operates a vessel type it does not. The current
   placeholder is a generic offshore-support arrangement, the type most numerous
   in the managed fleet.

### Deployment

`public/.htaccess` is written for Hostinger's Apache-compatible hosting and
handles three things:

1. **Forces HTTPS** — the current site is plain HTTP and flagged "Not Secure".
2. **301s the dead legacy URLs** (`Default.aspx`, `About.aspx`, `Services.aspx`,
   `contact.aspx`, `Gallery.html`, `sitemap.aspx`, `Portfolio.aspx`). They all
   404 today, so any inbound link or bookmark currently lands on an error.
3. **SPA fallback** so client-side routes resolve on refresh.

The same redirects exist client-side in `App.tsx` as a backstop.

Update the domain in `public/sitemap.xml`, `public/robots.txt` and the canonical
link in `index.html` if it is not `ambashipping.com`.

## Assets and licences

| Asset | Source | Licence |
|---|---|---|
| `public/brand/aslpl-logo.png` | the existing site, `/images/Amba Shipping.png` | client's own mark |
| `public/brand/aslpl-logo-knockout.png` | derived from the above — white plate removed so the mark sits on dark grounds | client's own mark |
| Newsreader, Archivo | Google Fonts | SIL Open Font License 1.1 |
| Ocean, vessel | generated procedurally in this repo | no third-party asset |

No photography is used. **No stock image was copied from the old site** — the
one on its Cargo Handling card carries a Shutterstock watermark.

If the client prefers no third-party font requests, self-host the two families
and drop the `fonts.googleapis.com` tags from `index.html`.
