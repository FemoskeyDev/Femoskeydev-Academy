import { Composition, registerRoot } from 'remotion'
import { FPS, Reel, REEL_FRAMES } from './Reel'
import { Social, type SocialVariant } from './Social'

const Root = () => <>
  <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="Social" component={Social} durationInFrames={200} fps={FPS} width={1920} height={1008} defaultProps={{ variant: 'studio' as SocialVariant }} />
</>

registerRoot(Root)
