import { Link } from 'react-router-dom'
import { company, services } from '../content/site'
import './footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer on-dark" data-ground="dark">
      <div className="shell">
        <hr className="rule" />
        <div className="footer__grid">
          <div className="footer__brand">
            <img src="/brand/aslpl-logo-knockout.png" alt="" width={132} height={46} />
            <p className="footer__legal-name">{company.legalName}</p>
            <address className="footer__address">
              {company.address.line1}
              <br />
              {company.address.line2}
              <br />
              {company.address.city}, {company.address.country}
            </address>
          </div>

          <div>
            <h2 className="footer__heading">Reach us</h2>
            <ul className="footer__list">
              <li className="tabular">
                <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
              </li>
              <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
              <li><a href={`mailto:${company.emailOperations}`}>{company.emailOperations}</a></li>
            </ul>
          </div>

          <div>
            <h2 className="footer__heading">Services</h2>
            <ul className="footer__list">
              {services.slice(0, 6).map((service) => (
                <li key={service.slug}>
                  <Link to={`/services#${service.slug}`}>{service.name}</Link>
                </li>
              ))}
              <li><Link to="/services">All services</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="footer__heading">Company</h2>
            <ul className="footer__list">
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/#fleet">Vessels under management</Link></li>
              <li><Link to="/#road">Road logistics</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <hr className="rule" />
        <p className="footer__base">
          © {year} {company.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
