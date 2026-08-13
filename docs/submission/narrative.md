# SabiCV — Build with Gemini XPRIZE narrative (draft)

**Category: Entrepreneurship & Job Creation**
**Live: https://sabicv.vercel.app · Repo: github.com/Uthmannabeel/sabicv**

> Draft for the 500–1000-word submission field. Numbers in [BRACKETS] get
> filled from Selar exports and the order store before submission.

---

"Sabi" is Nigerian Pidgin for know-how. SabiCV is an AI career agent that
gives Nigerian job seekers the know-how their CV never shows: it reads their
real CV against a real job advert, tells them honestly where they fall
short — free — and then, for the price of a meal (₦3,500–₦10,000), rewrites
their application the way a professional career coach would, without
inventing a single claim.

## The problem, and why this category

Nigeria's unemployment problem is not only a jobs problem — it is an access
problem. Millions of qualified people lose openings they could have won
because their CV doesn't speak the language of the advert, and professional
CV services in Lagos charge ₦50,000+, out of reach for the people who need
them most. Every interview a good candidate never gets is economic
participation lost. SabiCV widens the doorway into employment: it prices
professional application quality at street level and delivers it in minutes
on a phone. That is what "fueling the tools that help economies thrive"
looks like from the bottom up — not creating jobs directly, but unblocking
the people who will fill and eventually create them. [If outcome data
exists by submission: Of our first N customers, X reported interview
invitations within the window.]

## What the AI actually operates

This is not a template shop with an API call inside. Gemini executes the
core decisions of the business in production, and every decision is logged
per order as evidence:

1. **Free gap analysis (the storefront).** The agent scores the customer's
   actual CV against the actual job advert (0–100), names the top gaps and
   missing keywords. This honest, sometimes brutal score is our conversion
   hook — customers pay because the analysis already proved the agent read
   their CV.
2. **The rewrite.** The agent restructures the CV toward the target role,
   translating real experience into the advert's language.
3. **The QA integrity gate — the agent auditing itself.** A second pass
   traces every claim in the rewritten CV back to the customer's original.
   If it finds fabrication, it rejects its own draft and forces a
   corrective rewrite (up to three drafts, feedback accumulated). In our
   first end-to-end test the gate caught 24 fabricated claims and shipped
   a clean third draft. Career tools that hallucinate achievements get
   candidates blacklisted; ours refuses to.
4. **The truth receipt.** Every delivered CV ships with a claim-by-claim
   provenance list — each statement traced to the line in the customer's
   own CV that supports it, marked "stated" or "inferred". The customer
   can defend every word in an interview.

The human founder does marketing, WhatsApp support, and payment
confirmation. The agent does the product: analysis, judgment, writing,
self-audit, delivery. That division has held for every order in
production.

## The business

- **Founded inside the window** (first commit July 2026), solo founder,
  Port Harcourt, Nigeria.
- **Pricing:** CV rewrite ₦3,500 · CV + cover letter ₦5,000 · Premium
  (adds LinkedIn rewrite) ₦10,000.
- **Payments:** Selar (Nigerian merchant-of-record), so revenue evidence
  is third-party sales exports, not self-reported.
- **Revenue:** [₦X from N orders, M unique customers — Selar export
  attached]. Expenses: [hosting $0 (Vercel hobby), domain, Gemini API —
  documented in the expense sheet].
- **Unit economics:** marginal cost per order is a few Gemini calls —
  effectively 100% gross margin at current volume; the constraint is
  distribution, not delivery capacity, which is exactly the constraint a
  solo founder with an AI agent workforce can attack.

## Google Cloud

Gemini is the entire production workforce: analysis, rewriting, cover
letters, LinkedIn rewrites, and the QA integrity gate are all Gemini
calls with structured outputs. No other model is used.

## Evidence in the submission

Per-order agent execution logs (every pipeline step, timestamped, including
QA rejections and corrective retries), Selar sales exports, expense
documentation, customer contacts and testimonials [collected via the
post-delivery follow-up], and the live product itself — judges can run the
free analysis on their own CV in under two minutes at sabicv.vercel.app.

---
*Word count target: 500–1000. Current draft ≈ 640 words excluding
headings/brackets.*
