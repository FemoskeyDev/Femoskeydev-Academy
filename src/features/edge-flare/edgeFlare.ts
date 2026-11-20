/*
 * Bottom-edge flare: images and videos marked with [data-flare] are redrawn on one fixed WebGL
 * canvas, and their sides spread outward as they pass the bottom of the viewport.
 * The original element stays in the page (hidden while its copy is drawn) and is shown again
 * whenever the copy can't match it: while it is transformed, clipped, focused, or mid page transition.
 */

const SEGMENTS = 64
const NEAR = 1.5 // viewports away within which textures are kept

const vertexShader = `
attribute vec2 a_corner;
uniform vec4 u_rect;   // x, y, width, height in CSS pixels
uniform vec2 u_view;   // viewport size
uniform float u_band;  // height of the zone above the bottom edge where media flares
uniform float u_flare; // how far each side spreads at the very bottom
uniform vec4 u_uv;     // texture crop: offset x, y, scale x, y
varying vec2 v_uv;
varying vec2 v_local;
void main() {
  float x = u_rect.x + a_corner.x * u_rect.z;
  float y = u_rect.y + a_corner.y * u_rect.w;
  // 0 above the band, 1 at the bottom edge; a quarter circle, so the sides leave straight.
  float t = clamp((y - (u_view.y - u_band)) / u_band, 0.0, 1.0);
  x += (a_corner.x * 2.0 - 1.0) * u_flare * (1.0 - sqrt(1.0 - t * t));
  gl_Position = vec4(x / u_view.x * 2.0 - 1.0, 1.0 - y / u_view.y * 2.0, 0.0, 1.0);
  v_uv = u_uv.xy + a_corner * u_uv.zw;
  v_local = a_corner;
}`

const fragmentShader = `
precision mediump float;
uniform sampler2D u_texture;
uniform float u_alpha;
uniform vec2 u_size;    // box size in CSS pixels
uniform float u_radius; // corner radius in CSS pixels
varying vec2 v_uv;
varying vec2 v_local;
void main() {
  vec2 p = abs(v_local * u_size - u_size * 0.5) - (u_size * 0.5 - u_radius);
  float outside = length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - u_radius;
  float edge = u_radius > 0.0 ? clamp(0.5 - outside, 0.0, 1.0) : 1.0;
  gl_FragColor = texture2D(u_texture, v_uv) * u_alpha * edge;
}`

type Media = HTMLImageElement | HTMLVideoElement
type Entry = { texture: WebGLTexture | null; source: string; width: number; ancestors: HTMLElement[]; clips: HTMLElement[]; radius: number }

const isVideo = (el: Media): el is HTMLVideoElement => el.tagName === 'VIDEO'
const naturalWidth = (el: Media) => isVideo(el) ? el.videoWidth : el.naturalWidth
const naturalHeight = (el: Media) => isVideo(el) ? el.videoHeight : el.naturalHeight
const ready = (el: Media) => isVideo(el) ? el.readyState >= 2 && el.videoWidth > 0 : el.complete && el.naturalWidth > 0

export function isFlareSupported() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  // Safari repaints video textures poorly; it keeps the plain media.
  const safari = /^((?!chrome|chromium|crios|fxios|android|edg).)*safari/i.test(navigator.userAgent)
  return !safari && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Starts the effect for the whole document; returns a function that removes it and restores every element. */
