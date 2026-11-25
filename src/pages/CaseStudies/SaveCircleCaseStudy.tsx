import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Arrow } from '../../components/ui/Arrow'
import { RevealOnScroll } from '../../components/ui/RevealOnScroll'
import { usePageMeta } from '../../hooks/usePageMeta'
import { responsive } from '../../lib/images'
import { ContactCta } from '../StudioPages/ContactCta'
import { ShowcaseFilm } from './ShowcaseFilm'
import cs from './CaseStudy.module.css'
import styles from './SaveCircleCaseStudy.module.css'

const image = (file: string) => `/images/work/savecircle/${file}.webp`

const meta = [
  ['Role', 'Product designer'],
  ['Timeline', 'February 2024 – ongoing'],
  ['Platforms', 'iOS & Android app, admin dashboard'],
]

/** The mark's five shapes, from the app icon (viewBox 82 62 80 89): the ring is two arcs, the member a head and shoulders. */
const P = {
  ringL: 'M96.7102 85.0859L105.634 94.0092C96.1844 103.936 96.3334 119.646 106.08 129.393C113.794 137.106 125.243 138.808 134.607 134.5C134.358 136.499 134.568 138.529 135.222 140.434C135.877 142.339 136.958 144.07 138.383 145.494C138.653 145.764 138.932 146.02 139.219 146.261C125.324 152.339 108.531 149.691 97.1578 138.318C82.4831 123.643 82.3341 99.9439 96.7102 85.0859Z',
  ringR: 'M145.878 90.4261C148.399 87.9042 153.092 88.4952 156.431 91.7268L156.435 91.7309C157.674 93.7643 158.717 95.9107 159.551 98.1413C161.348 102.95 162.155 108.072 161.922 113.2C161.69 118.328 160.422 123.356 158.197 127.982C158.005 128.378 157.806 128.771 157.599 129.161C154.582 134.867 150.17 139.717 144.775 143.258C143.438 142.946 142.214 142.269 141.24 141.301C138.651 138.712 138.39 134.551 140.259 130.92C140.829 130.441 141.383 129.933 141.92 129.395C142.937 128.38 143.865 127.281 144.696 126.11C145.412 125.099 146.053 124.037 146.613 122.932C148.344 119.505 149.276 115.731 149.339 111.892C149.402 108.053 148.594 104.25 146.977 100.768C146.33 99.3822 145.557 98.0583 144.669 96.8131C143.945 94.4059 144.308 91.9952 145.878 90.4261Z',
  shoulders: 'M97.1571 84.6306C101.514 80.26 106.876 77.0229 112.773 75.2021C113.1 77.8341 114.3 80.2803 116.182 82.15C120.75 86.7187 128.051 86.8244 132.489 82.3868C134.371 80.5042 135.515 78.0091 135.714 75.3545C144.351 78.1678 151.698 83.9738 156.432 91.726C153.093 88.4944 148.4 87.9034 145.878 90.4253C144.309 91.9944 143.945 94.4051 144.674 96.8068C143.849 95.6476 142.928 94.5595 141.922 93.5539C132.024 83.6566 115.978 83.6559 106.081 93.5532C105.93 93.7043 105.782 93.8569 105.636 94.0111L96.7123 85.0878C96.8583 84.9336 97.0065 84.7812 97.1571 84.6306Z',
  head: 'M115.965 65.8224C120.403 61.3848 127.707 61.4939 132.272 66.0592C133.486 67.2628 134.424 68.7155 135.022 70.3168C135.619 71.9182 135.862 73.6302 135.734 75.3346L135.732 75.3614L135.713 75.3552C135.521 77.9192 134.446 80.3374 132.672 82.1987C132.611 82.2598 132.551 82.3202 132.49 82.3813C132.429 82.4424 132.365 82.5062 132.303 82.568C127.848 86.797 120.703 86.6178 116.209 82.1239C114.328 80.2543 113.128 77.808 112.8 75.1761C112.38 71.823 113.432 68.3559 115.965 65.8224Z',
  pot: 'M114.636 102.11C117.101 99.6444 120.438 98.2495 123.925 98.2278C127.411 98.2061 130.765 99.5593 133.26 101.994C135.756 104.429 137.191 107.749 137.254 111.235C137.318 114.72 136.005 118.091 133.601 120.615C131.196 123.14 127.894 124.615 124.409 124.72C120.924 124.826 117.538 123.554 114.985 121.18C112.432 118.806 110.917 115.522 110.77 112.039C110.622 108.555 111.853 105.154 114.196 102.573C114.338 102.416 114.485 102.262 114.636 102.11Z',
}
type Part = keyof typeof P
const ALL = Object.keys(P) as Part[]
const terms: { label: string; note: string; parts: Part[] }[] = [
  { label: 'The circle', note: 'Everyone who saves.', parts: ['ringL', 'ringR'] },
  { label: 'A member', note: 'One of them, joining in.', parts: ['shoulders', 'head'] },
  { label: 'The pot', note: 'What the circle builds.', parts: ['pot'] },
]

