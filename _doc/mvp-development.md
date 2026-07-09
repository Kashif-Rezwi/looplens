# LoopLens MVP Development Doc

Created: 2026-07-09

## Purpose

This document defines the hackathon MVP plan for LoopLens: what to build, what to skip, how the user flow should work, and how to verify the product.

Use this doc as the main implementation planning reference once the project moves from structure into application development.

## Reader

This document is written for:

- The builder implementing the MVP
- AI coding agents making feature decisions
- Hackathon reviewers who want to understand development intent
- Future contributors who need the first version scope

## Scope

This document covers the first hackathon-ready version of LoopLens. It is intentionally narrower than the full product idea and should prevent scope creep.

## How To Use This Doc

Before starting a feature, check whether it appears in the MVP scope. If a feature is not listed here, treat it as out of scope unless the user explicitly approves it and the decision is recorded in `decisions.md`.

## MVP Goal

Build a polished, deployed hackathon version of LoopLens that lets a user paste `LOOP.md`, add project evidence, generate a structured engineering timeline, and publish a shareable proof dashboard.

The MVP should optimize for:

- A fast, understandable first-use flow
- A beautiful and credible public report
- Strong TestSprite hackathon alignment
- Real loop evidence from building LoopLens itself
- A scope small enough to build, test, deploy, and polish

## Hackathon Success Criteria

LoopLens should satisfy the TestSprite Season 3 submission expectations:

- Public GitHub repo
- Live public URL
- TestSprite CLI usage
- Agent-written `LOOP.md`
- README with app, live URL, and loop coverage
- Public report that demonstrates the loop
- Optional but valuable: GitHub Actions plus TestSprite CI evidence

## MVP Product Scope

### Must Build

- Create a project report
- Add project name, description, repo URL, live app URL, and optional demo/video links
- Paste `LOOP.md`
- Parse loop entries into structured iterations
- Edit parsed iteration cards
- Display an engineering timeline
- Generate Judge Mode
- Generate Portfolio Mode
- Generate deterministic template summaries
- Show evidence completeness score
- Publish a public share page
- Export the report as Markdown
- Include a sample project/demo state

### Should Build If Time Allows

- AI-assisted judge summary
- AI-assisted portfolio summary
- Resume bullet generator
- Social post draft generator
- CI/CD badge or status link field
- TestSprite run link field per iteration
- Evidence references from generated summaries back to source loop entries

### Explicit Non-Goals

- GitHub OAuth
- Deep GitHub API integration
- TestSprite API integration
- Team accounts
- Payments
- Browser extension
- Complex analytics
- Full project management workflows
- Multi-tenant enterprise features

## Core User Flow

### 1. Create Project

The user enters:

- Project name
- Short description
- Repository URL
- Live app URL
- Optional demo video URL
- Optional TestSprite or CI URL

### 2. Import Loop Evidence

The user pastes the contents of `LOOP.md`.

LoopLens parses the text into iteration records. The parser should be forgiving and support inconsistent formats.

### 3. Review Parsed Timeline

The user sees one card per iteration and can edit:

- Iteration title
- Maker action
- Checker action
- Failure found
- Fix applied
- Final status
- Evidence links

### 4. View Dashboard

The user can switch between:

- Timeline View
- Judge Mode
- Portfolio Mode

### 5. Publish

The user confirms that the content is safe to publish, then creates a public share URL.

### 6. Export

The user can copy or download a Markdown version for README, Discord, or portfolio use.

## Key Views

### App Workspace

The main authenticated or local editing workspace. For MVP, auth can be skipped if persistence is handled by generated public IDs and local editing state.

Recommended sections:

- Project details form
- `LOOP.md` importer
- Parsed timeline editor
- Preview tabs
- Publish controls

### Timeline View

Shows the engineering history as iteration cards.

Each card should include:

- Iteration number
- Status badge
- Maker action
- Checker/TestSprite action
- Failure or risk found
- Fix applied
- Evidence links
- Source excerpt from `LOOP.md`

### Judge Mode

A compact, judge-ready report.

Should include:

- Project overview
- Live URL
- Repo URL
- Loop count
- Number of fixed failures
- Evidence completeness score
- Strongest iteration
- TestSprite/CI evidence
- Final confidence summary

### Portfolio Mode

A developer-facing summary page.

Should include:

- What I built
- What improved through testing
- Bugs I fixed
- Tools used
- Resume bullets
- Share-ready social post draft

### Public Share Page

A read-only report optimized for sharing.

Should include:

- Project identity and links
- Evidence score
- Timeline
- Judge summary generated from templates at minimum
- Portfolio summary generated from templates at minimum
- Export/copy actions

## Evidence Completeness Score

The score should be simple and explainable. It should not pretend to be a security or quality guarantee.

Suggested inputs:

- Repo URL present
- Live URL present
- `LOOP.md` imported
- At least 2 loop iterations
- At least 1 failed or fixed iteration
- TestSprite evidence link present
- CI/CD evidence link present
- Demo video link present
- Public report published

The UI should frame this as "evidence completeness", not "project quality".

## Parser Requirements

The parser should support loose `LOOP.md` formats.

Minimum behavior:

