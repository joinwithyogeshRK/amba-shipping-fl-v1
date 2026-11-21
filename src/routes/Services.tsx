import { services } from '../content/site'
import { Enquiry } from '../components/Enquiry'
import { useReveal } from '../lib/useReveal'
import './page.css'

export default function Services() {
  useReveal()

  const described = services.filter((s) => s.summary)
  const pending = services.filter((s) => !s.summary)

  return (
    <main id="main" className="page">
      <div className="shell">
        <header className="page__header">
          <h1>Services</h1>
          <p className="page__lede">
            A one-stop solution across vessel management, marine operations and road
            transportation.
          </p>
        </header>
      </div>

      <div className="shell page__section">
        {described.map((service) => (
          <article key={service.slug} id={service.slug} className="service-entry reveal">
            <h2>{service.name}</h2>
            <p>{service.summary}</p>
          </article>
        ))}

        {pending.map((service) => (
          <article key={service.slug} id={service.slug} className="service-entry reveal">
            <h2>{service.name}</h2>
            <p className="service-entry__pending">
              This service is offered by the company, but no description has been published.
              Copy is needed before this page can describe it properly.
            </p>
          </article>
        ))}
      </div>

      <Enquiry />
    </main>
  )
}
