import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SceneHost } from '../components/SceneHost'
import { Enquiry } from '../components/Enquiry'
import { about, fleet, roadLogistics, services } from '../content/site'
import { useReveal } from '../lib/useReveal'
import { reducedMotionNow } from '../lib/prefersReducedMotion'
import './home.css'

const SCENE_ZONE = 'scene-zone'

/* ========================================================================== */

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="shell hero__inner">
        <div className="hero__scrim">
          <h1 id="hero-h" className="hero__headline">
            Technical management at sea.
            <br />
            Project logistics on land.
          </h1>
          <p className="hero__sub">
            AMBA Shipping &amp; Logistics manages vessels on behalf of their owners and moves
            project cargo overland for domestic clients, from our office in CBD Belapur, Navi
            Mumbai.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/services">
              Explore services
            </Link>
            <Link className="button button--ghost" to="/contact">
              Contact our team
            </Link>
          </div>

          {/* The scene is a stylised stand-in, and says so. Kept in flow under
              the calls to action rather than pinned to the corner, where a tall
              hero pushed it below the fold. Hidden when the static fallback is
              showing, since there is then no vessel to caption. */}
          <p className="hero__disclosure">
            Illustrative vessel. A stylised placeholder, not a ship under management.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ========================================================================== */

function Introduction() {
  return (
    <section className="band" aria-labelledby="intro-h">
      <div className="shell"><div className="band__scrim">
        <h2 id="intro-h" className="reveal">
          Who we are
        </h2>
        <p className="band__lede reveal">{about.lede}</p>
        <div className="band__cols">
          <div className="reveal">
            <h3 className="band__sub">In the marine industry</h3>
            <p>{about.marine}</p>
          </div>
          <div className="reveal">
            <h3 className="band__sub">On the road</h3>
            <p>{about.road}</p>
          </div>
        </div>
      </div></div>
    </section>
  )
}

/* ========================================================================== */

function MarineServices() {
  return (
    <section className="band" id="marine" aria-labelledby="marine-h">
      <div className="shell"><div className="band__scrim">
        <h2 id="marine-h" className="reveal">
          Marine services and vessel management
        </h2>
        <p className="band__lede reveal">{about.commitment}</p>

        <ul className="ruled-list">
          {services.slice(0, 7).map((service) => (
            <li key={service.slug} className="ruled-list__item reveal">
              <h3 className="ruled-list__name">{service.name}</h3>
              {service.summary ? (
                <p className="ruled-list__text">{service.summary}</p>
              ) : (
                <p className="ruled-list__text ruled-list__text--pending">
                  Offered by the company. No published description yet.
                </p>
              )}
            </li>
          ))}
        </ul>

        <Link className="button button--ghost" to="/services">
          See all services
        </Link>
      </div></div>
    </section>
  )
}

/* ========================================================================== */

/**
 * The fleet section is a register, not a grid of cards: the content is a list of
 * counts, so it is set as a ruled table with a proportional bar and tabular
 * figures. On desktop it holds still for one extra viewport and steps through
 * the categories.
 *
 * The hold is CSS `position: sticky`, not a GSAP pin. A pin rewrites the
 * document height by injecting a spacer, which made every scroll position
 * downstream of it shift on resize — a window resize mid-section jumped the
 * page by over a thousand pixels. Sticky costs the browser nothing, survives
 * resize, and collapses to normal flow on narrow screens with a media query
 * rather than a JS branch.
 */
