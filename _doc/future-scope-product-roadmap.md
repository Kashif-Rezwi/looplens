# LoopLens Future Scope / Product Roadmap

## Purpose

This document captures the post-hackathon roadmap for evolving LoopLens from a proof-of-work dashboard into a broader Super Loop Engineering App.

The roadmap intentionally separates future product ambition from the immediate submission plan. Nothing in this document should be treated as required before the TestSprite Hackathon Season 3 submission.

## Product Direction

LoopLens should evolve into the practical workflow layer for loop engineering:

> Define the loop, run the loop, capture evidence, publish proof, and improve the next loop.

The current MVP already owns the proof and reporting layer. The next product phase should add structured setup, better evidence capture, loop health guidance, and continuous improvement while preserving the trust model that made the MVP credible.

## Unified Product Spine

Every major feature should map to one of these five concepts:

| Concept | Meaning | Current MVP Equivalent | Future Expansion |
|---|---|---|---|
| Blueprint | The intended loop: goal, scope, acceptance criteria, tools, evidence rules. | Project metadata and description. | Loop Setup, playbooks, acceptance criteria, evidence checklist. |
| Run | One actual build/test/fix/verify cycle. | Iteration records parsed from `LOOP.md`. | Richer run records, failure classification, rerun tracking. |
| Evidence | Artifacts that prove what happened. | Evidence links, source text, raw `LOOP.md`, TestSprite URL, CI URL. | Evidence Inbox, TestSprite JSON import, CI logs, PR links, screenshots, agent notes. |
| Report | Human-readable proof artifact. | Timeline, Judge Mode, Portfolio Mode, Markdown export, public report. | Proof chains, AI summaries, release reports, client handoff reports. |
| Improvement | What should happen next. | Evidence Completeness gaps. | Loop Health Score, next-loop recommendations, unresolved risk tracking. |

This spine is the main guardrail against feature sprawl. If a feature does not strengthen one of these concepts, it should be delayed or rejected.

## Short-Term Post-Hackathon Roadmap

These features are the strongest candidates for the first post-submission product iteration because they extend existing MVP paths instead of introducing risky new subsystems.

### 1. Loop Setup Tab

What it does:

- Helps users define the loop before they start building.
- Captures project goal, target user flow, acceptance criteria, verification tools, and required evidence.
- Generates a starting `LOOP.md` template and suggested report structure.

How it connects:

- Extends the current project metadata flow.
- Feeds better structured input into the existing parser and report generator.
- Makes LoopLens useful before evidence exists, not only after the fact.

Why it matters:

- Reduces the "people do not know how to set up loop engineering" problem.
- Makes loop engineering concrete rather than abstract.

### 2. Evidence Inbox v1

What it does:

- Lets users paste or attach raw evidence from TestSprite summaries, CI logs, agent notes, URLs, and manual observations.
- Normalizes evidence into iteration links, source excerpts, or report-level evidence.
- Keeps raw input visible so users can verify and edit the interpretation.

How it connects:

- Evolves the current `LOOP.md` paste importer into a broader evidence capture flow.
- Reuses existing evidence links and source text.

Why it matters:

- Developers already collect evidence in messy places.
- LoopLens becomes useful even when the loop evidence is not perfectly formatted.

### 3. Loop Health Score v1

What it does:

- Extends Evidence Completeness into a practical maturity score.
- Checks for goal clarity, acceptance criteria, raw evidence, failure capture, fix capture, rerun verification, external proof, and redaction review.
- Produces missing-evidence recommendations.

How it connects:

- Should extend `calculateEvidenceScore` rather than creating a second score.
- The score must remain framed as loop/evidence maturity, not product quality.

Why it matters:

- Helps users understand what a healthy engineering loop looks like.
- Turns the product into a coach without needing AI.

### 4. Verification Chain

What it does:

- Represents failure -> cause -> fix -> rerun -> verified as a clear chain.
- Classifies failures as product bug, test harness issue, environment issue, unclear, or unresolved.
- Highlights the strongest proof chain in Judge Mode.

How it connects:

- Extends current iteration fields like failure found, fix applied, status, and evidence links.
- Makes the strongest part of LoopLens easier to see quickly.

Why it matters:

- The current MVP proves that this story matters through the TestSprite harness-debugging loop.
- It makes honest failure a strength rather than something to hide.

## Medium-Term Roadmap

These features should come after short-term evidence and health workflows are validated with real users.

### Public Loop Playbooks

Create reusable loop recipes for common workflows:

- Hackathon submission loop.
- Bugfix loop.
- SaaS feature loop.
- AI app evaluation loop.
- Release readiness loop.
- Client handoff loop.

Why it matters:

- Solves the "loop engineering feels abstract" problem.
- Gives new users a starting point without requiring them to understand the whole category.

### AI Summaries

Implement grounded AI-enhanced summaries using `_doc/ai-summary-contract.md`.

Rules:

- AI output must cite or reference imported evidence.
- Template summaries remain the fallback.
- Unsupported claims must be avoided.
- `summarySource` should continue distinguishing template and AI output.

Why it matters:

- Adds a meaningful AI layer without turning LoopLens into a generic content generator.
- Helps users communicate technical loops more clearly.

### TestSprite Setup-To-Proof Kit

Generate practical TestSprite setup assets:

- TestSprite-ready PRD or plan draft.
- Suggested CLI commands.
- Local MCP vs public CLI guidance.
- Loop entry template for recording TestSprite results.
- Import path for TestSprite run summaries.

Why it matters:

- Connects directly to TestSprite workflows without duplicating TestSprite.
- Helps users move from verification setup to public proof.

### GitHub Loop Templates

Generate GitHub issue, PR, and release templates:

- Scope.
- Acceptance criteria.
- Test plan.
- Evidence links.
- Failure/fix notes.
- Report link.

Why it matters:

- Gives teams better loop etiquette inside their existing workflow.
- Provides a bridge to future GitHub import without starting with OAuth.

## Long-Term Roadmap

These ideas require stronger user validation, more infrastructure, or external integrations.

### GitHub Import

Import commits, PRs, issues, CI status, and release notes into LoopLens evidence.

Build only after:

- Manual GitHub templates show value.
- Users ask for automatic import.
- Authentication and data permissions are well understood.

### TestSprite API Sync

Sync TestSprite projects, tests, runs, artifacts, and dashboard links.

Build only after:

- Manual TestSprite result import proves useful.
- Stable API access and auth patterns are clear.
- The product knows which TestSprite fields matter most for reports.

### Agent Session Import

Import Codex, Copilot, Cursor, Claude, or other agent session evidence.

Potential inputs:

- Plans.
- Changed files.
- Commands run.
- Test results.
- Failures encountered.
- Human corrections.
- Final verification.

Goal:

- Make agent-assisted development auditable without pretending the agent is always correct.

### LoopLens MCP/API Surface

Expose LoopLens actions for agent workflows:

- Create loop entry.
- Attach evidence.
- Check loop health.
- Publish report.
- Generate next-loop recommendations.

Build only after:

- Core web workflow is stable.
- Data model supports structured loop objects.
- Users demonstrate demand for agent-native capture.

### Team Workspaces And Scheduled Monitoring

Support teams, recurring loop checks, scheduled report updates, and cross-project health views.

Build only after:

- Individual project workflow is proven.
- Auth, permissions, and privacy requirements are understood.
- The product is no longer primarily a hackathon/portfolio tool.

## Product Risks And Mitigations

| Risk | Why It Matters | Mitigation |
|---|---|---|
| The product becomes too abstract. | "Loop engineering" may not be obvious to new users. | Lead with playbooks, concrete setup outputs, and examples. |
| The product becomes scattered. | TestSprite, GitHub, agents, CI, reports, and templates can feel like separate tools. | Require every feature to map to Blueprint, Run, Evidence, Report, or Improvement. |
| LoopLens duplicates TestSprite. | TestSprite should remain the verification runner. | LoopLens should prepare, capture, explain, and publish evidence, not replace testing. |
| Scores overclaim quality. | Evidence presence does not guarantee product quality. | Frame scores as evidence completeness or loop maturity only. |
| AI summaries hallucinate. | Unsupported claims would weaken trust. | Keep deterministic fallbacks and require evidence-grounded AI output. |
| Sensitive logs leak. | Users may paste secrets, private URLs, or internal notes. | Expand secret scanning and keep publish review explicit. |
| Integrations arrive too early. | OAuth/API work can consume time before workflow value is proven. | Start with manual import and generated templates. Automate only after pull is clear. |

## Simplify, Merge, Or Delay

Merge these concepts:

- Blueprint Wizard + Setup Kit -> Loop Setup.
- Evidence Inbox + TestSprite Result Importer -> Evidence Inbox.
- Proof Chain + Failure Tracker -> Verification Chain.
- Loop Health Score + Evidence Completeness -> one extended score, not two scoring systems.

Delay these:

- GitHub OAuth.
- TestSprite API sync.
- MCP server.
- Team workspaces.
- Complex analytics.
- Full project management workflows.

Treat these with skepticism until users ask:

- Agent Runbook Generator.
- GitHub template generator beyond simple starter templates.
- Broad workflow automation that does not directly improve evidence, reporting, or loop health.

## Product Principles

- Evidence first, summaries second.
- Manual import before deep integrations.
- Deterministic checks before AI review.
- Human editable at every interpretation step.
- Public publishing must be deliberate.
- Failed tests that lead to verified fixes are strong evidence.
- LoopLens should complement TestSprite, CI, GitHub, and agents rather than replacing them.

## Success Metrics To Validate The Direction

Early signs the roadmap is working:

- Users create reports with less manual cleanup.
- Reports include more external evidence links.
- Users can explain their failure/fix/rerun story faster.
- Evidence Completeness or Loop Health gaps lead to concrete improvements.
- Users reuse playbooks across multiple projects.
- Users ask for automatic import after using manual import.

Warning signs:

- Users treat LoopLens as a generic portfolio generator.
- Reports contain unsupported claims.
- Users skip evidence review before publishing.
- Setup features feel like paperwork before value.
- Integrations consume development time without improving public proof quality.

## Recommended Product Sequence

1. Ship and learn from the current MVP.
2. Add Loop Setup with a small number of concrete playbooks.
3. Add Evidence Inbox v1 for messy TestSprite, CI, and agent evidence.
4. Extend Evidence Completeness into Loop Health Score.
5. Add Verification Chain visuals and stronger failure classification.
6. Add grounded AI summaries using the existing AI summary contract.
7. Add manual-to-automated bridges for TestSprite and GitHub.
8. Add API/MCP/team features only after repeat usage proves demand.

## Handoff Notes For Agents

- Do not treat this roadmap as permission to build all features at once.
- Keep new work incremental and attached to the existing MVP model.
- Prefer extending current Project, Iteration, Evidence, Summary, and Score concepts over creating new parallel systems.
- Record any scope-changing decision in `_doc/decisions.md`.
- Validate every feature against the product spine before implementation.
