# Content audit — ambashipping.com

Audited 21 November 2026 against the live site. Everything the new site says
comes from this audit; nothing was invented to fill a gap.

## State of the existing site

The live site is a **single page**. Every other URL returns 404:

| URL | Status | Linked from |
|---|---|---|
| `/`, `/index.html` | 200 | — |
| `Default.aspx` | **404** | the logo, "Home" in main nav |
| `About.aspx` | **404** | main nav, "Read more about us" |
| `Services.aspx` | **404** | main nav and dropdown |
| `contact.aspx` | **404** | main nav, "Contact Us" |
| `Gallery.html` | **404** | main nav |
| `News`, `Sitemap`, `Portfolio` | **404** | top bar and footer |

So the main navigation, every dropdown item and all six "Read More" buttons are
dead. `last-modified` on the surviving page is **20 September 2021**.

Other findings:

- Static HTML on Hostinger with `.aspx` filenames left from a retired ASP.NET
  app. Template credited to `maxcontechnologies`, © 2011.
- The contact form is `<form id="footer-form" method="post" action="#">`. It
  posts to the current page and discards the message. **The site has had no
  working enquiry path.**
- Served over plain HTTP; browsers mark it "Not Secure".
- The Cargo Handling card uses a **visibly Shutterstock-watermarked** photograph.
  That is an unlicensed asset in production and has not been carried over.
- The footer advertises "Internet Explorer 9 or later / Mozilla Firefox 14".

## Verified — reused as-is

| Item | Value |
|---|---|
| Legal name | AMBA Shipping & Logistics Private Limited (ASLPL) |
| Address | 207, Chawla Complex, CBD Belapur, Navi Mumbai |
| Telephone | +91 22 27574870 |
| Email | info@ambashipping.com |
| Operations email | operation@ambashipping.com |
| Services | Vessel technical management, dredging, commercial management, surveys, audits & inspection, port management, cargo handling, IT services, chartering |
| Road logistics | Project cargoes, container, bulk, break bulk, various packages |

Narrative copy ("Who Are We", "Marine Industry", "Road Logistics", "What can we
do for You") was rewritten for grammar and tone **without changing its factual
meaning**. Source and rewrite both live in `src/content/site.ts`.

## Needs confirmation before launch

1. **Fleet counts.** Nine categories totalling 25 vessels, published 2021.
   These are *under technical management on behalf of owners* — the source never
   claims ownership, and neither does the new site.

2. **Contradiction in the fleet list.** The source lists both
   *"Accommodation / PipeLay / Cable Laying Barges – 3"* and
   *"Cable / Pipe Laying Accommodation Barges – 3"*. These read as the same
   category entered twice. If so the true total is **22, not 25**. Both rows are
   flagged in the UI and the discrepancy is stated in the copy.

3. **`RPSL-MUM-214`.** The source sentence attaches this licence number to a
   paragraph about acquiring Sea Suprita Ship Management, leaving the holder
   ambiguous. **Omitted** from the new site pending confirmation.

4. **Branch offices** — Pune, Visakhapatnam, Baroda, Ludhiana. From an undated
   notice. Shown on the About page explicitly labelled as unconfirmed.

5. **No copy exists** for chartering, commercial management, surveys, audits &
   inspection, port management, cargo handling or IT services. They are nav
   labels only. The Services page lists each and says plainly that a description
   is needed, rather than inventing one.

6. **Absent entirely** from the source: PIN code, CIN, founding year, class
   society or flag-state affiliations, client names, certifications,
   testimonials, staff numbers, vessel names.

## Deliberately not carried over

- Any claim of fleet ownership.
- The Shutterstock-watermarked photograph.
- "Latest Work 1/2/3" and the client logos — placeholder content from the
  template, not real portfolio items.
- The browser-compatibility list.
- The theme/colour switcher widget.
