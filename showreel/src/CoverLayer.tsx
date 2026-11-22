import { AbsoluteFill } from 'remotion'
import { CharacterGrid } from './HowWeWork'
import { Mark3D } from './Mark3D'

/** Single layers of the Instagram cover on a transparent background, for rebuilding it as an editable Figma file. */
export function CoverLayer({ layer }: { layer: 'mark' | 'grid' }) {
  return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    {layer === 'grid' ? <CharacterGrid opacity={0.75} /> : <Mark3D variant="inflated" size={360} />}
  </AbsoluteFill>
}
