import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Ocean } from './Ocean'
import { Vessel } from './Vessel'
import { scrollState } from '../lib/scrollState'
import { isLowPowerDevice } from '../lib/webgl'

/* ---------------------------------------------------------------------------
   Camera storyboard.

   Each keyframe pins a camera position and look-at target to a point on the
   normalised scroll progress. Everything between keyframes is interpolated, so
   the whole 3D sequence is described by this one table — there is no second
   animation system competing for the camera.
   ------------------------------------------------------------------------- */
type Keyframe = {
  at: number
  pos: [number, number, number]
  target: [number, number, number]
  /**
   * Camera pan, in radians, applied after the look-at.
   *
   * Page copy occupies the left of the frame throughout, so the vessel has to
   * compose to the right of centre. Panning the camera is the reliable way to
   * do that: nudging the look-at target sideways moves the subject in whichever
   * screen direction the current orbit angle happens to map to, which reverses
   * as the camera swings around the hull.
   */
  yaw: number
}

const STORYBOARD: Keyframe[] = [
  // Opening: calm three-quarter view, vessel small enough to leave the
  // headline uncrowded.
  { at: 0.0, pos: [16.5, 6.5, 15.5], target: [0, 1.0, 0], yaw: 0.0 },
  // Introduction: ease closer and drop toward the waterline.
  { at: 0.22, pos: [14.0, 5.4, 14.0], target: [0, 1.2, 0], yaw: 0.1 },
  // Marine services: rotate to broadside.
  { at: 0.44, pos: [2.0, 4.4, 21.0], target: [0, 1.3, 0], yaw: 0.17 },
  // Vessel management: travel aft along the working deck.
  { at: 0.68, pos: [-12.0, 4.2, 16.0], target: [-1.0, 1.2, 0], yaw: 0.17 },
  // Settle before the scene hands off to flat content.
  { at: 1.0, pos: [-16.0, 5.8, 18.0], target: [-1.0, 1.4, 0], yaw: 0.13 },
]

function sampleStoryboard(p: number, outPos: THREE.Vector3, outTarget: THREE.Vector3): number {
  const clamped = THREE.MathUtils.clamp(p, 0, 1)
  let a = STORYBOARD[0]
  let b = STORYBOARD[STORYBOARD.length - 1]

  for (let i = 0; i < STORYBOARD.length - 1; i++) {
    if (clamped >= STORYBOARD[i].at && clamped <= STORYBOARD[i + 1].at) {
      a = STORYBOARD[i]
      b = STORYBOARD[i + 1]
      break
    }
  }

  const span = b.at - a.at
  const t = span <= 0 ? 0 : (clamped - a.at) / span
  // Smootherstep keeps the camera from snapping direction at keyframe joins.
  const e = t * t * t * (t * (t * 6 - 15) + 10)

  outPos.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], e),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], e),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], e),
  )
  outTarget.set(
    THREE.MathUtils.lerp(a.target[0], b.target[0], e),
    THREE.MathUtils.lerp(a.target[1], b.target[1], e),
    THREE.MathUtils.lerp(a.target[2], b.target[2], e),
  )

  return THREE.MathUtils.lerp(a.yaw, b.yaw, e)
}

/**
 * Drives the camera from scroll progress.
 *
 * Reads `scrollState` — a plain mutable object GSAP writes to — rather than
 * React state, so scrolling never triggers a re-render.
 */
function CameraRig({ animate }: { animate: boolean }) {
  const { camera } = useThree()
  const desiredPos = useMemo(() => new THREE.Vector3(), [])
  const desiredTarget = useMemo(() => new THREE.Vector3(), [])
  const currentTarget = useRef(new THREE.Vector3(0, 1.1, 0))
  const currentYaw = useRef(0)

  useFrame((_, delta) => {
    const desiredYaw = sampleStoryboard(
      animate ? scrollState.progress : 0,
      desiredPos,
      desiredTarget,
    )

    if (animate) {
      // Critically-damped follow: smooth under fast scrolling, no overshoot.
      const k = 1 - Math.pow(0.0015, delta)
      camera.position.lerp(desiredPos, k)
      currentTarget.current.lerp(desiredTarget, k)
      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, desiredYaw, k)
    } else {
      camera.position.copy(desiredPos)
      currentTarget.current.copy(desiredTarget)
      currentYaw.current = desiredYaw
    }

    camera.lookAt(currentTarget.current)
    // Pan left so the subject sits right of the copy.
    camera.rotateY(currentYaw.current)
  })

  return null
}

type HeroSceneProps = {
  /** When false the render loop is stopped entirely. */
  active: boolean
  /** Reduced motion: a still composition, no scroll travel, no bobbing. */
  still: boolean
}

export default function HeroScene({ active, still }: HeroSceneProps) {
  const lowPower = isLowPowerDevice()

  return (
    <Canvas
      // Stopping the loop outright is the only way to actually give the GPU
      // back; hiding the canvas alone would keep it rendering every frame.
      frameloop={active && !still ? 'always' : 'demand'}
      // Capped hard. Retina at dpr 3 quadruples fragment work for no visible
      // gain on a scene this soft.
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      gl={{
        antialias: !lowPower,
        powerPreference: 'high-performance',
        alpha: true,
      }}
      camera={{ fov: 38, near: 0.1, far: 400, position: [16.5, 6.5, 15.5] }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#071a2b']} />
      <fog attach="fog" args={['#0b2d44', 38, 115]} />

      {/* A low sun off the bow, plus enough fill to keep the hull readable.
          No shadow maps: at this scale they cost more than they show. */}
      <hemisphereLight args={['#9fd4e2', '#061c2c', 0.95]} />
      <directionalLight position={[-9, 11, 7]} intensity={2.1} color="#fff3dd" />
      <directionalLight position={[8, 4, -6]} intensity={0.35} color="#5fb6bf" />

      <CameraRig animate={!still} />
      <Ocean segments={lowPower ? 64 : 128} amplitude={still ? 0.45 : 1} animate={!still} />
      <Vessel animate={!still} />
    </Canvas>
  )
}
