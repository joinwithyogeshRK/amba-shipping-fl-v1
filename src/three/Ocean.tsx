import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A stylised sea surface.
 *
 * Deliberately NOT a physical ocean simulation: four summed sine waves in the
 * vertex shader with analytically derived normals. That keeps the whole surface
 * to one draw call with no render targets, no reflection pass and no FFT, which
 * is what lets the hero stay smooth on an integrated GPU.
 */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  varying float vCrest;

  // One travelling wave: returns height, and accumulates its slope.
  float wave(vec2 p, vec2 dir, float freq, float speed, float amp, inout vec2 slope) {
    float phase = dot(p, dir) * freq + uTime * speed;
    slope += dir * freq * amp * cos(phase);
    return amp * sin(phase);
  }

  void main() {
    vec3 pos = position;
    vec2 p = pos.xy; // plane is authored in XY, rotated to XZ on the mesh
    vec2 slope = vec2(0.0);

    float h = 0.0;
    h += wave(p, normalize(vec2( 1.0,  0.25)), 0.22, 0.55, 0.52 * uAmplitude, slope);
    h += wave(p, normalize(vec2( 0.7, -0.70)), 0.37, 0.80, 0.26 * uAmplitude, slope);
    h += wave(p, normalize(vec2(-0.4,  0.90)), 0.63, 1.15, 0.13 * uAmplitude, slope);
    h += wave(p, normalize(vec2( 0.9,  0.45)), 1.35, 1.70, 0.05 * uAmplitude, slope);

    pos.z += h;

    // Normal from the accumulated slope of the height field.
    vec3 n = normalize(vec3(-slope.x, -slope.y, 1.0));

    vCrest = smoothstep(0.25, 0.85, h / max(uAmplitude, 0.001));

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vPositionW = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * n);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uCrest;
  uniform vec3 uSunDir;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  varying float vCrest;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPositionW);

    // Steeper view angles show the deep colour; grazing angles lift toward sky.
    float facing = clamp(dot(n, viewDir), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 3.0);

    vec3 base = mix(uDeep, uShallow, fresnel);

    // A single soft specular lobe standing in for a low sun.
    vec3 h = normalize(normalize(uSunDir) + viewDir);
    float spec = pow(clamp(dot(n, h), 0.0, 1.0), 48.0);

    vec3 color = base + uCrest * vCrest * 0.22 + vec3(spec) * 0.35;

    // Fade the far field into the fog colour so the plane has no visible edge.
    float dist = length(vPositionW.xz);
    float horizon = smoothstep(42.0, 95.0, dist);
    color = mix(color, uShallow, horizon * 0.85);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

type OceanProps = {
  /** Lower segment counts on weak hardware. */
  segments?: number
  amplitude?: number
  /** Frozen seas when the visitor asked for reduced motion. */
  animate?: boolean
}

export function Ocean({ segments = 128, amplitude = 1, animate = true }: OceanProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: amplitude },
      uDeep: { value: new THREE.Color('#06253c') },
      uShallow: { value: new THREE.Color('#13556a') },
      uCrest: { value: new THREE.Color('#5fb6bf') },
      uSunDir: { value: new THREE.Vector3(-0.4, 0.55, 0.8) },
    }),
    [amplitude],
  )

  useFrame((_, delta) => {
    if (!animate || !materialRef.current) return
    materialRef.current.uniforms.uTime.value += delta
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow={false}>
      <planeGeometry args={[220, 220, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}
