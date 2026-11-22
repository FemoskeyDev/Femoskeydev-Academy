import { AbsoluteFill } from 'remotion'
import { Background } from './HowWeWork'
import { Mark3D, type MarkVariant } from './Mark3D'
import { useFonts } from './Reel'

/** A still of one 3D treatment of the mark on the How we work background, for choosing between them. */
export function MarkVariants({ variant }: { variant: MarkVariant }) {
  useFonts()
  return <AbsoluteFill>
    <Background always />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Mark3D variant={variant} size={420} />
    </AbsoluteFill>
  </AbsoluteFill>
}
