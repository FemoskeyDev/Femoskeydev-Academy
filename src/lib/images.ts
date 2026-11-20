/** Raster images ship as WebP at 2× (`name.webp`) with a half-size copy (`name-1x.webp`),
 *  so the browser downloads only the size it will show. `width` is the 2× file's pixel width. */
export function responsive(src: string, width: number, sizes: string) {
  return { src, srcSet: `${src.replace(/\.webp$/, '-1x.webp')} ${Math.round(width / 2)}w, ${src} ${width}w`, sizes }
}
