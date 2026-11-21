import { about, company, notices } from '../content/site'
import { Enquiry } from '../components/Enquiry'
import { useReveal } from '../lib/useReveal'
import './page.css'

export default function About() {
  useReveal()

  return (
    <main id="main" className="page">
      <div className="shell">
        <header className="page__header">
          <h1>About us</h1>
          <p className="page__lede">{about.lede}</p>
        </header>
      </div>

      <div className="shell page__section prose">
        <h2 className="reveal">How the company is run</h2>
        <div className="reveal">
          <h3>In the marine industry</h3>
          <p>{about.marine}</p>
          <h3>On the road</h3>
          <p>{about.road}</p>
          <h3>Our commitment</h3>
          <p>{about.commitment}</p>
        </div>
      </div>

      <div className="shell page__section">
        <h2 className="reveal">Company notices</h2>
        <p className="page__lede reveal">
          Published by the company and reproduced here. Both items are undated at source and need
          confirming before they are treated as current.
        </p>
        <ul className="notice-list reveal">
          {notices.map((notice) => (
            <li key={notice.text}>
              <p>{notice.text}</p>
              <small>{notice.note}</small>
            </li>
          ))}
        </ul>
      </div>

      <div className="shell page__section prose">
        <h2 className="reveal">Where we are</h2>
        <address className="reveal" style={{ fontStyle: 'normal', color: 'var(--ink-soft)' }}>
          {company.legalName}
          <br />
          {company.address.line1}, {company.address.line2}
          <br />
          {company.address.city}, {company.address.country}
        </address>
      </div>

      <Enquiry />
    </main>
  )
}
