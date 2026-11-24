# Femoskeydev illustration direction

Drawn from the 23 references in `~/Documents/Femoskeydev Illustration` (Figma: *Website Designs*, node 238-13890).
Every 3D illustration we make should pass this page.

## The feel in one line

**Soft, tactile objects you want to pick up**: toy-like, glossy or glassy, lit like a product shot, floating
calmly on a quiet background.

## What the references share

| Trait | What it looks like | Rule for us |
| --- | --- | --- |
| **Form** | Chunky, rounded, no sharp corners. Thick slabs (puzzle, calendar, target), pillowy blobs (cloud, flame), toy figures. | Everything is **rounded and thick**: generous bevels (≥ 25% of the thickness), no hairline edges, no thin parts. |
| **Material** | Four families: **soft vinyl** (matte toy plastic), **jelly** (translucent, glowing from inside), **glass** (clear, with rainbow edges), **frosted acrylic** (milky, soft refraction). Some glossy gradient plastic. | Pick **one material per object** from our four families (below). Never flat colour. |
| **Light** | Bright, soft studio light from the top left; a gentle rim on the right edge; no harsh shadows. | One fixed lighting rig for every render, so a set always matches. |
| **Shadow** | A soft, short contact shadow, or the object floats with a faint glow below. | Soft contact shadow, close under the object, ~30% opacity. |
| **Angle** | Three-quarter view, tilted slightly (10–25°), never straight-on. | Fixed camera presets: `hero` (¾ left), `tilt` (¾ right), `top` (from above). |
| **Colour** | One hue per object plus white/clear; blues, violets and a few warm accents; pastel or white backgrounds. | Our palette only: **mint/green, sky/blue, lilac/violet, peach**, plus clear glass and ink. One hue per object, one accent at most. |
| **Detail** | Few details, each one deliberate: a face, a ring orbit, a sparkle, a ribbon. | At most **one accent** per object (orbit ring, sparkle, or a small second part). |
| **Character** | Some objects get a simple face (two dots and a smile). | Faces only for mascots, never on icons. |
| **Background** | White, very pale blue/lilac, or soft gradient; occasionally black for drama. | Render on **transparent**; place on our backgrounds (`#F7F7F5`, mint `#C8FDCE`, sky `#DFE7FF`, lilac `#E5DFEF`, ink `#151515`). |

## Our four material families

| Name | Reads as | Use for |
| --- | --- | --- |
| `vinyl` | Soft matte toy plastic with a faint sheen | Mascots, friendly objects, the inflated logo |
| `jelly` | Translucent gummy, colour glows from inside | Playful hero objects, stickers |
| `glass` | Clear crystal with iridescent (rainbow) edges | Premium moments: awards, targets, timers |
| `frosted` | Milky tinted acrylic, soft refraction | Icons, UI-ish objects, the Academy set |

## Palette for 3D

| Tone | Hex (base) | Notes |
| --- | --- | --- |
| mint | `#7EE8A0` | Brand green, slightly richer than `#C8FDCE` so it survives lighting |
| blue | `#5B7BF0` | Sky family |
| violet | `#8F6BF0` | Lilac family |
| peach | `#FF9E6E` | Warm accent |
| ink | `#1A1A1A` | Glossy black |
| clear | — | Glass only |

## Do / don't

- **Do** keep silhouettes simple enough to read at 64px.
- **Do** render at 2048px or larger, transparent PNG.
- **Don't** mix materials on one object (except a small accent part).
- **Don't** use more than one hue plus white/clear.
- **Don't** add text inside the 3D object; type stays in layout.
- **Don't** copy the references' characters (SpongeBob, Garfield and so on). They show a finish, not content.

## How to make one

See `README.md` in this folder: draw the shape as an SVG, then run the render script with a material, tone and
angle. The script owns the lighting, camera, bevels and shadow, so every render follows this page.
