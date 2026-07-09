# LoopLens Architecture Plan

## Purpose

This document defines the planned technical architecture for the MVP before application code is written. It should help future implementation stay modular, testable, and aligned with the product scope.

## Reader

Use this document if you are:

- Implementing the app
- Reviewing technical scope
- Adding persistence
- Adding parser behavior
- Adding report generation
- Preparing TestSprite flows

## Scope

This is a planning document. It does not define final code APIs yet. The architecture should evolve as implementation reveals constraints, but changes should remain aligned with the MVP.

## Planned Stack

- Next.js with React and TypeScript
- Tailwind CSS for UI styling
- Local-first editing state for fast report creation
- Lightweight persistence for public reports
- Public route for read-only reports
- Required deterministic summary generation
- Optional AI-enhanced summary generation
- GitHub Actions and TestSprite CLI for verification

## MVP Architecture Decision

The MVP should use a Next.js full-stack architecture, not a separate backend service.

Default persistence model:

- Draft report editing is local-first so users can move quickly.
- Published reports are saved server-side so public share URLs work without local browser state.
- Authentication is out of scope for v1.
- Server-only behavior lives in `src/server`.
- Next.js server actions are preferred for write operations.
- API routes should be added only when server actions are not enough for a specific flow.

This keeps the hackathon build practical while still supporting real public reports.

## Route Map

Initial routes:

- `/`: Main product entry and report workspace.
- `/sample`: Preloaded demo report for judges, demos, and TestSprite smoke checks.
- `/report/[slug]`: Public read-only report page.
- `/api/reports`: Optional route for report persistence if server actions are not enough.

Route principles:

- Public report pages must not depend on local storage.
- Draft editing can use local browser state until the user publishes.
- Routes should support the TestSprite flows listed in `testing-strategy.md`.

## Core Modules

### Project Workspace

Responsible for collecting project metadata and managing the report creation flow.

Expected responsibilities:

- Project name
- Description
- Repo URL
- Live app URL
- Demo URL
- CI URL
- TestSprite URL
- Publish state

### LOOP.md Importer

Responsible for accepting raw `LOOP.md` text and sending it to the parser.

Expected responsibilities:

- Paste input
- Basic empty-state validation
- Preserve raw text
- Trigger parse flow

### Loop Parser

Responsible for turning raw loop text into editable iteration records.

Expected responsibilities:

- Split raw text into likely iterations
- Detect iteration number
- Detect status
- Extract URLs
- Preserve source text
- Avoid irreversible assumptions

### Timeline Editor

Responsible for letting users review and correct parsed iterations.

Expected responsibilities:

- Edit title
- Edit maker action
- Edit checker action
- Edit failure found
- Edit fix applied
- Edit final status
- Edit evidence links

### Report Generator

Responsible for transforming project and iteration data into human-readable report modes.

Expected responsibilities:

- Timeline View
- Judge Mode
- Portfolio Mode
- Evidence completeness score
- Markdown export

### Summary Generator

Responsible for required deterministic summaries and optional AI-enhanced summaries.

Expected responsibilities:

- Generate conservative summaries from evidence
- Avoid unsupported claims
- Prefer source-linked statements
- Work without AI provider keys
- Record whether a summary came from a template or AI

### Persistence Layer

Responsible for saving and loading reports.

Expected responsibilities:

- Save project reports
- Save iterations
- Generate public slug or ID
- Load public report by slug
- Keep draft and published states clear
- Store publish-safety metadata

## Planned Data Flow

1. User enters project metadata.
2. User pastes `LOOP.md`.
3. Parser produces draft iterations.
4. User reviews and edits iterations.
5. Report generator computes timeline, summaries, and score.
6. User confirms the content is safe to publish.
7. Server-side persistence saves the published report and creates a slug.
8. Public page loads saved report by slug.
9. User exports Markdown when needed.

## Data Principles

- Raw evidence should be preserved.
- Parsed fields should stay editable.
- Generated summaries should be traceable to source evidence.
- Deterministic summaries are part of the MVP baseline.
- AI summaries are optional enhancements, not a launch dependency.
- Evidence completeness score should be explainable.
- Public sharing should require explicit user confirmation.

## MVP Persistence Preference

Default:

- Local-first draft editing.
- Server-backed published reports.
- No authentication in v1.

Fallback:

- If a hosted database is not ready, use the simplest server-side storage that still supports public report URLs.

The public share page is more important than account management or a separate backend service.

## Non-Goals

- Multi-user collaboration
- Role-based access control
- Deep GitHub import
- Deep TestSprite API integration
- Advanced analytics
- Project management workflows