function FleetRegister() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const total = fleet.categories.reduce((sum, c) => sum + c.count, 0)
  const max = Math.max(...fleet.categories.map((c) => c.count))

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (reducedMotionNow()) return
    if (window.matchMedia('(max-width: 60rem)').matches) return

    const count = fleet.categories.length

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => {
        // Measured from the section's own rect, so it stays correct no matter
        // what else on the page changes height.
        const rect = section.getBoundingClientRect()
        const travel = rect.height - window.innerHeight
        if (travel <= 0) return
        const progress = Math.min(1, Math.max(0, -rect.top / travel))
        const index = Math.min(count - 1, Math.floor(progress * count))
        setActiveIndex((prev) => (prev === index ? prev : index))
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <section className="band fleet" id="fleet" ref={sectionRef} aria-labelledby="fleet-h">
      <div className="fleet__hold">
      <div className="shell"><div className="band__scrim band__scrim--wide">
        <h2 id="fleet-h" className="reveal">
          Vessels under technical management
        </h2>
        <p className="band__lede reveal">
          These vessels are operated under technical management agreements on behalf of their
          owners. AMBA Shipping &amp; Logistics is not described as their owner.
        </p>

        <table className="register">
          <caption className="register__caption">
            Fleet categories as published by the company, {fleet.asPublished}. Counts require
            confirmation before being treated as current.
          </caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col" className="register__count-head">Vessels</th>
            </tr>
          </thead>
          <tbody>
            {fleet.categories.map((category, index) => (
              <tr
                key={category.name}
                className={index === activeIndex ? 'is-active' : undefined}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <th scope="row">
                  {category.name}
                  {category.duplicateSuspect && (
                    <span className="register__flag" title="Possible duplicate category in the source data">
                      needs confirmation
                    </span>
                  )}
                </th>
                <td className="register__count tabular">
                  <span
                    className="register__bar"
                    style={{ inlineSize: `${(category.count / max) * 100}%` }}
                    aria-hidden="true"
                  />
                  <span className="register__figure">{category.count}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">As listed</th>
              <td className="register__count tabular">
                <span className="register__figure">{total}</span>
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="register__note">
          Two categories in the source list overlap — “accommodation / pipelay / cable-laying
          barges” and “cable / pipe-laying accommodation barges”, three vessels each. If they are
          the same three vessels counted twice, the figure above is 22 rather than {total}.
        </p>
      </div></div>
      </div>
    </section>
  )
}

/* ========================================================================== */

/**
 * Road logistics leaves the 3D behind deliberately: the brief calls for a clean
 * HTML-led section, and a second spectacle here would compete with the hero
 * rather than support it. The only graphic is a route line, which is what the
 * content is actually about.
 */
function RoadLogistics() {
  return (
    <section className="road section" id="road" aria-labelledby="road-h">
      <div className="shell">
        <div className="road__head">
          <h2 id="road-h" className="reveal">Road logistics</h2>
          <p className="road__lede reveal">{about.road}</p>
        </div>

        <svg className="road__route reveal" viewBox="0 0 960 64" role="img" aria-label="Origin to destination route">
          <line x1="16" y1="32" x2="944" y2="32" stroke="var(--rule-strong)" strokeWidth="1" />
          <line
            x1="16" y1="32" x2="944" y2="32"
            stroke="var(--teal)" strokeWidth="2"
            strokeDasharray="6 10" strokeLinecap="round"
          />
          <circle cx="16" cy="32" r="5" fill="var(--teal)" />
          <circle cx="944" cy="32" r="5" fill="none" stroke="var(--teal)" strokeWidth="2" />
          <text x="16" y="56" className="road__route-label" textAnchor="start">Origin</text>
          <text x="944" y="56" className="road__route-label" textAnchor="end">Destination</text>
        </svg>

        <ul className="ruled-list ruled-list--light">
          {roadLogistics.map((item) => (
            <li key={item.name} className="ruled-list__item reveal">
              <h3 className="ruled-list__name">{item.name}</h3>
              <p className="ruled-list__text">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ========================================================================== */

/**
 * Strengths are qualitative on purpose. The brief forbids invented statistics,
 * and the company publishes no verifiable figures — no founding year, no client
 * count, no certifications. So this section says what can be supported and
 * nothing more.
 */
function Strengths() {
  const points = [
    {
      title: 'Seafarers run the company',
      body: 'The promoters and management team include master mariners and chief engineers, so technical decisions are taken by people who have held the roles at sea.',
    },
    {
      title: 'Two disciplines, one office',
      body: 'Marine management and road logistics are run from the same Navi Mumbai office, so a cargo that arrives by sea and leaves by road stays with one team.',
    },
    {
      title: 'Work shaped to the client',
      body: 'Services are arranged per customer rather than sold as fixed packages, for national and international owners alike.',
    },
    {
      title: 'Accountable on every job',
      body: about.commitment,
    },
  ]

  return (
    <section className="strengths section" aria-labelledby="strengths-h">
      <div className="shell">
        <h2 id="strengths-h" className="reveal">What working with us is like</h2>
        <div className="strengths__grid">
          {points.map((point) => (
            <div key={point.title} className="strengths__item reveal">
              <h3 className="strengths__title">{point.title}</h3>
              <p>{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ========================================================================== */

export default function Home() {
  useReveal()

  // The fleet section pins, which adds a viewport of spacing to the page and
  // therefore moves the end of every trigger created before it — including the
  // scene host's, which is mounted earlier in the tree. Web fonts landing can
  // shift things again. Recalculate once both have settled, or the scene fades
  // out partway through the storyboard instead of at the end of it.
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <SceneHost zoneId={SCENE_ZONE} />
      <main id="main">
        <div id={SCENE_ZONE} className="scene-zone on-dark" data-ground="dark">
          <Hero />
          <Introduction />
          <MarineServices />
          <FleetRegister />
        </div>
        <RoadLogistics />
        <Strengths />
        <Enquiry />
      </main>
    </>
  )
}
