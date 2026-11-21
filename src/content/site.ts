/**
 * Single source of truth for site copy.
 *
 * PROVENANCE RULE: every string in this file is either (a) transcribed from
 * http://ambashipping.com/ (the company's only surviving page, last modified
 * 2021-09-20), or (b) a grammatical rewrite of such a string that preserves its
 * factual meaning. Nothing here is invented.
 *
 * Items whose underlying facts could not be confirmed carry `unverified: true`
 * and are rendered with a visible qualifier. See CONTENT-AUDIT.md.
 */

export const company = {
  legalName: 'AMBA Shipping & Logistics Private Limited',
  shortName: 'AMBA Shipping & Logistics',
  initials: 'ASLPL',
  /** Verified: homepage "Who Are We" paragraph. No PIN code published. */
  address: {
    line1: '207, Chawla Complex',
    line2: 'CBD Belapur',
    city: 'Navi Mumbai',
    country: 'India',
  },
  /** Verified: homepage "Reach Us" footer block. */
  phone: '+91 22 27574870',
  phoneHref: '+912227574870',
  email: 'info@ambashipping.com',
  emailOperations: 'operation@ambashipping.com',
} as const

/** Rewritten from the homepage "Who Are We" / "Marine Industry" / "Road Logistics" copy. */
export const about = {
  lede:
    'AMBA Shipping & Logistics Private Limited is a ship management and logistics company based in CBD Belapur, Navi Mumbai.',
  marine:
    'Our promoters lead an experienced shipping team of master mariners, chief engineers and departmental managers. They provide tailored professional service to national and international customers across the marine industry.',
  road:
    'Our logistics managers, at the head office and at branch offices, arrange the safe, prompt and competitively priced movement of material from origin to destination for domestic clients.',
  commitment:
    'We offer cost-effective management at a high standard, and we remain accountable to our clients across every area of our business.',
} as const

export type Service = {
  slug: string
  name: string
  /** Present only where the live site published descriptive copy. */
  summary?: string
  /** True when the live site names the service but publishes no description. */
  descriptionPending?: boolean
}

/** Verified: homepage "Services We Provide" list, plus the Services dropdown. */
export const services: Service[] = [
  {
    slug: 'vessel-technical-management',
    name: 'Vessel technical management',
    summary:
      'Day-to-day technical operation of vessels placed under our management by their owners, covering maintenance, dry docking and class compliance.',
  },
  { slug: 'dredging', name: 'Dredging activities', descriptionPending: true },
  { slug: 'commercial-management', name: 'Commercial management', descriptionPending: true },
  { slug: 'surveys', name: 'Surveys', descriptionPending: true },
  { slug: 'audits-inspection', name: 'Audits and inspection', descriptionPending: true },
  { slug: 'port-management', name: 'Port management', descriptionPending: true },
  { slug: 'cargo-handling', name: 'Cargo handling', descriptionPending: true },
  { slug: 'chartering', name: 'Chartering', descriptionPending: true },
  { slug: 'it-services', name: 'IT services', descriptionPending: true },
]

/**
 * Verified transcription of "Fleet of vessels under technical Management".
 *
 * IMPORTANT: these vessels are under ASLPL's technical management on behalf of
 * their owners. They are NOT described as owned by the company, and the UI must
 * not imply otherwise.
 *
 * CONTRADICTION FLAGGED: the source lists two near-identical categories —
 * "Accommodation / PipeLay / Cable Laying Barges - 3" and "Cable / Pipe Laying
 * Accommodation Barges - 3". These may be one category double-counted, which
 * would make the total 22 rather than 25.
 */
export type FleetCategory = {
  name: string
  count: number
  /** Set where the source list appears to double-count the same vessels. */
  duplicateSuspect?: boolean
}

export const fleet: {
  unverified: boolean
  asPublished: string
  categories: FleetCategory[]
} = {
  unverified: true,
  asPublished: '2021',
  categories: [
    { name: 'Offshore supply vessels', count: 7 },
    { name: 'Towing tugs, wide range', count: 5 },
    { name: 'Accommodation / pipelay / cable-laying barges', count: 3, duplicateSuspect: true },
    { name: 'Cable / pipe-laying accommodation barges', count: 3, duplicateSuspect: true },
    { name: 'Tugs', count: 2 },
    { name: 'Cargo barges without hatch covers', count: 2 },
    { name: 'Product tanker', count: 1 },
    { name: 'General cargo cum multipurpose vessel', count: 1 },
    { name: 'Drilling vessel', count: 1 },
  ],
}

/** Verified: homepage "Road Logistics" list. */
export const roadLogistics = [
  { name: 'Project cargoes', detail: 'Oversized and heavy-lift consignments moved on multi-axle trailers.' },
  { name: 'Container transportation', detail: 'Door-to-door and port-to-door container movement.' },
  { name: 'Bulk cargo transportation', detail: 'Loose bulk material carried between origin and destination.' },
  { name: 'Break bulk cargo transportation', detail: 'Individually handled units that are not containerised.' },
  { name: 'Various packages transportation', detail: 'General packaged freight for domestic clients.' },
] as const

/**
 * Verified transcription of the "Latest News" block. Both items are undated on
 * the source page; the page itself has not changed since September 2021.
 */
export const notices = [
  {
    text:
      'Sea Suprita Ship Management Pvt Ltd was acquired, under the same promoters as AMBA Shipping & Logistics Pvt Ltd.',
    unverified: true,
    note: 'Source also cites RPSL-MUM-214; the licence holder is ambiguous as published and is omitted pending confirmation.',
  },
  {
    text: 'Road transportation branches operate at Pune, Visakhapatnam, Baroda and Ludhiana.',
    unverified: true,
    note: 'Undated notice. Branch list requires confirmation before being presented as current.',
  },
] as const

export const nav = [
  { label: 'Services', href: '/services' },
  { label: 'Fleet', href: '/#fleet' },
  { label: 'Road logistics', href: '/#road' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const
