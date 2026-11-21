import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { seoFor, site } from '../data/seo'

/** Applies the current page's title, description, canonical URL and share tags from src/data/seo.ts. The build
 *  writes the same tags into each page's HTML; this keeps them right as people navigate inside the app. */
export function usePageMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const page = seoFor(pathname)
    const url = `${site.url}${pathname}`
    const image = `${site.url}${page.image}`
    document.title = page.title
    const meta = (key: 'name' | 'property', id: string, content: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${id}"]`)
      if (!node) { node = document.createElement('meta'); node.setAttribute(key, id); document.head.append(node) }
      node.content = content
    }
    meta('name', 'description', page.description)
    meta('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
    meta('property', 'og:title', page.title)
    meta('property', 'og:description', page.description)
    meta('property', 'og:url', url)
    meta('property', 'og:image', image)
    meta('property', 'og:image:alt', page.imageAlt)
    meta('name', 'twitter:title', page.title)
    meta('name', 'twitter:description', page.description)
    meta('name', 'twitter:image', image)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
    canonical.href = url
  }, [pathname])
}
