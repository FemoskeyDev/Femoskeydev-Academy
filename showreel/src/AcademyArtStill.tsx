import { AbsoluteFill } from 'remotion'
import { academyArt, Inflated, type AcademyArt } from './Inflated'

/** One Academy illustration on a transparent background, for exporting to Figma. */
export function AcademyArtStill({ art }: { art: AcademyArt }) {
  return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Inflated id={art} pieces={academyArt[art]} size={760} />
  </AbsoluteFill>
}
