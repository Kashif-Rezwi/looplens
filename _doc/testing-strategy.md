# LoopLens Testing Strategy

## Purpose

This document defines how LoopLens should be verified during the MVP build, with special attention to TestSprite Hackathon Season 3.

## Reader

Use this document if you are implementing features, writing tests, running TestSprite, or preparing the final submission.

## Scope

This strategy covers the MVP user flows. It does not require comprehensive enterprise-grade test coverage before the hackathon submission.

## Verification Goals

LoopLens should prove that:

- A user can create a report end to end
- `LOOP.md` parsing is useful and forgiving
- Parsed iterations can be edited
- Report modes are readable and accurate
- Public sharing works without localhost
- Markdown export includes key evidence
- Mobile layouts do not break critical report content

## Test Levels

### Manual Smoke Testing

Use during early development to quickly verify core flows after each major change.

### Automated Unit Testing

Use for pure logic once implementation starts, especially:

- Parser behavior
- Evidence score calculation
- Markdown export generation
- Summary generation

### End-to-End Testing

Use for complete user flows:

- Create project
- Paste `LOOP.md`
- Edit iteration
- Switch report modes
- Publish report
- Open public page
- Export Markdown

### TestSprite Verification

Use TestSprite CLI as the hackathon checker. TestSprite should run against the deployed app once a public URL exists.

Use `.testsprite/runbook.md` for the run procedure, artifact policy, and `LOOP.md` result format.

## TestSprite Target Flows

- Create a project report
- Paste sample `LOOP.md`
- Parse timeline entries
- Edit an iteration card
- Switch between Timeline, Judge Mode, and Portfolio Mode
- Publish a public report
- Open public share page
- Export Markdown

## Useful Failure Categories

TestSprite should ideally catch meaningful issues such as:

- Parser misses common loop formats
- Required URLs are not validated
- Publish flow creates inaccessible reports
- Timeline cards overflow on mobile
- Public report omits critical evidence
- Export output misses repo or live links
- Report mode tabs lose edited data

## Loop Logging

Every meaningful verify/fix cycle should be added to `LOOP.md`.

When TestSprite finds a problem, record:

- What TestSprite checked
- What failed
- What was changed
- Whether the rerun passed

## Pre-Submission Verification

Before submission:

- Run local smoke tests
- Build the app successfully
- Deploy the app publicly
- Run TestSprite CLI against the public URL
- Fix at least one real issue if discovered
- Rerun verification
- Update README and `LOOP.md`
- Confirm public report works in a fresh browser session
