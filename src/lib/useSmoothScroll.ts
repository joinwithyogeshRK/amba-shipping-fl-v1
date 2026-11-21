import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotionNow } from './prefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function getLenis() {
  return lenis
}

/**
 * Wires Lenis to GSAP exactly as Lenis documents it: ScrollTrigger.update is
 * driven by Lenis' scroll event, and Lenis' raf is driven by GSAP's ticker.
 *
 * `autoRaf` defaults to false, so this leaves the page with ONE
 * requestAnimationFrame loop — GSAP's. Enabling autoRaf here would create a
 * second, competing loop.
 *
 * Under prefers-reduced-motion Lenis is not started at all: the browser's own
 * scrolling is left untouched and ScrollTrigger falls back to native events.
 */
export function useSmoothScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (reducedMotionNow()) return

    lenis = new Lenis({
      duration: 1.05,
      // Anchor handling stays with the router effect below: Lenis' built-in
      // handler resolves the target at click time, which is too early for a
      // hash that belongs to a route still being rendered.
      anchors: false,
      // Never smooth-scroll touch devices: it fights the platform's own
      // momentum scrolling and makes the page feel broken.
      syncTouch: false,
    })

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const tick = (time: number) => {
      // GSAP ticks in seconds, Lenis expects milliseconds.
      lenis?.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis?.off('scroll', onScroll)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  // Reset scroll position on route change, but honour in-page anchors.
  //
  // A hash arriving from another route (footer "/services#surveys", nav
  // "/#fleet") points at an element that does not exist yet when the click is
  // handled — React Router has not rendered the new route. So retry across a
  // few frames instead of giving up, which is what produced Lenis' "Target not
  // found" warnings and a link that silently did nothing.
  useEffect(() => {
    if (!hash) {
      lenis?.scrollTo(0, { immediate: true })
      window.scrollTo(0, 0)
      ScrollTrigger.refresh()
      return
    }

    let attempts = 0
    let frame = 0

    const tryScroll = () => {
      const target = document.querySelector(hash)
      if (target) {
        ScrollTrigger.refresh()
        if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -80 })
        else (target as HTMLElement).scrollIntoView({ block: 'start' })
        return
      }
      if (++attempts < 30) frame = requestAnimationFrame(tryScroll)
    }

    frame = requestAnimationFrame(tryScroll)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
}
