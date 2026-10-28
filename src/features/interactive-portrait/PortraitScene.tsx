import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { portraitConfig } from './portraitConfig'
import type { PortraitController } from './portraitUtils'
import { siteConfig } from '../../data/siteConfig'

export type PortraitInteraction = PortraitController

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  uniform sampler2D uHuman;
  uniform sampler2D uCybernetic;
  uniform vec2 uPointer;
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform vec2 uCyberOffset;
  uniform float uCyberScale;
  uniform float uAspect;
  uniform float uTime;
  uniform float uRadius;
  uniform float uFeather;
  uniform float uDistortion;
  uniform float uNoiseScale;
  uniform float uNoiseSpeed;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uMotionEnergy;
  uniform float uRippleAmplitude;
  uniform float uTangentialAmplitude;
  uniform float uRippleFrequency;
  uniform float uRippleSpeed;
  uniform float uChromaticOffset;
  uniform float uGlowStrength;
  uniform vec3 uMintPrimary;
  uniform vec3 uMintHighlight;
  uniform vec3 uMintSecondary;
  uniform vec3 uTrail[8];
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p *= 2.02;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 imageUv = vUv * uRepeat + uOffset;
    vec2 delta = vUv - uPointer;
    delta.x *= uAspect;
    float distanceToPointer = length(delta);
    vec2 radialDirection = delta / max(distanceToPointer, 0.0001);
    vec2 tangentDirection = vec2(-radialDirection.y, radialDirection.x);
    float envelope = exp(-distanceToPointer * 19.0) * uMotionEnergy;
    float phase = distanceToPointer * uRippleFrequency - uTime * uRippleSpeed;
    float radialWave = sin(phase) * envelope;
    float tangentialWave = cos(phase * 0.78 - 1.1) * envelope;
    vec2 radialUv = vec2(radialDirection.x / uAspect, radialDirection.y);
    vec2 tangentUv = vec2(tangentDirection.x / uAspect, tangentDirection.y);
    vec2 displacement = radialUv * radialWave * uRippleAmplitude + tangentUv * tangentialWave * uTangentialAmplitude;
    vec2 warpedImageUv = imageUv + displacement * uRepeat;
    float chromatic = uChromaticOffset * envelope * (0.45 + abs(radialWave));
    vec4 humanRed = texture2D(uHuman, warpedImageUv + vec2(chromatic, 0.0));
    vec4 humanGreen = texture2D(uHuman, warpedImageUv);
    vec4 humanBlue = texture2D(uHuman, warpedImageUv - vec2(chromatic, 0.0));
    vec4 humanSample = vec4(humanRed.r, humanGreen.g, humanBlue.b, humanGreen.a);
    vec2 cyberneticUv = (imageUv - 0.5) * uCyberScale + 0.5 + uCyberOffset;
    vec4 cyberneticSample = texture2D(uCybernetic, cyberneticUv);
    float organicNoise = (fbm(vUv * uNoiseScale + vec2(uTime * uNoiseSpeed, -uTime * uNoiseSpeed * 0.71)) - 0.5) * uDistortion;
    float revealDistance = length(delta) + organicNoise;
    float localMask = 1.0 - smoothstep(uRadius - uFeather, uRadius + uFeather, revealDistance);
    float reveal = localMask * uReveal * uOpacity;

    vec3 portraitColor = mix(humanSample.rgb, cyberneticSample.rgb, reveal);
    float broadGlow = exp(-distanceToPointer * 8.0) * uMotionEnergy;
    float coreGlow = exp(-distanceToPointer * 32.0) * uMotionEnergy;
    float rippleGlow = exp(-abs(sin(phase)) * 5.0) * envelope;
    float trailGlow = 0.0;
    for (int i = 0; i < 8; i++) {
      vec2 trailDelta = vUv - uTrail[i].xy;
      trailDelta.x *= uAspect;
      float pulse = 0.94 + 0.06 * sin(uTime * 4.0 + float(i) * 0.7);
      trailGlow += uTrail[i].z * exp(-length(trailDelta) * 46.0) * pulse;
    }
    trailGlow = clamp(trailGlow, 0.0, 1.0);
    portraitColor += uMintPrimary * broadGlow * uGlowStrength * 0.42;
    portraitColor += uMintHighlight * coreGlow * uGlowStrength * 0.5;
    portraitColor += uMintSecondary * (rippleGlow * 0.035 + trailGlow * 0.045) * uMotionEnergy;
    gl_FragColor = vec4(portraitColor, mix(humanSample.a, cyberneticSample.a, reveal));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

