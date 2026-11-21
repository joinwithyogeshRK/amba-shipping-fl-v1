import { useId, useState } from 'react'
import { company } from '../content/site'
import './enquiry.css'

/**
 * The enquiry form always works, and never silently drops a message.
 *
 * Two modes, and the visitor is told which one they are in:
 *
 * 1. With VITE_ENQUIRY_ENDPOINT set, the form POSTs straight to that backend.
 * 2. Without it, submitting composes the enquiry into the visitor's own mail
 *    client, addressed to the operations desk. No server needed, nothing
 *    discarded, and the button says what will happen.
 *
 * What this deliberately never does is the thing the old site did: render a
 * form that posts to "#" and throws the message away.
 */
const ENDPOINT = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Enquiry() {
  const uid = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const configured = Boolean(ENDPOINT)

  function composeMailto(form: HTMLFormElement) {
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const subject = String(data.get('subject') ?? 'Website enquiry')
    const message = String(data.get('message') ?? '')

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Regarding: ${subject}`,
      '',
      message,
    ].join('\n')

    return `mailto:${company.emailOperations}?subject=${encodeURIComponent(
      `Enquiry — ${subject}`,
    )}&body=${encodeURIComponent(body)}`
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    if (!ENDPOINT) {
      window.location.href = composeMailto(form)
      return
    }

    setStatus('sending')
    setError('')

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
      if (!response.ok) throw new Error(`The server returned ${response.status}.`)
      setStatus('sent')
      form.reset()
    } catch (cause) {
      setStatus('error')
      setError(cause instanceof Error ? cause.message : 'The message could not be sent.')
    }
  }

  return (
    <section className="enquiry section on-dark" id="contact" data-ground="dark" aria-labelledby={`${uid}-h`}>
      <div className="shell enquiry__grid">
        <div className="enquiry__intro">
          <h2 id={`${uid}-h`} className="reveal">
            Tell us what you need moved, managed or surveyed
          </h2>
          <p className="reveal enquiry__lede">
            Send the vessel or consignment details and our operations desk will come back to you.
          </p>

          <dl className="enquiry__direct reveal">
            <div>
              <dt>Telephone</dt>
              <dd className="tabular">
                <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>General enquiries</dt>
              <dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
            </div>
            <div>
              <dt>Operations</dt>
              <dd><a href={`mailto:${company.emailOperations}`}>{company.emailOperations}</a></dd>
            </div>
            <div>
              <dt>Office</dt>
              <dd>
                {company.address.line1}, {company.address.line2}
                <br />
                {company.address.city}, {company.address.country}
              </dd>
            </div>
          </dl>
        </div>

        <form className="enquiry__form reveal" onSubmit={onSubmit} noValidate={false}>
          <fieldset disabled={status === 'sending'}>
            <legend className="visually-hidden">Enquiry details</legend>

            <div className="field">
              <label htmlFor={`${uid}-name`}>Your name</label>
              <input id={`${uid}-name`} name="name" type="text" autoComplete="name" required />
            </div>

            <div className="field">
              <label htmlFor={`${uid}-email`}>Email</label>
              <input id={`${uid}-email`} name="email" type="email" autoComplete="email" required />
            </div>

            <div className="field">
              <label htmlFor={`${uid}-subject`}>What is this about?</label>
              <select id={`${uid}-subject`} name="subject" defaultValue="">
                <option value="" disabled>Choose one</option>
                <option>Vessel technical management</option>
                <option>Road logistics</option>
                <option>Survey, audit or inspection</option>
                <option>Port management or cargo handling</option>
                <option>Something else</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor={`${uid}-message`}>Details</label>
              <textarea id={`${uid}-message`} name="message" rows={5} required />
            </div>

            <button type="submit" className="button button--primary">
              {status === 'sending' ? 'Sending' : 'Send enquiry'}
            </button>

            {!configured && (
              <p className="enquiry__hint">Opens in your email app, addressed to our operations desk.</p>
            )}
          </fieldset>

          <p aria-live="polite" className="enquiry__status">
            {status === 'sent' && 'Enquiry sent. We will reply to the email address you gave.'}
            {status === 'error' && `The enquiry did not send. ${error} Please email ${company.email} instead.`}
          </p>
        </form>
      </div>
    </section>
  )
}