const palette = [
  { name: 'Circle Purple', hex: '#8F2CEB', role: 'Primary', ink: '#F2EFE5', weight: 34 },
  { name: 'Growth Green', hex: '#22AD80', role: 'Secondary', ink: '#F2EFE5', weight: 19 },
  { name: 'Cream', hex: '#F2EFE5', role: 'Surface', ink: '#1B1A3D', weight: 17 },
  { name: 'Ink', hex: '#1B1A3D', role: 'Text', ink: '#F2EFE5', weight: 14 },
  { name: 'Peach', hex: '#FFE9C7', role: 'Nudge', ink: '#1B1A3D', weight: 10 },
  { name: 'Coral', hex: '#FF5E5E', role: 'Alert', ink: '#F2EFE5', weight: 6 },
]

/* The product, told in rows like a product page. Phones sit where they do in the Figma frame (1440 wide, from y 358),
   so the composition scales as one piece. */
type Phone = { file: string; alt: string; x: number; y: number; w: number; h: number }
type Row = { id: string; kicker: string; title: string; body: string; bg: string; height: number; phones: Phone[] }
const rows: Row[] = [
  { id: 'sc-home', kicker: '03 — The product', title: 'Money you can see moving.', body: 'Your balance and every circle, on one calm screen.', bg: '#FFFFFF', height: 1440,
    phones: [{ file: 'v2-phone-home-big', alt: 'SaveCircle home screen with a personal balance of $34,000 and two ongoing circles', x: 373, y: 358, w: 734, h: 1566 }] },
  { id: 'sc-people', kicker: 'Onboarding', title: 'Start with people.', body: 'Real faces and one promise before sign-up: save with people you trust.', bg: '#FFFFFF', height: 1300,
    phones: [{ file: 'v2-phone-pair-onb-1', alt: 'The SaveCircle splash screen on an iPhone, front and back', x: 62, y: 358, w: 697, h: 760 },
      { file: 'v2-phone-front-onb-2', alt: 'Onboarding screen with a ring of member photos around the SaveCircle mark', x: 799, y: 358, w: 620, h: 760 }] },
  { id: 'sc-create', kicker: 'Create a circle', title: 'Set it up in three steps.', body: 'The amount, the schedule, and who gets paid when.', bg: '#F5F5F7', height: 1098,
    phones: [{ file: 'v2-phone-front-create-2', alt: 'Set the contribution amount for each member', x: 155, y: 358, w: 490, h: 600 },
      { file: 'v2-phone-front-create-3', alt: 'Choose how often members contribute, with bi-weekly selected', x: 535, y: 358, w: 490, h: 600 },
      { file: 'v2-phone-front-create-4', alt: 'Decide how payout slots are assigned', x: 915, y: 358, w: 490, h: 600 }] },
]
const rowsAfter: Row[] = [
  { id: 'sc-loop', kicker: 'Circle dashboard', title: 'Everyone in the loop.', body: 'Who has paid, who is next and how close the goal is, for every member.', bg: '#F3EEFB', height: 1300,
    phones: [{ file: 'v2-phone-angle-dash-1', alt: 'Circle dashboard showing $10,000 contributed and the next recipient', x: 83, y: 358, w: 655, h: 760 },
      { file: 'v2-phone-front-dash-3', alt: 'Circle details with frequency, due day, slots and the circle leader', x: 778, y: 358, w: 620, h: 760 }] },
  { id: 'sc-pay', kicker: 'Contribute', title: 'Pay in. Get paid.', body: 'Confirm, add money and get a receipt the whole circle can trust.', bg: '#FFFFFF', height: 1018,
    phones: [{ file: 'v2-phone-front-money-1', alt: 'Confirm a contribution to the Education Fund circle', x: 132, y: 461, w: 356, h: 437 },
      { file: 'v2-phone-float-money-2', alt: 'Contribution successful: a $2,000 receipt', x: 438, y: 503, w: 487, h: 395 },
      { file: 'v2-phone-pair-money-3', alt: 'Add money keypad showing $25', x: 875, y: 478, w: 493, h: 420 }] },
]

