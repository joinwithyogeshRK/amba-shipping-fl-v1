import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { company, nav as navItems } from '../content/site'
import './nav.css'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)

  // The bar has to match whatever is actually behind it, and the page alternates
  // grounds: dark scene, light road and strengths, dark enquiry and footer. So
  // rather than guess from a scroll distance, read the ground directly —
  // sections that paint dark are marked data-ground="dark", and the bar stays
  // transparent whenever one of them is under its midline.
  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const midline = 36
      const darkGrounds = document.querySelectorAll<HTMLElement>('[data-ground="dark"]')
      let overDark = false
      darkGrounds.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top <= midline && rect.bottom >= midline) overDark = true
      })
      setSolid(!overDark)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  useEffect(() => setOpen(false), [pathname])

  // Escape closes the mobile panel and returns focus to the toggle.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`nav ${solid ? 'nav--solid' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner shell">
        <Link to="/" className="nav__brand" aria-label={`${company.shortName} — home`}>
          <img src="/brand/aslpl-logo-knockout.png" alt="" width={120} height={42} />
          <span className="visually-hidden">{company.legalName}</span>
        </Link>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-panel"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <div className="nav__panel" id="nav-panel" ref={panelRef}>
          <nav aria-label="Main">
            <ul className="nav__list">
              {navItems.map((item) => (
                <li key={item.href}>
                  {item.href.startsWith('/#') ? (
                    <Link to={item.href} className="nav__link">
                      {item.label}
                    </Link>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) => `nav__link ${isActive ? 'is-current' : ''}`}
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <a className="nav__phone tabular" href={`tel:${company.phoneHref}`}>
            {company.phone}
          </a>
        </div>
      </div>
    </header>
  )
}
