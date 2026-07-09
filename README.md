# LoopLens

LoopLens is a proof-of-work dashboard for AI-assisted software projects. It turns `LOOP.md`, TestSprite evidence, repo links, live app links, and development notes into a shareable engineering timeline.

## Purpose

This README is the public entry point for humans reviewing the repository. It should explain what LoopLens is, why it exists, how the project is organized, and how to evaluate the hackathon build.

## Current Status

The repository is in the planning and structure phase.

There is no application code yet. The current focus is:

- Product definition
- MVP scope
- Development organization
- Agent instructions
- Hackathon planning
- TestSprite loop preparation

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

## Repository Guide

- [AGENT.md](./AGENT.md): Instructions for AI coding agents working on LoopLens.
- [LOOP.md](./LOOP.md): Agent-written iteration log for the TestSprite hackathon loop.
- [_doc/](./_doc): Product, MVP, architecture, testing, and submission planning.
- [src/](./src): Future application source organization.
- [tests/](./tests): Future E2E, fixture, and manual testing organization.
- [public/](./public): Future static assets.
- [scripts/](./scripts): Future helper scripts.
- [.testsprite/](./.testsprite): Future TestSprite configuration and notes.
- [.github/](./.github): Future GitHub Actions and repository automation.

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

