import { useEffect } from 'react'
import { siteConfig } from '../data/siteConfig'

export function usePageMeta(title: string, description: string = siteConfig.description) {
  useEffect(() => {
    const fullTitle = `${title} | ${siteConfig.name}`
    document.title = fullTitle
    const ensureMeta = (selector: string, attrs: Record<string, string>) => { let node = document.head.querySelector<HTMLMetaElement>(selector); if (!node) { node = document.createElement('meta'); document.head.append(node) } Object.entries(attrs).forEach(([key,value]) => node?.setAttribute(key,value)); return node }
    ensureMeta('meta[name="description"]', { name: 'description', content: description })
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) } canonical.href = `${siteConfig.url}${window.location.pathname}`
    return () => { document.title = `${siteConfig.name} — Find your creative path` }
  }, [title, description])
}
