# AGENT.md

## Purpose

This file is the operating guide for AI coding agents working on LoopLens. Use it before making product, code, documentation, testing, or submission changes.

The goal is to keep every agent aligned on what LoopLens is, what the MVP includes, how evidence should be handled, and how the TestSprite loop should be documented.

## Project Context

LoopLens is a proof-of-work dashboard for AI-assisted development. It helps builders turn raw development evidence into a clear public report showing how an app was built, tested, broken, fixed, and verified.

The project is being built for TestSprite Hackathon Season 3. The hackathon rewards both project quality and loop quality, so LoopLens must demonstrate its own write, verify, fix, and verify-again process.

## Current Scope

The repository is now in MVP implementation phase. Application code is allowed when it stays within the MVP boundaries below and preserves the evidence-first trust model.

Current implementation includes:

- Next.js App Router workspace
- `LOOP.md` parser
- Editable timeline cards
- Timeline, Judge Mode, Portfolio Mode, and Markdown export
- Evidence completeness score
- Public report route
- Postgres-backed published report storage for production
- Development file-store fallback for local browser tests
- Unit and Playwright smoke tests

## Product North Star

LoopLens should answer this question:

> Did this developer actually build, test, fix, and verify their app through a real engineering loop?

Everything in the MVP should support that answer.

## MVP Boundaries

Must support:

- Project report creation
- `LOOP.md` paste/import
- Loose parsing into timeline entries
- Editable iteration cards
- Timeline View
- Judge Mode
- Portfolio Mode
- Evidence completeness score
- Public share page
- Markdown export
- TestSprite-friendly user flows

Avoid in the MVP:

- GitHub OAuth
- Deep GitHub API integration
- TestSprite API integration
- Team accounts
- Payments
- Browser extension
- Complex analytics
- Full project management features

## Documentation Map

Use these files before changing scope:

- `_doc/product-idea.md`: Product understanding, users, use cases, and positioning.
- `_doc/mvp-development.md`: MVP scope, user flow, technical plan, and definition of done.
- `_doc/architecture.md`: Planned technical architecture and module boundaries.
- `_doc/user-flow.md`: User journey, screens, states, and UX expectations.
- `_doc/testing-strategy.md`: TestSprite and product verification plan.
- `_doc/ai-summary-contract.md`: Future AI summary grounding contract.
- `_doc/decisions.md`: Product and engineering decisions.
- `_doc/checklists/development-checklist.md`: Build-phase checklist.
- `_doc/checklists/submission-checklist.md`: Hackathon submission checklist.

## Development Rules

- Keep changes tightly scoped to the current task.
- Prefer simple, explainable implementation over clever abstractions.
- Keep parsing forgiving and user-editable.
- Preserve raw source evidence whenever the app interprets user input.
- Do not make AI-generated claims that are not grounded in imported evidence.
- Make failures visible and useful; a fixed failure is strong proof.
- Keep public reports readable in under 60 seconds.
- Treat sensitive pasted logs carefully and make publishing deliberate.

## LOOP.md Rules

`LOOP.md` is part of the hackathon proof. Keep it agent-written and append one concise line per meaningful iteration.

Each line should include:

- Date
- Iteration number
- What changed
- What was verified
- What failed, if anything
- What was fixed
- Current status

Suggested format:

```text
YYYY-MM-DD | Iteration N | Built/changed: ... | Verified: ... | Result: ... | Next: ...
```

When TestSprite is available, include what TestSprite checked and what it caught.

## TestSprite Expectations

Once the app is runnable and deployed, use TestSprite to verify real user flows:

- Create report
- Paste `LOOP.md`
- Parse timeline
- Edit iteration
- Switch report modes
- Publish public report
- Open share page
- Export Markdown

Record TestSprite failures and fixes in `LOOP.md`.

## UX Direction

LoopLens should feel credible, calm, and engineering-focused. It should not feel like a toy, generic landing page, or bloated project manager.

Prioritize:

- Clear evidence hierarchy
- Dense but readable information
- Strong public report polish
- Mobile-safe layouts
- Useful empty states
- Obvious links to repo, live app, CI, and TestSprite evidence

## Security and Privacy

Users may paste sensitive logs. Before publishing, the app should warn users to review content for secrets, private URLs, tokens, customer data, or internal notes.

Never store or expose more than the user intentionally publishes.

## Definition of Done for MVP

The MVP is complete when:

- A user can create and publish a report end to end
- A public report URL works without localhost
- Timeline, Judge Mode, and Portfolio Mode are polished
- Markdown export works
- TestSprite CLI has been run against the deployed app
- At least one meaningful issue has been fixed and verified
- `LOOP.md` documents the build loop
- README contains live URL, repo context, and loop coverage