function ProductRow({ row }: { row: Row }) {
  const stageH = row.height - 358
  return <section className={styles.row} style={{ background: row.bg }} aria-labelledby={row.id} data-surface-fixed>
    <div className={styles.rowHead}>
      <p className={styles.kicker}>{row.kicker}</p>
      <h2 id={row.id} className={styles.rowTitle}>{row.title}</h2>
      <p className={styles.rowBody}>{row.body}</p>
    </div>
    <RevealOnScroll className={styles.stage}>
      <div className={styles.stageInner} style={{ aspectRatio: `1440 / ${stageH}` }}>
        {row.phones.map((p, i) => <img data-flare key={p.file} {...responsive(image(p.file), p.file === 'v2-phone-home-big' ? 1468 : 1400, '(max-width: 1440px) 50vw, 720px')} alt={p.alt} loading="lazy"
          className={styles.phone} style={{ left: `${p.x / 14.4}%`, top: `${(p.y - 358) / stageH * 100}%`, width: `${p.w / 14.4}%`, height: `${p.h / stageH * 100}%`, '--i': i } as CSSProperties} />)}
      </div>
    </RevealOnScroll>
  </section>
}

const Pic = ({ file, alt, w, className }: { file: string; alt: string; w: number; className?: string }) =>
  <img data-flare {...responsive(image(file), w * 2, w > 700 ? '(max-width: 1440px) 100vw, 1248px' : '(max-width: 600px) 100vw, 618px')} alt={alt} loading="lazy" className={className} />

