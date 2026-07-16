# Peek Mee — Landing Page

A functional, responsive landing page for the **Peek Mee** indie game studio, built to match the
[Peek Mee Web Figma design](https://www.figma.com/design/a56tlQ62IutwlklKGaFstc/Peek-Mee-Web).

Plain **HTML / CSS / JS** — no build step, no framework.

## Structure

```
index.html      Markup for all sections
styles.css      Design tokens + layout + 3 responsive breakpoints
script.js       Mobile nav, showreel, form validation, scroll-spy
assets/         Images (game art, projects, hero, logo) + icons/ (SVG)
.claude/        Local dev static server (node) + launch config
```

## Sections

Nav → Hero + Showreel → Games (mosaic) → Services → Who We Are → Projects → Contact form → Footer.

## Responsive breakpoints

Mirror the Figma frames:

| Frame        | Behaviour                                                        |
|--------------|-----------------------------------------------------------------|
| >= 1081px    | Desktop (1440 design) — full games mosaic, 4-up services        |
| 621–1080px   | Tablet (840 design) — game title on top, 2-up services/projects |
| <= 620px     | Mobile (412 design) — hamburger nav, stacked cards, 1-up grids  |

## Design tokens

- Accent orange `#ffa74a` (alt `#ec9941`)
- Neutrals `#1c1b1c` `#2e2e2e` `#484646` `#f0f0f0` · cream `#f6f1eb`
- Display font **Fredoka**, body font **Nunito Sans** (Google Fonts)

## Run locally

Any static server works. A tiny bundled one:

```bash
node .claude/serve.js      # http://localhost:8137
```

or `npx serve` / VS Code Live Server, etc.

## Notes

- The showreel uses the design's placeholder (no video source); wire a real embed in `script.js`.
- Nav/footer links, socials, and store badges point to placeholders (`#`) — swap in real URLs.
- Icons are the original Figma SVGs, recolored via CSS `mask` so they inherit `currentColor`.
- Contact form validates client-side and simulates a send; connect it to a backend/endpoint to go live.
