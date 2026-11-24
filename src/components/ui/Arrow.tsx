/** Tomato Grotesk's own ↗ glyph, traced from the font files into SVG so it looks the same in every
 *  browser whether or not the font has loaded. The em-sized box (advance width × 1em, baseline at 0.85em)
 *  matches where the text glyph sat in a line-height: 1 line. Decorative: the link or button carries the label. */
const glyphs = {
  regular: {
    width: 914,
    d: 'M196 187L136 250C188 302 262.3 328 359 328C405 328 451 322 497 310C543 298 583 282.3 617 263L620 267L113 756L172 816L678 325L682 328C662.7 362 647 400.8 635 444.5C623 488.2 617 531.7 617 575C617 665.7 643 737 695 789L759 730C717 688 696 624.7 696 540C696 457.3 716.7 352 758 224L721 187C590.3 229 480.7 250 392 250C303.3 250 238 229 196 187Z',
  },
  semibold: {
    width: 846,
    d: 'M183 177L92 269C118.7 298.3 150.7 319.7 188 333C225.3 346.3 265.3 353 308 353C346.7 353 385.2 348 423.5 338C461.8 328 494.7 315.7 522 301L526 305L83 732L168 822L613 390L617 393C602.3 421 590.3 453 581 489C571.7 525 567 561 567 597C567 637.7 573.5 676.3 586.5 713C599.5 749.7 620.3 782.3 649 811L742 720C695.3 673.3 672 607.7 672 523C672 446.3 691.3 355 730 249L669 190C567.7 228.7 474.7 248 390 248C299.3 248 230.3 224.3 183 177Z',
  },
}

/** `size` sets the glyph's em in pixels; without it the arrow follows the surrounding text. */
export function Arrow({ className, weight = 'regular', size }: { className?: string; weight?: keyof typeof glyphs; size?: number }) {
  const glyph = glyphs[weight]
  return <span className={className} aria-hidden="true" style={size ? { display: 'inline-flex', fontSize: size } : undefined}>
    <svg viewBox={`0 0 ${glyph.width} 1000`} width={`${glyph.width / 1000}em`} height="1em" fill="currentColor" focusable="false"><path d={glyph.d} /></svg>
  </span>
}
