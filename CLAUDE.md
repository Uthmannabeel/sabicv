# SabiCV — project instructions

This project uses the **ECC (Everything Claude Code)** agent harness. Follow the
agent instructions and rules in:

- `.claude/AGENTS.md` — agent orchestration, principles, workflow
- `.claude/rules/ecc/common/` — language-agnostic standards (coding-style, testing, security, git)
- `.claude/rules/ecc/web/` — web/frontend specifics

`.claude/` is a local dev aid and is **gitignored** (committing its ~500 files
trips Windows AV locks on `.git/objects`).

## What this is

**SabiCV** — an AI career agent for Nigerian job seekers. Customers upload
their current CV and paste a target job ad; an AI agent analyses the gap,
rewrites the CV, writes a tailored cover letter, and delivers polished PDFs.
Paid per order (₦3,000–10,000) via Paystack. The human owner does marketing
and customer chat; the AI agent does the actual work.

Entry for the **Build with Gemini XPRIZE** (xprize.devpost.com), category
**Entrepreneurship & Job Creation** — *"Fueling the tools that help new founders
and economies thrive."*

**Category positioning (switched 2026-07-28, was Professional Services Access).**
The entrant picks the category on the submission form, so this costs no code —
but it is not a relabel. SabiCV must read as **employment access**: the unit of
value is a Nigerian getting a real shot at a job, not a document being rewritten.
Category impact is argued in **interviews and offers landed**, not CVs produced.
Every claim in that argument needs outcome data we do not yet collect.

Why the switch: Professional Services Access is the natural home for every
legal-, medical-, accounting- and career-AI entry — widest funnel, highest
sameness risk. **This is a judgment call, not a measurement**: the Devpost
project gallery is unpublished and no per-category submission counts exist
publicly. Revisit if the gallery goes live before the deadline.

Known fit weakness to defend in the narrative: the category name says *job
creation*, and SabiCV helps people **get** jobs rather than creating them. The
narrative must bridge that explicitly — employment access as economic
participation — or a judge will read it as a tool filed in the wrong drawer.

- **Deadline: 2026-08-17 13:00 PDT.** $2M pool (1st: $500K).
- **Realistic target: a $50K category prize or $50K runner-up.** The top five
  finalists compete live in Los Angeles on 2026-09-25; the user's standing rule
  rules out in-person events, so the $500K/$200K/$100K tier is out of reach.
  Other prizes are paid by mail or electronic transfer per the official rules.
- Field size: ~2,700 teams actively building (not the 22,317 registered).
- **NOT a demo hackathon** — must be a real business with real customers and
  real revenue inside the submission window. Submission needs: GitHub repo,
  3-min video, 500–1000-word narrative, revenue evidence (bank/Paystack
  statements, P&L), expense docs, **agent execution logs**, customer
  testimonials.
- Must use **at least one Google Cloud product** → Gemini powers the agent.
- Judging: Business Viability (real users, revenue) / AI-Native Operations
  (AI executing key decisions in production) / Category Impact.

## Architecture (v1)

- **Next.js (App Router)**, mobile-first — customers arrive on phones.
- **Gemini API** — CV parsing, gap analysis, rewriting, cover-letter generation.
- **Paystack** — payment before delivery (NGN cards, transfers, USSD).
- **Agent execution logs persisted for every order** — first-class requirement;
  this is judging evidence, not debug output.
- Design must clear the anti-template bar in
  `.claude/rules/ecc/web/design-quality.md`.

## Working with the user

The user is non-technical — they approve ideas and direction; Claude builds.
Keep explanations plain. Open user-side operational TODOs: Paystack business
account (needs BVN/bank), paid Gemini API key (free tier's 20 req/day cap
cannot serve real customers).

## Environment note (this machine)

Corporate TLS interception: prefix npm/npx with `$env:NODE_OPTIONS="--use-system-ca"`.
Working dir defaults to the home folder — `Set-Location` into the project first.
