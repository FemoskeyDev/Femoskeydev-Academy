import { useEffect, useState } from 'react'
import { BrandMark } from './BrandMark'
import { siteConfig } from '../../data/siteConfig'
function preloadImage(src: string) {
  return new Promise<void>(resolve => {
    const image = new Image()
    image.onload = () => { void image.decode().catch(() => undefined).finally(resolve) }
    image.onerror = () => resolve()
    image.src = src
  })
}

export function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    let cancelled = false
    const fonts = document.fonts?.load('500 16px "Tomato Grotesk"').then(() => undefined).catch(() => undefined) ?? Promise.resolve()
    void Promise.all([fonts, preloadImage(siteConfig.portrait), preloadImage(siteConfig.cyberneticPortrait)]).then(() => {
      if (!cancelled) setVisible(false)
    })
    return () => { cancelled = true }
  }, [])
  return <div className={`loader${visible ? '' : ' loader-away'}`} aria-hidden={!visible}><BrandMark className="loader-logo"/><span>Femoskeydev <b>Academy</b></span></div>
}
