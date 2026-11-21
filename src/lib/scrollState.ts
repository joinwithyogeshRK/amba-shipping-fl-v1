/**
 * Shared scroll state for the 3D scene.
 *
 * GSAP writes into this object from a ScrollTrigger onUpdate; the R3F render
 * loop reads it inside useFrame. It is a plain mutable object on purpose —
 * routing per-frame scroll values through React state would re-render the tree
 * at 60fps, which is the single biggest performance mistake in a scroll-driven
 * 3D page.
 */
export const scrollState = {
  /** Normalised 0..1 progress across the whole 3D storyboard. */
  progress: 0,
  /** 0..1 opacity target for the canvas; lets us stop rendering when hidden. */
  canvasOpacity: 1,
  /** Index of the vessel category highlighted during the pinned sequence. */
  categoryIndex: 0,
}

export function resetScrollState() {
  scrollState.progress = 0
  scrollState.canvasOpacity = 1
  scrollState.categoryIndex = 0
}
