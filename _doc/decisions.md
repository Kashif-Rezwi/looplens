# LoopLens Decisions Log

## Purpose

This file records important product and engineering decisions so future work has context. Add a short entry when a decision changes scope, architecture, testing, or submission strategy.

## How To Use

Add entries in reverse chronological order. Keep each decision concise and include the reason.

## Decisions

### 2026-07-09: Use Local-First Drafts and Server-Backed Published Reports

Decision: The MVP will use local-first draft editing, server-backed published reports, and no authentication in v1.

Reason: This supports real public share URLs without adding account management or a separate backend service during the hackathon.

### 2026-07-09: Prefer Next.js Full-Stack Over a Separate Backend

Decision: Server-side behavior should live inside the Next.js app, with server-only logic isolated in `src/server`.

Reason: One deployable app is simpler for the hackathon while still giving the product a real backend layer for persistence and optional AI requests.

### 2026-07-09: Deterministic Summaries Are Required, AI Summaries Are Optional

Decision: Judge, portfolio, resume, and social summaries must work from templates and parsed evidence. AI-enhanced summaries can be added later.

Reason: The MVP must remain useful and deployable without API keys, while still leaving room for grounded AI upgrades.

### 2026-07-09: Start With Planning-Only Repository Structure

Decision: Create documentation, folder organization, checklists, and agent instructions before adding application code.

Reason: The product depends on a clear scope and credible proof loop. A planning-first structure helps humans and agents stay aligned.

### 2026-07-09: Manual Import Before Deep Integrations

Decision: The MVP will start with manual `LOOP.md`, repo URL, live URL, TestSprite link, and CI link input.

Reason: Manual import keeps the hackathon scope realistic while still supporting the core proof dashboard.

### 2026-07-09: Public Report Is More Important Than Auth

Decision: Prioritize public share pages over account management.

Reason: The hackathon requires a live public artifact. Auth would add complexity without improving the core judging story.

### 2026-07-09: Evidence Completeness Is Not Project Quality

Decision: The score should be called evidence completeness, not quality score.

Reason: LoopLens can measure whether evidence is present, but it should not overclaim that a project is objectively high quality.

### 2026-07-09: AI Summaries Must Be Grounded

Decision: AI-generated summaries are optional and must be grounded in imported evidence.

Reason: LoopLens is a trust product. Unsupported generated claims would weaken the core value.
