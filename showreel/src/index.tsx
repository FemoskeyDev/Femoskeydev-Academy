import { Composition, registerRoot } from 'remotion'
import { FPS, Reel, REEL_FRAMES } from './Reel'
import { Social, type SocialVariant } from './Social'
import { HOW_FRAMES, HowWeWork } from './HowWeWork'
import { MarkVariants } from './MarkVariants'
import { Cover } from './Cover'
import { CoverLayer } from './CoverLayer'
import type { MarkVariant } from './Mark3D'

const Root = () => <>
  <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="HowWeWork" component={HowWeWork} durationInFrames={HOW_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="HowWeWorkVertical" component={HowWeWork} durationInFrames={HOW_FRAMES} fps={FPS} width={1080} height={1920} />
  <Composition id="MarkVariants" component={MarkVariants} durationInFrames={60} fps={FPS} width={1920} height={1080} defaultProps={{ variant: 'glossy' as MarkVariant }} />
  <Composition id="Cover" component={Cover} durationInFrames={60} fps={FPS} width={1080} height={1920} />
  <Composition id="CoverLayer" component={CoverLayer} durationInFrames={60} fps={FPS} width={1080} height={1920} defaultProps={{ layer: 'mark' as 'mark' | 'grid' }} />
  <Composition id="Social" component={Social} durationInFrames={200} fps={FPS} width={1920} height={1008} defaultProps={{ variant: 'studio' as SocialVariant }} />
</>

registerRoot(Root)
