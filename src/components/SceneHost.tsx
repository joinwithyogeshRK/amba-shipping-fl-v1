import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from '../lib/scrollState'
import { disableWebGL, hasWebGL } from '../lib/webgl'
import { usePrefersReducedMotion } from '../lib/prefersReducedMotion'
import './scene-host.css'

// Three.js and the scene are a large payload. They are fetched only after the
// page has painted, so the headline, copy and calls to action are readable
// immediately and are never blocked on WebGL.
const HeroScene = lazy(() => import('../three/HeroScene'))

/**
 * Static maritime fallback.
 *
 * Shown when WebGL is unavailable, while the scene chunk loads, and as the
 * permanent treatment if the scene fails. It is a real composition rather than
 * an empty box — a horizon, a sea band and a low sun — so the hero still reads
 * as the sea.
 */
function StaticSea() {
  return (
    <div className="scene-fallback" aria-hidden="true">
      <div className="scene-fallback__sky" />
      <div className="scene-fallback__sun" />
      <div className="scene-fallback__sea" />
    </div>
  )
}

/**
 * Owns the one persistent canvas for the whole page and the single
 * ScrollTrigger that drives it.
 *
 * The canvas is fixed behind the content, so it never participates in layout
 * and cannot cause a shift when it mounts.
 */
export function SceneHost({ zoneId }: { zoneId: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const [webgl, setWebgl] = useState(false)
  const [active, setActive] = useState(true)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    setWebgl(hasWebGL())
  }, [])

  // Let the page style itself around which treatment is actually on screen.
  useEffect(() => {
    document.documentElement.dataset.scene = webgl ? 'webgl' : 'fallback'
  }, [webgl])

  // A lost GL context is WebGL failing mid-session — a real possibility when a
  // laptop switches GPUs or a driver resets. Fall back permanently rather than
  // leaving a frozen last frame on screen.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const onLost = (event: Event) => {
      event.preventDefault()
      disableWebGL()
      setWebgl(false)
      setActive(false)
    }
    host.addEventListener('webglcontextlost', onLost, true)
    return () => host.removeEventListener('webglcontextlost', onLost, true)
  }, [webgl])

  useEffect(() => {
    const zone = document.getElementById(zoneId)
    const wrap = wrapRef.current
    if (!zone || !wrap) return

    // Under reduced motion the scene holds its opening composition: no scrubbed
    // camera travel at all.
    if (reduced) {
      scrollState.progress = 0
      gsap.set(wrap, { opacity: 1 })
      return
    }

    const fadeTo = gsap.quickTo(wrap, 'opacity', { duration: 0.35, ease: 'none' })

    // Progress is measured from the zone's own rect on every update rather than
    // taken from the trigger's own progress. The fleet section pins, which
    // changes the document height underneath this trigger; reading the rect
    // live means the storyboard stays correct whatever else on the page
    // resizes, with no dependency on refresh ordering.
    const readProgress = () => {
      const rect = zone.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      if (travel <= 0) return 0
      return gsap.utils.clamp(0, 1, -rect.top / travel)
    }

    const trigger = ScrollTrigger.create({
      trigger: zone,
      // Span the whole time any part of the zone is near the viewport, so the
      // handler keeps firing through the pinned stretch.
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => {
        const progress = readProgress()
        scrollState.progress = progress

        // Hand the page back to flat content right at the boundary. The host's
        // own navy ground stays put underneath, so this reads as the sea going
        // quiet rather than as the scene disappearing.
        const opacity = 1 - gsap.utils.clamp(0, 1, (progress - 0.95) / 0.05)
        scrollState.canvasOpacity = opacity
        fadeTo(opacity)

        const shouldRender = opacity > 0.02
        setActive((prev) => (prev === shouldRender ? prev : shouldRender))
      },
      onLeave: () => setActive(false),
      onLeaveBack: () => setActive(true),
      onEnterBack: () => setActive(true),
    })

    return () => {
      trigger.kill()
    }
  }, [zoneId, reduced])

  return (
    // Two layers on purpose. The outer host keeps a solid deep-navy ground that
    // never fades, so when the scene itself fades out at the end of the
    // storyboard the page lands on navy rather than exposing the light body
    // background through the still-dark section above it.
    <div className="scene-host" aria-hidden="true" ref={hostRef}>
      <div className="scene-host__layer" ref={wrapRef}>
        {webgl ? (
          <Suspense fallback={<StaticSea />}>
            <HeroScene active={active} still={reduced} />
          </Suspense>
        ) : (
          <StaticSea />
        )}
      </div>
    </div>
  )
}
