import { useRef, useState } from 'react'
import { siteConfig } from '../../data/siteConfig'
import styles from './ServicesPreview.module.css'

const services = [
  { name: 'Product Design', image: 'product-design' },
  { name: 'Development', image: 'development' },
  { name: 'Branding & Identity', image: 'branding' },
  { name: 'Graphic Design', image: 'graphic-design' },
  { name: 'Motion & Animation', image: 'motion' },
]

export function ServicesPreview() {
  const [active, setActive] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  return <div className={styles.panel} onPointerMove={event => {
    if (event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    previewRef.current?.style.setProperty('--preview-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 28}px`)
    previewRef.current?.style.setProperty('--preview-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 40}px`)
  }} onPointerLeave={() => {
    previewRef.current?.style.setProperty('--preview-x', '0px')
    previewRef.current?.style.setProperty('--preview-y', '0px')
  }}>
    <ul className={styles.list} aria-label="Explore our services">
      {services.map((service, index) => <li key={service.image} className={index === active ? styles.active : undefined} onPointerEnter={event => {
        if (event.pointerType !== 'touch') setActive(index)
      }} onFocus={() => setActive(index)}>
        <button type="button" aria-pressed={active === index} aria-controls="service-preview" onClick={() => setActive(index)}>{service.name}</button>
        <a href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" aria-label={`Book a call about ${service.name}`}><span aria-hidden="true">↗</span></a>
      </li>)}
    </ul>
    <div ref={previewRef} id="service-preview" className={styles.preview} role="img" aria-label={`${services[active].name} illustration`}>
      <div className={styles.track} aria-hidden="true">
        {services.map((service, index) => <div className={styles.slide} data-active={index === active} key={service.image}><img src={`/images/services/${service.image}.svg`} alt="" width="640" height="600" draggable="false" /></div>)}
      </div>
    </div>
  </div>
}
