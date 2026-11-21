import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A procedural, stylised offshore support vessel.
 *
 * This is a VISUAL PLACEHOLDER, not a model of any particular ship. It is built
 * from primitives rather than loaded from a GLB so that no licensed asset is
 * implied and no specific vessel is misrepresented as belonging to the company.
 * The general arrangement — bridge forward, long open working deck aft — is the
 * type most numerous in the fleet under technical management, so the silhouette
 * is representative without being a portrait.
 *
 * Replace with a licensed, draco-compressed GLB when one is supplied; see
 * ASSETS.md.
 */

const NAVY = '#16395c'
const TEAL = '#0e7c86'
const STEEL = '#4c5d6e'
const OFF_WHITE = '#dfe5e9'
const DARK = '#071a2b'

function useHullGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    // Side profile, drawn aft-to-forward along the keel then back along the deck.
    shape.moveTo(-5.6, 0.12)
    shape.lineTo(-5.42, 0.0)
    shape.lineTo(3.6, 0.0)
    shape.quadraticCurveTo(5.0, 0.08, 5.3, 0.42)
    shape.lineTo(6.05, 1.08)
    shape.lineTo(5.55, 1.18)
    shape.lineTo(-5.6, 0.98)
    shape.closePath()

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 2.5,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.14,
      bevelSegments: 2,
      curveSegments: 10,
    })
    // Extrusion runs along +Z from the shape plane; centre it on the beam.
    geo.translate(0, 0, -1.25)
    geo.computeVertexNormals()
    return geo
  }, [])
}

type VesselProps = { animate?: boolean }

export function Vessel({ animate = true }: VesselProps) {
  const group = useRef<THREE.Group>(null)
  const hull = useHullGeometry()

  // Gentle, slow motion in a seaway. Amplitudes are small on purpose: a vessel
  // this size does not bob like a dinghy, and heavy motion would read as toylike.
  useFrame(({ clock }) => {
    if (!animate || !group.current) return
    const t = clock.elapsedTime
    group.current.position.y = Math.sin(t * 0.42) * 0.12 - 0.08
    group.current.rotation.z = Math.sin(t * 0.33) * 0.022
    group.current.rotation.x = Math.sin(t * 0.52 + 1.1) * 0.016
  })

  return (
    <group ref={group} name="vessel">
      {/* --- hull ------------------------------------------------------- */}
      <mesh geometry={hull}>
        <meshStandardMaterial color={NAVY} roughness={0.55} metalness={0.15} />
      </mesh>

      {/* boot-top stripe at the waterline */}
      <mesh position={[0.1, 0.17, 0]}>
        <boxGeometry args={[11.1, 0.1, 2.72]} />
        <meshStandardMaterial color={TEAL} roughness={0.6} />
      </mesh>

      {/* --- working deck ----------------------------------------------- */}
      <mesh position={[-1.4, 1.12, 0]}>
        <boxGeometry args={[8.2, 0.1, 2.3]} />
        <meshStandardMaterial color={STEEL} roughness={0.9} />
      </mesh>

      {/* cargo rails down each side of the open deck */}
      {[-1.12, 1.12].map((z) => (
        <mesh key={z} position={[-1.4, 1.32, z]}>
          <boxGeometry args={[8.2, 0.32, 0.07]} />
          <meshStandardMaterial color={STEEL} roughness={0.85} />
        </mesh>
      ))}

      {/* --- deckhouse, set forward as on a supply vessel ---------------- */}
      <mesh position={[3.35, 1.56, 0]}>
        <boxGeometry args={[2.3, 0.82, 2.25]} />
        <meshStandardMaterial color={OFF_WHITE} roughness={0.7} />
      </mesh>
      <mesh position={[3.45, 2.28, 0]}>
        <boxGeometry args={[1.75, 0.62, 1.95]} />
        <meshStandardMaterial color={OFF_WHITE} roughness={0.7} />
      </mesh>
      {/* bridge glazing */}
      <mesh position={[3.45, 2.38, 0]}>
        <boxGeometry args={[1.78, 0.26, 1.98]} />
        <meshStandardMaterial color={DARK} roughness={0.25} metalness={0.4} />
      </mesh>

      {/* --- mast and exhausts ------------------------------------------- */}
      <mesh position={[2.85, 3.0, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 1.1, 8]} />
        <meshStandardMaterial color={STEEL} roughness={0.8} />
      </mesh>
      {[-0.62, 0.62].map((z) => (
        <mesh key={z} position={[2.35, 2.2, z]}>
          <cylinderGeometry args={[0.16, 0.18, 1.3, 10]} />
          <meshStandardMaterial color={NAVY} roughness={0.65} />
        </mesh>
      ))}

      {/* --- deck crane over the working deck ----------------------------- */}
      <group position={[0.65, 1.18, 0.0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 0.8, 10]} />
          <meshStandardMaterial color={TEAL} roughness={0.6} />
        </mesh>
        <mesh position={[-1.25, 1.12, 0]} rotation={[0, 0, 0.46]}>
          <boxGeometry args={[3.0, 0.14, 0.16]} />
          <meshStandardMaterial color={OFF_WHITE} roughness={0.75} />
        </mesh>
      </group>
    </group>
  )
}
