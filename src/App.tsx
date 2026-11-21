import { Navigate, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { useSmoothScroll } from './lib/useSmoothScroll'
import Home from './routes/Home'
import Services from './routes/Services'
import About from './routes/About'
import Contact from './routes/Contact'
import NotFound from './routes/NotFound'

/**
 * Legacy URL map.
 *
 * The previous site advertised these paths in its navigation and they are the
 * addresses any bookmark or inbound link will carry. Every one of them 404s on
 * the live site today, so redirecting them is a straight improvement. The
 * server-side equivalents live in public/.htaccess — these client-side routes
 * are the fallback for anything that reaches the app directly.
 */
const LEGACY: Array<[string, string]> = [
  ['/default.aspx', '/'],
  ['/index.html', '/'],
  ['/about.aspx', '/about'],
  ['/services.aspx', '/services'],
  ['/contact.aspx', '/contact'],
  ['/gallery.html', '/'],
  ['/sitemap.aspx', '/'],
  ['/portfolio.aspx', '/services'],
]

export default function App() {
  useSmoothScroll()

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {LEGACY.map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}
