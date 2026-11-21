/**
 * Feature-detect WebGL before mounting any Three.js code.
 *
 * A failed detection is not an error state for the visitor: the page falls back
 * to a static maritime treatment and every word of content stays readable.
 */
let cached: boolean | null = null

/** Force the static fallback for the rest of the session (e.g. context loss). */
export function disableWebGL() {
  cached = false
}

export function hasWebGL(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return (cached = false)

  // QA escape hatch: ?nowebgl forces the static fallback so the no-WebGL path
  // can be checked on a machine that has WebGL. Documented in README.
  if (new URLSearchParams(window.location.search).has('nowebgl')) {
    return (cached = false)
  }

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    cached = Boolean(gl)
  } catch {
    cached = false
  }
  return cached
}

/**
 * Coarse capability check used to drop the device pixel ratio and shorten the
 * scene on weaker hardware. Deliberately conservative — it only looks at signals
 * the browser gives away cheaply.
 */
export function isLowPowerDevice(): boolean {
  if (typeof window === 'undefined') return true
  const cores = navigator.hardwareConcurrency ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 860
  return cores <= 4 || (coarse && narrow)
}
