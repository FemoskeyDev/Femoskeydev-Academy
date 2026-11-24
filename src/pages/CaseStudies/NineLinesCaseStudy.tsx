import type { CSSProperties } from 'react'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ContactCta } from '../StudioPages/ContactCta'
import { RevealOnScroll } from '../../components/ui/RevealOnScroll'
import { responsive } from '../../lib/images'
import cs from './CaseStudy.module.css'
import styles from './NineLinesCaseStudy.module.css'

const image = (file: string) => `/images/work/ninelines/${file}.webp`

const meta = [
  ['Role', 'Brand designer'],
  ['Timeline', '2026'],
  ['Scope', 'Logo, identity system, guidelines'],
  ['Applications', 'Print, signage, packaging, web'],
]

/** The mark's three parts in its own 412 × 560 drawing units, all drawn with the same stroke. */
const parts = [
  { id: 'nine', label: 'The 9', note: 'A closed loop and its tail.', d: 'M302.26 164.5A141.96 141.96 0 1 1 18.34 164.5A141.96 141.96 0 1 1 302.26 164.5M273.5 250.2L52.4 541.6' },
  { id: 'line', label: 'The l', note: 'One rising line.', d: 'M393.9 0V560' },
  { id: 'floor', label: 'The floor', note: 'The line every room stands on.', d: 'M24 541.6H412' },
]

/** The finished monogram, outlined. Paths come from the brand's SVG master (viewBox 204 204 600 815). */
const monogram = [
  'M617.214 443.391C617.214 344.022 536.66 263.467 437.292 263.466C337.922 263.466 257.367 344.021 257.367 443.391C257.368 542.76 337.923 623.313 437.292 623.313C536.66 623.313 617.214 542.759 617.214 443.391ZM670.582 443.391C670.582 572.233 566.134 676.681 437.292 676.681C308.449 676.681 204 572.233 204 443.391C204 314.548 308.449 210.099 437.292 210.099C566.134 210.099 670.582 314.548 670.582 443.391Z',
  'M623.165 584.381L333.971 965.626H685.83C721.621 965.626 750.632 936.615 750.632 900.823V204H804V900.823C804 966.088 751.095 1018.99 685.83 1018.99H226.506L580.647 552.127L623.165 584.381Z',
]

const palette = [
  { name: 'Deep Teal', hex: '#315357', role: 'Primary', ink: '#F4F4DC', weight: 3.4 },
  { name: 'Slate Teal', hex: '#678C90', role: 'Secondary', ink: '#F4F4DC', weight: 1.6 },
  { name: 'Sky', hex: '#ACD4DB', role: 'Accent', ink: '#315357', weight: 1.6 },
  { name: 'Butter', hex: '#F6E28C', role: 'Accent', ink: '#315357', weight: 2 },
  { name: 'Cream', hex: '#F4F4DC', role: 'Primary', ink: '#315357', weight: 1.4 },
  { name: 'Crimson', hex: '#B82D44', role: 'Signal', ink: '#F4F4DC', weight: 0.35 },
]

type Shot = { file: string; alt: string; caption: string; wide?: boolean }

/** The identity in the world, paired as in the presentation: one wide shot, then two side by side. */
const gallery: Shot[] = [
  { file: 'stationery', alt: 'Nine Lines stationery flat lay: letterhead, business cards, an A5 flyer and Butter and Sky postcards beside a piece of driftwood', caption: 'Stationery', wide: true },
  { file: 'cards', alt: 'Deep Teal and Butter business cards on grey and black marble', caption: 'Business cards' },
  { file: 'card-in-hand', alt: 'A hand holding a Deep Teal business card with the cream wordmark', caption: 'Business card' },
  { file: 'covers', alt: 'Three magazine covers in Sky, Butter and Deep Teal stacked on an oak table', caption: 'Editorial', wide: true },
  { file: 'spread', alt: 'An open brochure spread titled Light first, on an oak table', caption: 'Brochure spread' },
  { file: 'book', alt: 'A book titled A Book of Rooms with colour-band cover, leaning on terrazzo in sunlight', caption: 'Book' },
  { file: 'triptych', alt: 'Three framed posters on concrete showing the loop, the tail and the line of the mark', caption: 'Poster series', wide: true },
  { file: 'poster-wall', alt: 'A Deep Teal poster with a large Butter monogram above an oak sideboard', caption: 'Posters' },
  { file: 'bedroom', alt: 'A bedroom with a quarter-circle poster in the brand colours above the bed', caption: 'Interiors' },
  { file: 'bags', alt: 'Two paper shopping bags, one Butter with the wordmark, one Deep Teal with the monogram', caption: 'Packaging', wide: true },
  { file: 'tote', alt: 'A canvas tote printed with the monogram and wordmark on sunlit stone steps', caption: 'Tote bag' },
  { file: 'flag', alt: 'A Deep Teal flag with the cream wordmark and a Butter band against a blue sky', caption: 'Flag' },
  { file: 'website', alt: 'The Quiet Lines landing page on a laptop resting on stone, with towers in teal fog behind', caption: 'Website', wide: true },
  { file: 'facade', alt: 'The wordmark as raised Deep Teal letters on a ribbed metal facade', caption: 'Signage' },
  { file: 'poster-detail', alt: 'A Butter poster with nine vertical lines in an oak frame', caption: 'Graphic device' },
]

