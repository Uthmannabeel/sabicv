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
**Professional Services Access**.

- **Deadline: 2026-08-17 13:00 PDT.** $2M pool (1st: $500K).
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
