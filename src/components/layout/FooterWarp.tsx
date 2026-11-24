import { Warp } from '@paper-design/shaders-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/** The footer's moving fog: Paper Shaders' Warp, a soft "edge" pattern rolling like a wave, in the brand's mint,
 *  peach and lilac rising out of black. Loaded on its own, only once the footer is near; held still for reduced motion. */
export default function FooterWarp({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  return <Warp
    className={className}
    colors={['#B8F7C4', 'rgba(255, 213, 191, 0.44)', '#020202']}
    proportion={1}
    softness={1}
    distortion={0.32}
    swirl={0.55}
    swirlIterations={12}
    shape="edge"
    shapeScale={0.12}
    scale={0.52}
    rotation={114}
    speed={reduced ? 0 : 3.5}
    maxPixelCount={1920 * 1080}
  />
}