const guidePages = [
  ['guide-cover', 'Guide cover: the wordmark on Deep Teal'],
  ['guide-meaning', 'Meaning: the 9, the l and the floor make the mark'],
  ['guide-built', 'How it is built: the mark with annotated parts'],
  ['guide-clear', 'Clear space around the wordmark'],
  ['guide-colour', 'Primary and secondary colours with tints'],
  ['guide-pattern', 'The monogram pattern in cream and Deep Teal'],
  ['guide-type', 'Typography: Unbounded and Plus Jakarta Sans'],
  ['guide-logo-colour', 'The logo on each brand colour'],
  ['guide-device', 'The nine-lines graphic device'],
  ['guide-misuse', 'Logo misuse examples'],
  ['guide-photo', 'Photography direction'],
  ['guide-in-use', 'The brand in use: four candid photographs'],
] as const

function Shot({ shot }: { shot: Shot }) {
  return <figure className={`${styles.shot} ${shot.wide ? styles.shotWide : ''}`}>
    <img data-flare {...responsive(image(shot.file), shot.wide ? 2496 : 1236, shot.wide ? '(max-width: 1440px) 100vw, 1248px' : '(max-width: 600px) 100vw, 618px')} alt={shot.alt} loading="lazy" />
    <figcaption>{shot.caption}</figcaption>
  </figure>
}