- Split entries by lines when each line represents one iteration
- Detect iteration numbers when present
- Detect statuses such as passed, failed, fixed, rerun, verified, blocked, or unknown
- Extract URLs as evidence links
- Preserve the original source line or paragraph
- Fill missing fields with editable placeholders

The parser should avoid destructive assumptions. If it cannot classify a field, it should keep the raw text visible and editable.

## Suggested Data Model

### Project

- `id`
- `slug`
- `name`
- `description`
- `repoUrl`
- `liveUrl`
- `demoUrl`
- `ciUrl`
- `testspriteUrl`
- `loopRawText`
- `visibility`
- `redactionChecklistAccepted`
- `publishConfirmedAt`
- `createdAt`
- `updatedAt`
- `publishedAt`

### Iteration

- `id`
- `projectId`
- `index`
- `title`
- `makerAction`
- `checkerAction`
- `failureFound`
- `fixApplied`
- `status`
- `evidenceUrls`
- `sourceText`
- `createdAt`
- `updatedAt`

### Generated Summary

- `id`
- `projectId`
- `type`
- `content`
- `summarySource`
- `sourceIterationIds`
- `createdAt`

## Technical Scope

### Recommended Stack

- Next.js with React
- TypeScript
- Tailwind CSS
- Simple server actions or API routes
- Local-first draft editing
- Server-backed published reports
- Supabase, hosted Postgres, or another lightweight persistence layer for published reports
- Vercel deployment
- Optional OpenAI API for grounded summaries
- GitHub Actions for CI
- TestSprite CLI for verification loop

### MVP Persistence Options

Default:

- Store draft editing state locally while the user builds the report
- Store published reports server-side
- Resolve public pages by slug or public ID
- Skip authentication in v1

Fallback:

- If the preferred hosted database is not ready, use the simplest server-side storage that still supports public report URLs

The hackathon version should prioritize a real public share page over complex account management or a separate backend service.

## AI Feature Scope

AI should be helpful but not required for the core product to work.

### Deterministic Baseline

Even without an AI API key, the app must generate useful summaries from templates and parsed evidence.

Required baseline summaries:

- Judge summary
- Portfolio summary
- Resume bullets
- Social post draft

Generated summaries should record `summarySource` as `template` when produced without AI.

### AI-Enhanced Version

If available, AI can generate:

- Judge summary
- Portfolio summary
- Resume bullets
- Social post draft
- Risk and confidence notes

Guardrails:

- Do not invent evidence
- Refer to loop entries where possible
- Keep claims conservative
- Label generated summaries clearly
- Record `summarySource` as `ai`

## TestSprite Loop Plan

Use TestSprite to verify LoopLens through real user flows.

Target flows:

- Create a project report
- Paste sample `LOOP.md`
- Parse timeline entries
- Edit an iteration card
- Switch between Timeline, Judge Mode, and Portfolio Mode
- Publish a public report
- Open public share page
- Export Markdown

Expected useful failures to catch:

- Parser misses common loop formats
- Required links are not validated
- Publish flow creates inaccessible reports
- Timeline cards overflow on mobile
- Public page lacks critical evidence
- Export output omits important project links

Each TestSprite iteration should be recorded in the repo `LOOP.md` by the agent.

## Development Plan

### Phase 1: Foundation

- Create Next.js project
- Set up TypeScript, Tailwind, linting, and formatting
- Define core types for project, iteration, and summaries
- Build sample data
- Build base layout and navigation

### Phase 2: Import and Parse

- Build project setup form
- Build `LOOP.md` paste importer
- Implement parser
- Render parsed timeline cards
- Add editable iteration fields

### Phase 3: Reports

- Build Timeline View
- Build Judge Mode
- Build Portfolio Mode
- Add evidence completeness score
- Add deterministic summary generation
- Add Markdown export

### Phase 4: Persistence and Sharing

- Add storage layer
- Save project reports
- Generate public slugs
- Build public read-only report page
- Add publish confirmation and sensitive-content warning

### Phase 5: AI and Polish

- Add optional AI summary generation if API key is available
- Improve empty states and loading states
- Refine responsive design
- Add sample/demo report

### Phase 6: Verification and Submission

- Deploy live public URL
- Run TestSprite CLI against deployed app
- Fix failures and rerun
- Add GitHub Actions with TestSprite if feasible
- Maintain agent-written `LOOP.md`
- Write final README
- Prepare Discord submission
- Record optional demo video

## Demo Flow

The demo should show the full transformation:

1. Start with raw `LOOP.md`.
2. Paste it into LoopLens.
3. Show parsed timeline cards.
4. Highlight a failed iteration that became fixed.
5. Open Judge Mode.
6. Show evidence completeness score and links.
7. Publish the public report.
8. Open the public share page.
9. Export Markdown.

The strongest demo story is LoopLens proving its own development loop.

## Definition of Done

The MVP is ready for hackathon submission when:

- The app is deployed at a public URL
- A user can create and publish a report end to end
- A public report URL works without localhost
- Timeline, Judge Mode, and Portfolio Mode are polished
- The README explains the app, live URL, and loop coverage
- `LOOP.md` contains agent-written iteration entries
- TestSprite CLI has been run against the live app
- At least one real issue has been fixed and verified
- The final repo is public and submission-ready
