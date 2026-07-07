# XPRIZE entry — project instructions

This project uses the **ECC (Everything Claude Code)** agent harness. Follow the
agent instructions and rules in:

- `.claude/AGENTS.md` — agent orchestration, principles, workflow
- `.claude/rules/ecc/common/` — language-agnostic standards (coding-style, testing, security, git)
- `.claude/rules/ecc/web/` — web/frontend specifics

`.claude/` is a local dev aid and is **gitignored** (committing its ~500 files
trips Windows AV locks on `.git/objects`).

## What this is

Entry for the **Build with Gemini XPRIZE** (xprize.devpost.com).

- **Deadline: 2026-08-17 13:00 PDT.** $2M pool (1st: $500K).
- **NOT a demo hackathon** — must be a real business operated by AI agents, with
  real customers and real revenue inside 90 days. Submission needs: GitHub repo,
  3-min video, 500–1000-word narrative, revenue evidence (Stripe/bank), expense
  docs, agent execution logs, customer testimonials.
- Must use **at least one Google Cloud product** (Gemini counts).
- Categories: Education & Human Potential / Entrepreneurship & Job Creation /
  Small Business Services / Money & Financial Access / Professional Services Access.
- Judging: Business Viability (real users, revenue) / AI-Native Operations
  (AI executing key decisions in production) / Category Impact.

**Product idea: NOT YET DECIDED.** Scope it with the user before building.

## Working with the user

The user is non-technical — they approve ideas and direction; Claude builds.
Keep explanations plain.

## Environment note (this machine)

Corporate TLS interception: prefix npm/npx with `$env:NODE_OPTIONS="--use-system-ca"`.
Working dir defaults to the home folder — `Set-Location` into the project first.