function PortraitComposite({ interaction, showCybernetic }: { interaction: MutableRefObject<PortraitInteraction>; showCybernetic: boolean }) {
  const { size, gl, invalidate } = useThree()
  const [humanTexture, cyberneticTexture] = useLoader(THREE.TextureLoader, [siteConfig.portrait, showCybernetic ? siteConfig.cyberneticPortrait : siteConfig.portrait])
  const aspect = size.width / Math.max(size.height, 1)
  const cover = useMemo(() => {
    if (aspect < 1) return { repeat: new THREE.Vector2(aspect, 1), offset: new THREE.Vector2((1 - aspect) / 2, 0) }
    const verticalRepeat = 1 / aspect
    return { repeat: new THREE.Vector2(1, verticalRepeat), offset: new THREE.Vector2(0, (1 - verticalRepeat) * (1 - portraitConfig.imagePositionY)) }
  }, [aspect])
  const geometry = useMemo(() => new THREE.PlaneGeometry(size.width, size.height), [size.width, size.height])
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uHuman: { value: humanTexture },
      uCybernetic: { value: cyberneticTexture },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uRepeat: { value: new THREE.Vector2(1, 1) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uCyberOffset: { value: new THREE.Vector2(...portraitConfig.cyberneticOffset) },
      uCyberScale: { value: portraitConfig.cyberneticScale },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uRadius: { value: portraitConfig.revealRadius },
      uFeather: { value: portraitConfig.feather },
      uDistortion: { value: portraitConfig.noiseAmplitude },
      uNoiseScale: { value: portraitConfig.noiseScale },
      uNoiseSpeed: { value: portraitConfig.noiseSpeed },
      uReveal: { value: 0 },
      uOpacity: { value: portraitConfig.revealOpacity },
      uMotionEnergy: { value: 0 },
      uRippleAmplitude: { value: portraitConfig.rippleAmplitude },
      uTangentialAmplitude: { value: portraitConfig.tangentialAmplitude },
      uRippleFrequency: { value: portraitConfig.rippleFrequency },
      uRippleSpeed: { value: portraitConfig.rippleSpeed },
      uChromaticOffset: { value: portraitConfig.chromaticOffset },
      uGlowStrength: { value: portraitConfig.glowStrength },
      uMintPrimary: { value: new THREE.Color(portraitConfig.mintPrimary) },
      uMintHighlight: { value: new THREE.Color(portraitConfig.mintHighlight) },
      uMintSecondary: { value: new THREE.Color(portraitConfig.mintSecondary) },
      uTrail: { value: Array.from({ length: portraitConfig.trailLength }, () => new THREE.Vector3(0.5, 0.5, 0)) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    toneMapped: true,
  }), [humanTexture, cyberneticTexture])

  useEffect(() => {
    humanTexture.colorSpace = THREE.SRGBColorSpace
    cyberneticTexture.colorSpace = THREE.SRGBColorSpace
    humanTexture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
    cyberneticTexture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
    humanTexture.needsUpdate = true
    cyberneticTexture.needsUpdate = true
    invalidate()
  }, [cyberneticTexture, gl, humanTexture, invalidate])
  useEffect(() => () => material.dispose(), [material])

  const displayedPointer = useRef(new THREE.Vector2(0.5, 0.5))

  useFrame(({ clock }, delta) => {
    const state = interaction.current
    const uniforms = material.uniforms
    if (state.reduced || portraitConfig.pointerSmoothing <= 0) displayedPointer.current.set(state.pointer.x, state.pointer.y)
    else {
      const amount = 1 - Math.exp(-portraitConfig.pointerSmoothing * delta)
      displayedPointer.current.x += (state.pointer.x - displayedPointer.current.x) * amount
      displayedPointer.current.y += (state.pointer.y - displayedPointer.current.y) * amount
    }
    uniforms.uPointer.value.copy(displayedPointer.current)
    uniforms.uAspect.value = aspect
    uniforms.uRepeat.value.copy(cover.repeat)
    uniforms.uOffset.value.copy(cover.offset)
    uniforms.uTime.value = state.reduced ? 0 : clock.elapsedTime
    if (state.reduced || !state.dynamic) {
      state.rippleEnergy = 0
      state.trail.fill(0)
    } else {
      state.rippleEnergy *= Math.exp(-portraitConfig.energyDecay * delta)
      for (let index = 0; index < portraitConfig.trailLength; index += 1) {
        const offset = index * 3
        state.trail[offset + 2] *= Math.exp(-portraitConfig.trailDecay * delta)
      }
    }
    uniforms.uMotionEnergy.value = state.dynamic && !state.reduced ? state.rippleEnergy : 0
    const trailUniforms = uniforms.uTrail.value as THREE.Vector3[]
    for (let index = 0; index < portraitConfig.trailLength; index += 1) {
      const offset = index * 3
      trailUniforms[index].set(state.trail[offset], state.trail[offset + 1], state.trail[offset + 2])
    }
    const revealTarget = showCybernetic && state.mode === 'cursor-reveal' ? 1 : 0
    uniforms.uReveal.value = state.reduced
      ? revealTarget
      : THREE.MathUtils.damp(uniforms.uReveal.value, revealTarget, 1 / portraitConfig.transitionSeconds, delta)
    const transitionActive = Math.abs(uniforms.uReveal.value - revealTarget) > 0.001
    const trailActive = state.dynamic && !state.reduced && state.rippleEnergy > 0.006
    if (!state.reduced && (transitionActive || trailActive)) invalidate()
  })

  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}

function RendererLifecycle({ interaction, onUnavailable }: { interaction: MutableRefObject<PortraitInteraction>; onUnavailable: () => void }) {
  const { gl, invalidate } = useThree()
  useEffect(() => {
    const canvas = gl.domElement
    const controller = interaction.current
    controller.invalidate = invalidate
    const handleContextLoss = (event: Event) => {
      event.preventDefault()
      onUnavailable()
    }
    canvas.addEventListener('webglcontextlost', handleContextLoss)
    return () => {
      controller.invalidate = undefined
      canvas.removeEventListener('webglcontextlost', handleContextLoss)
    }
  }, [gl, interaction, invalidate, onUnavailable])
  return null
}

export function PortraitScene({ interaction, onUnavailable, showCybernetic = true }: { interaction: MutableRefObject<PortraitInteraction>; onUnavailable: () => void; showCybernetic?: boolean }) {
  return <Canvas className="portrait-canvas" orthographic camera={{ position: [0, 0, 2], zoom: 1 }} dpr={[1, 1.75]} frameloop="demand" gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} fallback={<span aria-hidden="true"/>}>
    <RendererLifecycle interaction={interaction} onUnavailable={onUnavailable}/>
    <Suspense fallback={null}><PortraitComposite interaction={interaction} showCybernetic={showCybernetic}/></Suspense>
  </Canvas>
}
