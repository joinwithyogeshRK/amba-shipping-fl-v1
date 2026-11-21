import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotionNow } from './prefersReducedMotion'

/**
 * One restrained reveal for elements marked `.reveal`.
 *
 * Batched rather than one ScrollTrigger per element, and skipped entirely under
 * reduced motion — in which case the CSS leaves the content visible.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    if (reducedMotionNow()) return

    document.documentElement.classList.add('js-ready')
    const items = gsap.utils.toArray<HTMLElement>('.reveal:not(.is-in)')
    if (!items.length) return

    const batch = ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.06,
          onComplete: () => els.forEach((el) => el.classList.add('is-in')),
        }),
    })

    // Safety net. Reveals are decoration, but they gate visibility: if the
    // batch failed to fire, whole sections — including the enquiry form — would
    // stay at opacity 0. Anything still hidden after a short grace period gets
    // shown regardless.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)').forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight * 1.5) {
          gsap.set(el, { opacity: 1, y: 0 })
          el.classList.add('is-in')
        }
      })
    }, 2500)

    return () => {
      window.clearTimeout(failsafe)
      batch.forEach((t) => t.kill())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
