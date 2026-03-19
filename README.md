# Vedlik AI Web Showcase

Single-page React showcase for the Vedlik mobile app. Ultra-matte dark theme with a scroll-driven 3D phone flip (GSAP ScrollTrigger).

**Important:** Run all `npm` commands from inside this folder (`vedlik-showcase`), not from your home directory:

```bash
cd vedlik-showcase
npm install
npm run dev
```

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 and scroll to drive the timeline: text crossfades, article swipe, phone flip to AI Signals, then staggered data viz.

## Stack

- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** (arbitrary values for 3D where needed)
- **GSAP** + **@gsap/react** (`useGSAP`) + **ScrollTrigger**

## Structure

- `VedlikShowcase` — Page wrapper, refs, `useGSAP` timeline + `gsap.matchMedia()` (desktop 768+ vs mobile).
- `ScrollSection` — Pinned section: left text blocks, right phone.
- `PhoneMockup` — Bezel with `perspective: 1000px`; inner screen container with `transform-style: preserve-3d` and front/back faces (`backface-visibility: hidden`).
- `ScreenFront` — News UI: status bar, Article 1 & 2 (swipe), tab bar.
- `ScreenBack` — AI Signals: credibility ring, sentiment bar, entity pills.

## Build

From inside `vedlik-showcase`:

```bash
npm run build
npm run preview
```
