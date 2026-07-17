# Peek Mee — Build Web Components (Figma plugin)

Generates a **Components — Web** frame in the [Peek Mee Web](https://www.figma.com/design/a56tlQ62IutwlklKGaFstc/Peek-Mee-Web)
file, containing the component set behind the landing page.

Token values come from `:root` in `../styles.css`, which is itself derived from
this Figma file — so the plugin restates values the file already established
rather than inventing new ones.

## Run it

1. Figma desktop → **Plugins → Development → Import plugin from manifest…**
2. Select `manifest.json` in this folder.
3. Open the Peek Mee Web file, put yourself on the page you want the frame on.
4. **Plugins → Development → Peek Mee — Build Web Components**

The frame is parked to the right of any existing content on the current page and
selected when done. Re-running creates another copy — delete the previous frame
first if you are iterating.

## What it builds

| Component | Notes |
|---|---|
| `Button / Primary` | Pill, orange, `Label` text prop |
| `Nav / Link` | `Label` text prop, `Active` boolean toggles the underline |
| `Card / Service` | 264 wide, 200px icon well, `Title` + `Description` props |
| `Card / Game Description` | Bottom-aligned copy over an artwork fill |
| `Tile / Social` | Orange, 2px neutral-20 border |
| `Badge / Store` | 44 tall, `Label` prop |
| `Tile / Project` | 480×270 |
| `Form / Input` | `Placeholder` prop, `Focused` boolean toggles the ring |
| `Form / Textarea` | 744×200 |
| `Footer / Column` | `Heading` prop |
| `Type / Section Title` | Fredoka 56/72 |

## Fonts

Needs **Nunito Sans** and **Fredoka**. Style names vary between releases
(`SemiBold` vs `Semi Bold`), so the plugin resolves them at runtime against what
is installed instead of hardcoding. If a family is missing entirely it falls back
and reports what it substituted in the closing message; if nothing usable is
found it stops with an error rather than building the set in the wrong typeface.

## Icons

Icon nodes are plain placeholder frames — the plugin does not import the SVGs
from `../assets/icons/`. Swap them manually, or drop the SVGs in and convert.