/** Every section keeps its own surface: the brand's colour bands read as solid blocks, without the site's scroll cross-fade. */
export function NineLinesCaseStudy() {
  usePageMeta()
  return <>
    <article className={`${cs.page} ${styles.page}`}>
      <div className={`${cs.hero} ${styles.hero}`}>
        <img data-flare {...responsive(image('hero'), 2752, '(max-width: 1440px) 100vw, 1376px')} alt="The Nine Lines wordmark in cream above a textured brown sofa caught in low, raking light" width="2752" height="1520" fetchPriority="high" />
      </div>

      <header className={`${cs.wrap} ${cs.intro}`}>
        <p className={cs.kicker}>Case study · Interiors · Brand identity</p>
        <h1>Nine Lines</h1>
        <p className={cs.lede}>A quiet identity for an interior and furniture studio, drawn as one continuous line.</p>
        <div className={cs.details}>
          <p>Nine Lines plans, furnishes and builds interiors for homes and small hospitality spaces. The studio wanted a mark that felt architectural without being cold: simple enough to engrave into oak, calm enough to sit on a wall, and distinct enough to remember.</p>
          <dl className={cs.meta}>
            <div className={cs.metaWide}><dt>Problem</dt><dd>How might a young studio look as considered as the rooms it designs, across print, space and screen?</dd></div>
            <div className={cs.metaWide}><dt>Outcome</dt><dd>A 9 and an l joined into one line, a six-colour palette, a 36-page guide and a full asset pack, ready for the client to use.</dd></div>
            {meta.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </header>

      <section className={styles.idea} aria-labelledby="nl-idea" data-surface-fixed>
        <div className={cs.wrap}>
          <div className={styles.bandHead}>
            <p className={styles.index}>01 — The idea</p>
            <h2 id="nl-idea" className={styles.display}>A nine, a line and a floor.</h2>
            <p className={styles.body}>The name holds the whole mark. The loop and tail of a 9, one rising l, and the line a room stands on, drawn with the same stroke and joined into a single path.</p>
          </div>
          <RevealOnScroll className={styles.equation}>
            {parts.map((part, i) => <div key={part.id} className={styles.term} style={{ '--i': i } as CSSProperties}>
              <svg viewBox="-20 -20 452 600" aria-hidden="true"><path pathLength={1} d={part.d} /></svg>
              <p><strong>{part.label}</strong><span>{part.note}</span></p>
              <span className={styles.operator} aria-hidden="true">{i < parts.length - 1 ? '+' : '='}</span>
            </div>)}
            <div className={`${styles.term} ${styles.result}`} style={{ '--i': parts.length } as CSSProperties}>
              <svg viewBox="184 184 640 855" role="img" aria-label="The Nine Lines monogram">{monogram.map(d => <path key={d} d={d} />)}</svg>
              <p><strong>Nine Lines</strong><span>Drawn as one continuous line.</span></p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className={`${cs.wrap} ${styles.section}`} aria-labelledby="nl-grid" data-surface-fixed>
        <div className={cs.sectionHead}>
          <h2 id="nl-grid" className={cs.heading}>Drawn on a grid <span>the 9 sits inside Unbounded</span></h2>
          <p>The ligature replaces the l in Unbounded Light, so the wordmark keeps the typeface’s rhythm. One circle, one diagonal and one rounded corner, all at the weight of the letters around them.</p>
        </div>
        <RevealOnScroll className={styles.pair}>
          <figure className={`${styles.sheet} ${styles.sheetSquare}`}><img data-flare {...responsive(image('construction-monogram'), 824, '(max-width: 600px) 100vw, 412px')} alt="Monogram construction: the 9 and l on a grid with anchor points, the loop's centre line and the corner radius" loading="lazy" /></figure>
          <figure className={`${styles.sheet} ${styles.sheetWide}`}><img data-flare {...responsive(image('construction-wordmark'), 1648, '(max-width: 600px) 100vw, 824px')} alt="Wordmark construction: nine and ines in Unbounded Light with the ligature, ascender, x-height and baseline guides" loading="lazy" /></figure>
        </RevealOnScroll>
      </section>

      <section className={`${cs.wrap} ${styles.section}`} aria-labelledby="nl-colour" data-surface-fixed>
        <div className={cs.sectionHead}>
          <h2 id="nl-colour" className={cs.heading}>Colour <span>mixed, never matched</span></h2>
          <p>Deep Teal and Cream carry the identity. Butter, Sky and Slate Teal are mixed across a set, so stacked covers or a pair of bags never share one colour. Crimson is a signal, used sparingly.</p>
        </div>
        <ul className={styles.palette} aria-label="Nine Lines colour palette">
          {palette.map(c => <li key={c.name} tabIndex={0} style={{ '--swatch': c.hex, '--ink': c.ink, '--grow': c.weight } as CSSProperties}>
            <span className={styles.swatchName}>{c.name}</span>
            <span className={styles.swatchMeta}>{c.role}<br />{c.hex}</span>
          </li>)}
        </ul>
      </section>

      <section className={styles.type} aria-labelledby="nl-type" data-surface-fixed>
        <div className={`${cs.wrap} ${styles.typeGrid}`}>
          <p className={styles.glyphs} aria-hidden="true">Aa<br />09</p>
          <div>
            <p className={styles.index}>02 — Typography</p>
            <h2 id="nl-type" className={styles.display}>Unbounded, light and wide.</h2>
            <p className={styles.body}>Unbounded Light for the wordmark and headlines: round, open and the same geometry as the loop. Plus Jakarta Sans for text, quiet at small sizes on paper and on screen.</p>
            <p className={styles.alphabet} aria-hidden="true">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />1234567890 &amp; — . , ! ?</p>
          </div>
        </div>
      </section>

      <section className={styles.gallery} aria-labelledby="nl-world" data-surface-fixed>
        <div className={cs.wrap}>
          <div className={styles.galleryHead}>
            <h2 id="nl-world" className={styles.display}>In the world</h2>
            <p>Stationery · Editorial · Space · Packaging · Digital</p>
          </div>
          <div className={styles.shots}>{gallery.map(shot => <Shot key={shot.file} shot={shot} />)}</div>
        </div>
      </section>

      <section className={`${cs.wrap} ${styles.section}`} aria-labelledby="nl-life" data-surface-fixed>
        <div className={cs.sectionHead}>
          <h2 id="nl-life" className={cs.heading}>Brand in use <span>close, warm and candid</span></h2>
          <p>Photography follows the light: low sun, real materials and shallow focus, so the identity feels like part of the room rather than a sign on it.</p>
        </div>
        <RevealOnScroll className={styles.strip}>
          {[1, 2, 3, 4].map(n => <figure key={n} style={{ '--i': n } as CSSProperties}>
            <img data-flare {...responsive(image(`life-${n}`), 900, '(max-width: 600px) 70vw, 300px')} alt={['An armchair and a lamp-lit bedside in warm evening light', 'A Deep Teal magazine with the wordmark on an oak table, in shallow focus', 'The Deep Teal monogram poster on a sunlit wall above a sideboard', 'Fingers holding a Deep Teal business card with the cream wordmark'][n - 1]} loading="lazy" />
          </figure>)}
        </RevealOnScroll>
      </section>

      <section className={styles.guide} aria-labelledby="nl-guide" data-surface-fixed>
        <div className={cs.wrap}>
          <div className={styles.bandHead}>
            <p className={styles.index}>03 — Handover</p>
            <h2 id="nl-guide" className={styles.display}>A 36-page guide and every file.</h2>
            <p className={styles.body}>Structure, meaning, clear space, colour, type, pattern, misuse and photography, followed by every application. The studio received the guide with the logo in SVG, PDF and PNG in five colourways, app icons, swatches, fonts and print-ready stationery.</p>
          </div>
          <RevealOnScroll className={styles.pages}>
            {guidePages.map(([file, alt]) => <figure key={file}><img {...responsive(image(file), 960, '(max-width: 600px) 50vw, 300px')} alt={alt} loading="lazy" /></figure>)}
          </RevealOnScroll>
        </div>
      </section>
    </article>
    <ContactCta />
  </>
}
