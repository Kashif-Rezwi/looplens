# LoopLens User Flow

## Purpose

This document explains the user journey for the MVP. It should guide UX, screen structure, empty states, and TestSprite scenarios.

## Reader

Use this document if you are designing, implementing, testing, or demoing the LoopLens MVP.

## Scope

This document focuses on MVP behavior. It does not define visual styling in detail and does not cover future team, OAuth, or analytics flows.

## Primary User

The primary user is a builder who has a project, a live URL, a repo URL, and some loop evidence such as `LOOP.md`, TestSprite notes, CI links, or development logs.

The user wants to quickly produce a credible proof page.

## Golden Path

1. Open LoopLens.
2. Create a new project report.
3. Enter project metadata.
4. Paste `LOOP.md`.
5. Parse loop evidence.
6. Review and edit generated iteration cards.
7. Inspect Timeline View.
8. Inspect Judge Mode.
9. Inspect Portfolio Mode.
10. Publish public report.
11. Open public report URL.
12. Export Markdown.

## Project Setup Fields

Required:

- Project name
- Short description
- Repository URL
- Live app URL

Optional:

- Demo video URL
- CI URL
- TestSprite URL
- Tags or tools used

## LOOP.md Import Flow

The importer should:

- Accept pasted text
- Explain that raw evidence will be preserved
- Parse entries into iterations
- Show a friendly empty state if no text is provided
- Show an editable review step after parsing

## Timeline Review Flow

Each iteration card should expose:

- Iteration number
- Title
- Maker action
- Checker action
- Failure found
- Fix applied
- Final status
- Evidence links
- Source excerpt

The user should be able to correct parser mistakes without leaving the page.

## Report Modes

### Timeline View

Best for understanding the full development process.

### Judge Mode

Best for a hackathon reviewer who needs the compressed proof story.

### Portfolio Mode

Best for a developer sharing the project publicly or turning it into resume/social material.

## Publish Flow

Before publishing, the app should ask the user to review for:

- Secrets
- Tokens
- Private URLs
- Customer data
- Internal notes
- Sensitive logs

Publishing should create a public, read-only report URL.

The publish action should capture:

- Visibility set to public
- Redaction checklist accepted
- Publish confirmation timestamp

Draft editing can remain local-first, but the published report must be saved server-side so the public URL works without local browser state.

## Export Flow

Markdown export should include:

- Project name
- Description
- Repo URL
- Live URL
- Evidence links
- Timeline summary
- Judge summary
- Portfolio bullets

## Important Empty States

- No project details yet
- No `LOOP.md` pasted yet
- Parser found only one vague entry
- No failures detected
- No evidence links present
- Report not published yet

Each empty state should tell the user what to add next without sounding like marketing copy.

## Demo Flow

The strongest demo should show:

1. Raw `LOOP.md`
2. Parsed timeline
3. A failure that was fixed
4. Judge Mode summary
5. Evidence score
6. Published public report
7. Markdown export

For the hackathon, the ideal demo is LoopLens proving the development loop of LoopLens itself.
