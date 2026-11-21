import { Link } from 'react-router-dom'
import './page.css'

export default function NotFound() {
  return (
    <main id="main" className="page notfound">
      <div className="shell page__header">
        <h1>That page isn’t here</h1>
        <p className="page__lede">
          The address you followed doesn’t match anything on the site. The main sections are below.
        </p>
        <ul className="notfound__links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>
    </main>
  )
}
