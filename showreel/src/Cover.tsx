import { AbsoluteFill } from 'remotion'
import { Background } from './HowWeWork'
import { Mark3D } from './Mark3D'
import { INK, font, useFonts } from './Reel'

/** The Instagram cover for the How we work reel (1080 × 1920). Everything sits inside the middle 1080 × 1440, so the
 *  profile grid's 3:4 crop keeps it all. */
export function Cover() {
  useFonts()
  return <AbsoluteFill style={{ fontFamily: font }}>
    <Background always />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 64, paddingBottom: 60 }}>
      <Mark3D variant="inflated" size={360} />
      <div style={{ marginTop: 40, fontSize: 150, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1, color: INK }}>How we work</div>
    </AbsoluteFill>
  </AbsoluteFill>
}