export function startEdgeFlare(): () => void {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:20'
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true })
  if (!gl) return () => undefined

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }
  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => undefined
  gl.useProgram(program)

  // A strip of thin rows, so the sides can curve smoothly.
  const corners: number[] = []
  for (let i = 0; i <= SEGMENTS; i++) corners.push(0, i / SEGMENTS, 1, i / SEGMENTS)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW)
  const corner = gl.getAttribLocation(program, 'a_corner')
  gl.enableVertexAttribArray(corner)
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0)
  const u = Object.fromEntries(['u_rect', 'u_view', 'u_band', 'u_flare', 'u_uv', 'u_alpha', 'u_size', 'u_radius']
    .map(name => [name, gl.getUniformLocation(program, name)]))
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  document.body.append(canvas)

  const entries = new Map<Media, Entry>()
  const scratch = document.createElement('canvas')
  let dpr = 1
  let paused = false
  let dirty = true
  let frame = 0

  const show = (el: Media) => { el.style.visibility = '' }
  const describe = (el: Media): Entry => {
    const ancestors: HTMLElement[] = []
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) ancestors.push(node)
    const clips = ancestors.filter(node => getComputedStyle(node).overflow !== 'visible')
    return { texture: null, source: '', width: 0, ancestors, clips, radius: 0 }
  }
  const radiusOf = (el: Media, entry: Entry) => {
    const own = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
    if (own) return own
    // Media usually takes its rounding from the frame that clips it.
    const frameRect = el.getBoundingClientRect()
    for (const clip of entry.clips.slice(0, 3)) {
      const r = clip.getBoundingClientRect()
      if (Math.abs(r.width - frameRect.width) < 2 && Math.abs(r.height - frameRect.height) < 2) return parseFloat(getComputedStyle(clip).borderTopLeftRadius) || 0
    }
    return 0
  }
  const release = (entry: Entry) => {
    if (entry.texture) gl.deleteTexture(entry.texture)
    entry.texture = null
    entry.source = ''
  }

  const scan = () => {
    const found = new Set(document.querySelectorAll<Media>('img[data-flare], video[data-flare]'))
    for (const [el, entry] of entries) if (!found.has(el)) { show(el); release(entry); entries.delete(el) }
    for (const el of found) if (!entries.has(el)) entries.set(el, describe(el))
  }
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = document.documentElement
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    for (const [el, entry] of entries) entry.radius = radiusOf(el, entry)
  }

  // Upload images at the size they are shown, not their full export size.
  const upload = (el: Media, entry: Entry, width: number) => {
    if (!entry.texture) {
      entry.texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, entry.texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    } else gl.bindTexture(gl.TEXTURE_2D, entry.texture)
    if (isVideo(el)) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el); return }
    const target = Math.min(naturalWidth(el), Math.ceil(width * dpr))
    scratch.width = target
    scratch.height = Math.round(target * naturalHeight(el) / naturalWidth(el))
    scratch.getContext('2d')!.drawImage(el, 0, 0, scratch.width, scratch.height)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch)
    entry.source = el.currentSrc
    entry.width = width
  }

  // object-fit: cover crop, following the element's object-position.
  const crop = (el: Media, w: number, h: number) => {
    const media = naturalWidth(el) / naturalHeight(el)
    const box = w / h
    if (getComputedStyle(el).objectFit !== 'cover' || Math.abs(media - box) < 0.001) return [0, 0, 1, 1]
    const [px, py] = getComputedStyle(el).objectPosition.split(' ').map(v => v.endsWith('%') ? parseFloat(v) / 100 : 0.5)
    if (media > box) { const s = box / media; return [(1 - s) * px, 0, s, 1] }
    const s = media / box
    return [0, (1 - s) * py, 1, s]
  }

  const draw = () => {
    frame = requestAnimationFrame(draw)
    if (dirty) { dirty = false; scan() }
    const { clientWidth: vw, clientHeight: vh } = document.documentElement
    if (canvas.width !== Math.floor(vw * dpr) || canvas.height !== Math.floor(vh * dpr)) resize()
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    if (paused) return
    gl.uniform2f(u.u_view, vw, vh)
    gl.uniform1f(u.u_band, Math.min(140, Math.max(80, vh * 0.14)))

    for (const [el, entry] of entries) {
      const rect = el.getBoundingClientRect()
      const near = rect.bottom > -vh * NEAR && rect.top < vh * (1 + NEAR)
      if (!near) { if (entry.texture) release(entry); show(el); continue }
      if (!ready(el) || !rect.width || rect.bottom < 0 || rect.top > vh) { show(el); continue }
      // Only draw a copy that can match exactly: no scale or rotation, not clipped, not focused.
      const w = el.offsetWidth, h = el.offsetHeight
      const transformed = Math.abs(rect.width - w) > 0.5 || Math.abs(rect.height - h) > 0.5
      const clipped = entry.clips.some(clip => {
        const c = clip.getBoundingClientRect()
        return rect.left < c.left - 1 || rect.right > c.right + 1 || rect.top < c.top - 1 || rect.bottom > c.bottom + 1
      })
      const focused = document.activeElement !== document.body && !!document.activeElement?.contains(el)
      let alpha = parseFloat(getComputedStyle(el).opacity)
      for (const node of entry.ancestors) { if (alpha <= 0) break; alpha *= parseFloat(getComputedStyle(node).opacity) }
      if (transformed || clipped || focused || alpha <= 0) { show(el); continue }

      const video = isVideo(el)
      if (!entry.texture || (!video && (entry.source !== el.currentSrc || w > entry.width * 1.25)) || (video && !el.paused)) upload(el, entry, w)
      else gl.bindTexture(gl.TEXTURE_2D, entry.texture)
      if (!entry.radius) entry.radius = radiusOf(el, entry)

      const [ox, oy, sx, sy] = crop(el, w, h)
      gl.uniform4f(u.u_rect, rect.left, rect.top, w, h)
      gl.uniform4f(u.u_uv, ox, oy, sx, sy)
      gl.uniform2f(u.u_size, w, h)
      gl.uniform1f(u.u_radius, entry.radius)
      gl.uniform1f(u.u_flare, Math.min(28, w * 0.06))
      gl.uniform1f(u.u_alpha, alpha)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2)
      el.style.visibility = 'hidden'
    }
  }

  // Page transitions snapshot the DOM, so hand every element back while one runs.
  const root = document.documentElement
  const syncTransition = () => {
    paused = root.hasAttribute('data-page-transition')
    if (paused) entries.forEach((_, el) => show(el))
  }
  const transitions = new MutationObserver(syncTransition)
  transitions.observe(root, { attributes: true, attributeFilter: ['data-page-transition'] })
  // New pages mount new media; rescan on the next frame rather than on every mutation.
  const additions = new MutationObserver(() => { dirty = true })
  additions.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('resize', resize)
  resize()
  syncTransition()
  frame = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(frame)
    transitions.disconnect()
    additions.disconnect()
    window.removeEventListener('resize', resize)
    entries.forEach((entry, el) => { show(el); release(entry) })
    entries.clear()
    canvas.remove()
  }
}
