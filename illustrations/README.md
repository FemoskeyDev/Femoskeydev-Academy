# Femoskeydev 3D illustrations

Every illustration is rendered by one Blender script, so lighting, camera, rounding, shadow and materials always
match [DIRECTION.md](DIRECTION.md). You supply a flat shape and choose a material and a colour.

## Make one

1. **Draw the shape** as a flat SVG on a 32 × 32 viewBox and save it in `shapes/`. Filled shapes only (outline
   strokes first), and avoid hairline points: the script rounds everything off, so needle tips come out ragged.
   Draw each part as one clean outline (no overlapping pieces); a shape inside another (a ring's hole) becomes a hole.
2. **Write a spec** in `specs/`, named for the illustration:

   ```json
   { "form": "puffy", "angle": "hero", "parts": [
     { "svg": "tile.svg", "material": "frosted", "tone": "mint" },
     { "svg": "asterisk.svg", "material": "vinyl", "tone": "white", "depth": 0.8, "lift": 7 }
   ] }
   ```

   | Field | Options |
   | --- | --- |
   | `form` | `puffy` (pillowy, toy-like) or `slab` (thick acrylic with rounded edges) |
   | `angle` | `hero` (¾ left), `tilt` (¾ right), `top` (from above), `front` (nearly straight on) |
   | `material` | `vinyl`, `jelly`, `glass`, `frosted` (see DIRECTION.md) |
   | `tone` | `mint`, `blue`, `violet`, `peach`, `yellow`, `ink`, `white`, `clear` (glass only) |
   | `depth` | Thickness of this part, relative (1 is normal) |
   | `lift` | How far this part stands in front of the one behind, in shape units |
   | `padding` | Optional: more or less space around the object (default 1.45) |

3. **Render** it:

   ```sh
   illustrations/render.sh academy-icon            # 2048px, final quality
   SIZE=768 SAMPLES=48 illustrations/render.sh     # quick previews of every spec
   ```

   The result is a transparent PNG in `illustrations/out/` with its soft contact shadow, ready for Figma or the site.
   Final quality takes a few minutes per illustration on the M1; a preview takes about 30 seconds.

## Notes

- Renders run **one at a time** on purpose: each uses about 2GB of memory.
- The script stops itself if a shape comes out mis-scaled (a guard against the SVG importer's hidden scale), rather
  than building a huge mesh.
- Blender 5.2 lives at `/Applications/Blender.app`; set `BLENDER=` to use another copy.
- For one-off scenes the shapes can't express (characters, busy compositions), use an image model with
  DIRECTION.md as the brief, then keep only what passes it.