/** Every band keeps its own colour, so the site's light/dark scroll cross-fade is switched off with data-surface-fixed. */
export function SaveCircleCaseStudy() {
  usePageMeta()
  return <>
    <article className={`${cs.page} ${styles.page}`}>
      <div className={`${cs.hero} ${styles.hero}`}>
        <img data-flare {...responsive(image('v2-hero'), 2752, '(max-width: 1440px) 100vw, 1376px')} alt="A rooftop billboard over a city street: Saving is better in circles, beside the SaveCircle payout ring" width="2752" height="1520" fetchPriority="high" />
      </div>

      <header className={`${cs.wrap} ${cs.intro}`}>
        <p className={cs.kicker}>Case study · Fintech · Savings</p>
        <h1>SaveCircle</h1>
        <p className={cs.lede}>Group savings, made simple. Create a circle, invite people you trust and save towards shared goals.</p>
        <div className={cs.details}>
          <p>SaveCircle turns the traditional rotating savings circle into an app. Members contribute on a schedule, take turns receiving the pot, and track every payment together.</p>
          <dl className={cs.meta}>
            <div className={cs.metaWide}><dt>Problem</dt><dd>How might we make group saving transparent and easy to manage for everyone in the circle?</dd></div>
            <div className={cs.metaWide}><dt>Outcome</dt><dd>A mobile app, admin dashboard and website, built on one design system.</dd></div>
            {meta.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </header>

      <ShowcaseFilm src="/images/work/savecircle/v2-brand-wall.mp4" poster={image('v2-wall-poster')} background="#0A0612" label="Brand wall film: columns of SaveCircle posts, photos, type and colour scrolling past" />

      <section className={styles.idea} aria-labelledby="sc-idea" data-surface-fixed>
        <div className={cs.wrap}>
          <div className={styles.bandHead}>
            <p className={styles.index}>01 — The idea</p>
            <h2 id="sc-idea" className={styles.display}>A circle of people,<br />saving as one.</h2>
            <p className={styles.body}>A rotating savings circle is an old idea: friends pay in on a schedule and take turns receiving the pot. The mark draws it literally.</p>
          </div>
          <RevealOnScroll className={styles.equation}>
            {terms.map((t, i) => <div key={t.label} className={styles.term} style={{ '--i': i } as CSSProperties}>
              <svg viewBox="82 62 80 89" aria-hidden="true">{ALL.map(k => <path key={k} d={P[k]} className={t.parts.includes(k) ? styles.on : styles.ghost} />)}</svg>
              <p><strong>{t.label}</strong><span>{t.note}</span></p>
              <span className={styles.operator} aria-hidden="true">{i < terms.length - 1 ? '+' : '='}</span>
            </div>)}
            <div className={`${styles.term} ${styles.result}`} style={{ '--i': 3 } as CSSProperties}>
              <svg viewBox="82 62 80 89" role="img" aria-label="The SaveCircle mark">
                <g className={styles.ring}><path d={P.ringL} /><path d={P.ringR} /><path d={P.pot} /></g>
                <g className={styles.member}><path d={P.shoulders} /><path d={P.head} /></g>
              </svg>
              <p><strong>SaveCircle</strong><span>Saving together, as one mark.</span></p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className={styles.grid} aria-label="How the mark and wordmark are drawn" data-surface-fixed>
        <RevealOnScroll className={styles.sheets}>
          <img data-flare {...responsive(image('v2-grid-monogram'), 2880, '100vw')} alt="Monogram construction: the ring, the member, the pot and the end cap on a grid of circles" loading="lazy" />
          <img data-flare {...responsive(image('v2-grid-wordmark'), 2880, '100vw')} alt="Wordmark construction: SaveCircle in Urbanist Medium with mark top, ascender, x-height and baseline guides" loading="lazy" />
        </RevealOnScroll>
      </section>

      <section className={styles.colour} aria-labelledby="sc-colour" data-surface-fixed>
        <h2 id="sc-colour" className={styles.srOnly}>Colour palette</h2>
        <RevealOnScroll className={styles.paletteWrap}>
          <ul className={styles.palette}>
            {palette.map((c, i) => <li key={c.name} tabIndex={0} style={{ '--swatch': c.hex, '--ink': c.ink, '--grow': c.weight, '--i': i } as CSSProperties}>
              <span className={styles.swatchName}>{c.name}</span>
              <span className={styles.swatchMeta}>{c.role} · {c.hex}</span>
            </li>)}
          </ul>
        </RevealOnScroll>
      </section>

      <section className={styles.type} aria-labelledby="sc-type" data-surface-fixed>
        <div className={`${cs.wrap} ${styles.typeGrid}`}>
          <p className={styles.glyphs} aria-hidden="true">Aa<br />09</p>
          <div>
            <p className={styles.index}>02 — Typography</p>
            <h2 id="sc-type" className={styles.typeTitle}>Urbanist: round, friendly, clear with numbers.</h2>
            <p className={styles.body}>One family from the app to the street. Its open counters keep balances and dates readable at a glance, and its circles echo the mark.</p>
            <p className={styles.alphabet} aria-hidden="true">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />$1,234,567.890 — % ! ?</p>
          </div>
        </div>
      </section>

      {rows.map(row => <ProductRow key={row.id} row={row} />)}
      <section className={styles.bleed} aria-label="SaveCircle in the street" data-surface-fixed>
        <img data-flare {...responsive(image('v2-busstop-wide'), 2880, '100vw')} alt="A bus stop poster in a park: Save together, with the SaveCircle mark and a Family Save card" loading="lazy" />
      </section>
      {rowsAfter.map(row => <ProductRow key={row.id} row={row} />)}

      <ShowcaseFilm src="/images/work/savecircle/admin-film.mp4" poster={image('admin-film-poster')} sound={false} background="#a6a6a6" label="Film of the SaveCircle admin dashboard on a desk monitor: opening Manage Circles, a circle's details and contribution history, then Analytics" />

      <section className={styles.world} aria-labelledby="sc-world" data-surface-fixed>
        <div className={cs.wrap}>
          <div className={styles.worldHead}>
            <h2 id="sc-world" className={styles.display}>In the world</h2>
            <p>Street · Transit · Card · Print · Merch</p>
          </div>
          <RevealOnScroll className={styles.shots}>
            <Pic file="v2-busstop" w={1248} className={styles.wide} alt="The Save together poster in a bus stop citylight" />
            <Pic file="v2-card-front" w={618} alt="The purple SaveCircle Circle card, front on" />
            <Pic file="v2-card-tilted" w={618} alt="The Circle card tilted, showing its chip and the ring" />
            <Pic file="v2-subway" w={1248} className={`${styles.wide} ${styles.tall}`} alt="A subway LED screen: Your turn is coming, beside the payout ring" />
            <Pic file="v2-posters" w={1248} className={styles.wide} alt="Three posters: Save together, Grow together and Your turn is coming" />
          </RevealOnScroll>
        </div>
      </section>

      <section className={styles.merch} aria-label="Merch" data-surface-fixed>
        <RevealOnScroll className={`${cs.wrap} ${styles.shots}`}>
          <Pic file="v2-hoodie" w={1248} className={styles.wide} alt="A purple SaveCircle hoodie with the cream mark on the chest" />
          <Pic file="v2-cap-front" w={618} alt="A purple SaveCircle cap with the mark embroidered on the front" />
          <Pic file="v2-cap-side" w={618} alt="The SaveCircle cap from the side" />
        </RevealOnScroll>
      </section>

      <nav className={`${cs.wrap} ${cs.next}`} aria-label="Next project">
        <p className={cs.kicker}>Next project</p>
        <Link to="/work/liziwaride">Liziwaride <Arrow /></Link>
      </nav>
    </article>
    <ContactCta />
  </>
}
