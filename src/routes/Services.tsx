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
      </div>

      {/* Named, not described — see the note in Home.tsx. */}
      <div className="shell page__section">
        <h2 className="reveal">Also provided</h2>
        <p className="page__lede reveal">
          Each of these is arranged to the client’s requirement rather than sold as a fixed
          package. Our operations desk will set out scope and availability.
        </p>
        <ul className="also__list also__list--page reveal">
          {pending.map((service) => (
            <li key={service.slug} id={service.slug}>
              {service.name}
            </li>
          ))}
        </ul>
      </div>

      <Enquiry />
    </main>
  )
}
