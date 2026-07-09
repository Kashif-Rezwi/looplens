# LoopLens

LoopLens is a proof-of-work dashboard for AI-assisted software projects. It turns `LOOP.md`, TestSprite evidence, repo links, live app links, and development notes into a shareable engineering timeline.

## Purpose

This README is the public entry point for humans reviewing the repository. It should explain what LoopLens is, why it exists, how the project is organized, and how to evaluate the hackathon build.

## Current Status

The repository now contains a runnable local MVP.

Implemented:

- Next.js App Router workspace
- `LOOP.md` paste/import and forgiving parser
- Editable timeline cards
- Timeline, Judge Mode, Portfolio Mode, and Markdown export
- Evidence completeness score
- Public report route
- Postgres JSON persistence contract for published reports
- Development file-store fallback for local Playwright verification
- Unit tests and Playwright smoke tests

Pending before final hackathon submission:

- Live deployment URL
- Production `DATABASE_URL`
- TestSprite CLI run against the live URL
- Final public LoopLens report for LoopLens itself

## Product Context

AI coding agents make it easier to generate code quickly. The more valuable signal is whether a developer can prove the app was tested, failed in meaningful ways, improved, and passed after fixes.

LoopLens helps developers show:

- What they built
- What they tested
- What failed
- What they fixed
- What passed afterward
- What evidence supports the work

## Planned MVP

The hackathon MVP will let a user:

- Create a project report
- Add repo URL, live app URL, description, and optional evidence links
- Paste `LOOP.md`
- Parse loop entries into timeline cards
- Edit parsed iterations
- View Timeline, Judge Mode, and Portfolio Mode
- Generate an evidence completeness score
- Publish a public report
- Export the report as Markdown

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright starts the app locally and uses the development file-store fallback for publish/share verification.

## Persistence

Production publishing expects `DATABASE_URL` and stores published reports in one Postgres table:

```bash
psql "$DATABASE_URL" -f scripts/schema.sql
```

Local development without `DATABASE_URL` writes temporary published reports to the OS temp directory. Public production reports must use Postgres.

## Repository Guide

- [AGENT.md](./AGENT.md): Instructions for AI coding agents working on LoopLens.
- [LOOP.md](./LOOP.md): Agent-written iteration log for the TestSprite hackathon loop.
- [_doc/](./_doc): Product, MVP, architecture, testing, and submission planning.
- [src/](./src): Application source.
- [tests/](./tests): Unit fixtures, parser tests, report logic tests, and Playwright E2E smoke tests.
- [public/](./public): Future static assets.
- [scripts/](./scripts): Future helper scripts.
- [.testsprite/](./.testsprite): Future TestSprite configuration and notes.
- [.github/](./.github): GitHub Actions CI and future repository automation.

## Development Principle

LoopLens should be built as a trustworthy engineering artifact, not a broad project management app. The MVP should stay focused on turning evidence into a clear public proof page.

## Hackathon Readiness

Before submission, the repository should include:

- Live public URL
- Public GitHub repo
- TestSprite CLI usage
- Agent-written `LOOP.md`
- README with app, live URL, and loop coverage
- Public LoopLens report for LoopLens itself
- Optional demo video
- Optional GitHub Actions plus TestSprite CI evidence

## Known Dependency Note

`npm audit` currently reports a moderate PostCSS advisory through Next.js `16.2.10`'s nested dependency. `npm audit fix --force` suggests a breaking downgrade, so the project keeps the current Next version and records this as upstream dependency risk until a compatible Next release resolves it.
