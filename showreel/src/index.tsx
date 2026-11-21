import { Composition, registerRoot } from 'remotion'
import { FPS, Reel, REEL_FRAMES } from './Reel'

const Root = () => <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} fps={FPS} width={1920} height={1080} />

registerRoot(Root)
