import { Enquiry } from '../components/Enquiry'
import { useReveal } from '../lib/useReveal'
import './page.css'

export default function Contact() {
  useReveal()

  return (
    <main id="main" className="page">
      <div className="shell">
        <header className="page__header">
          <h1>Contact</h1>
          <p className="page__lede">
            Our operations desk handles vessel and cargo enquiries. Telephone and email reach us
            directly.
          </p>
        </header>
      </div>
      <Enquiry />
    </main>
  )
}
