# LoopLens Action Items / Implementation Plan

## Purpose

This document converts the independent audit findings into a practical submission plan for the final 24-hour window before the TestSprite Hackathon Season 3 deadline.

The goal is to protect the working MVP, close high-impact presentation gaps, and avoid risky feature work that could destabilize the published proof flow.

## Source Context

Inputs used for this plan:

- Claude independent audit report: `looplens-audit-report.md`
- Current submission checklist: `_doc/checklists/submission-checklist.md`
- Current product scope: `_doc/mvp-development.md`
- Current hackathon notes: `_doc/research/hackathon-notes.md`
- Current implementation status documented in `README.md`, `SUBMISSION.md`, `LOOP.md`, and `.testsprite/`

Key audit conclusion:

> LoopLens is already a strong, tested, deployed MVP. The highest-return work before submission is visibility, checklist closure, and low-risk polish, not new Super Loop Engineering features.

## Submission Strategy

For the remaining submission window, prioritize work that:

- Helps judges understand LoopLens in the first 15 to 30 seconds.
- Makes the TestSprite loop evidence visible without requiring deep repo reading.
- Closes unchecked hackathon checklist items.
- Does not touch parser behavior, persistence, publishing, public report routing, or the report data model unless a confirmed blocker appears.

Do not start new product expansion work before submission. The MVP has already proven the core flow through unit tests, Playwright, production publish checks, and final TestSprite replay.

## P0: Must Do Before Submission

These items are near-zero-risk and directly affect submission readiness.

| Action | Reasoning | Expected Impact | Notes |
|---|---|---|---|
| Confirm the GitHub repository is public. | A private repository would block judging even if the app is strong. | Prevents a critical submission failure. | Mark complete in `_doc/checklists/submission-checklist.md` only after confirming in GitHub. |
| Add 2 to 3 screenshots to `README.md`. | Many judges skim the repo before opening the live app. The audit identifies missing visuals as the highest ROI visibility gap. | Makes the project understandable faster and improves first impression. | Recommended screenshots: public self-report hero, Timeline view, Judge Mode. |
| Add one explicit README sentence tying LoopLens to TestSprite Hackathon Season 3. | The hackathon fit is currently inferable but not obvious enough. | Helps judges immediately understand why this project belongs in the hackathon. | Example: "Built for TestSprite Hackathon Season 3, LoopLens turns TestSprite runs and LOOP.md evidence into a public proof report." |
| Submit the Discord post using `SUBMISSION.md`. | The post text is already prepared; submission itself remains unchecked. | Completes the required external submission step. | Include live app, repo, final self-report, and TestSprite dashboard links. |
| Verify the live app manually on a real mobile device. | Playwright checks mobile overflow, but the final checklist asks whether the app works on mobile. | Reduces risk of a poor judge experience on phone-sized screens. | Confirm create/read flow and public report readability. |
| Lead with the TestSprite harness-debugging story in README or submission copy. | The strongest proof asset is Iterations 5 to 7: blocked TestSprite verdict, artifact inspection, deterministic test fix, final 16/16 replay. | Makes the real engineering loop visible and memorable. | Keep concise; avoid burying it under implementation details. |

## P1: High-Impact If Time Allows

These items are valuable but should be time-boxed. Stop if they threaten the stable MVP.

| Action | Reasoning | Expected Impact | Risk Control |
|---|---|---|---|
| Add a small visual loop/status arc to Judge Mode or the public report header. | The current timeline is text-heavy; a quick visual chain can make fail -> fix -> verify visible at a glance. | Improves the "wow factor" without changing data flow. | Keep it presentational only. Use existing iteration statuses. Do not change parser, persistence, or score logic. |
| Consider TestSprite-in-CI evidence. | Hackathon notes mention a bonus for TestSprite in CI/CD. | Could strengthen scoring if it runs reliably. | Strictly time-box. Do not submit with a broken CI workflow. Prefer documented manual TestSprite proof over unstable CI. |
| Refresh final public self-report after README/polish updates if needed. | The public self-report is the main proof artifact. | Keeps the public proof aligned with final repo state. | Only republish if the app is stable and the content change materially improves evidence. |

## P2: Optional Polish

These are useful only after all P0 work is done and P1 work is either completed or intentionally skipped.

| Action | Reasoning | Expected Impact | Notes |
|---|---|---|---|
| Record a 60 to 90 second demo video. | Some judges prefer watching a quick walkthrough over running the app. | Improves accessibility and communication. | Keep path simple: import LOOP.md, show timeline, switch modes, publish report. |
| Add a build-in-public or social post. | The product is about visible engineering loops, so public narrative reinforces the concept. | Helps distribution beyond the formal submission. | Link to live app, repo, final report, and TestSprite evidence. |
| Consider minimal AI-enhanced Judge summary. | `_doc/ai-summary-contract.md` already defines grounding rules. | Could address the audit note that no AI feature is built. | Only attempt after safer work is complete. Must fall back to deterministic summaries on any error. |

## Explicit Non-Actions Before Submission

Do not do these before the hackathon submission:

- Do not build Super Loop Engineering features yet.
- Do not add GitHub OAuth, TestSprite API sync, MCP server support, team accounts, analytics, or broad integrations.
- Do not redesign the parser or report data model.
- Do not change publish persistence unless fixing a confirmed production blocker.
- Do not split large components for architecture cleanliness unless needed for a submission-blocking bug.
- Do not add a new scoring system separate from Evidence Completeness.

Reasoning:

- The current MVP already satisfies the core hackathon requirements.
- The final TestSprite proof relies on the current create -> parse -> publish -> public report flow staying stable.
- The remaining hours are better spent making existing proof more visible than adding new workflow scope.

## Required Verification For This Plan

After implementing any item from this document:

- Recheck the relevant item in `_doc/checklists/submission-checklist.md` only when it is actually complete.
- Run the smallest relevant verification for the change.
- For docs-only changes, review rendered Markdown or inspect the final file text.
- For UI changes, run typecheck/build and at least the relevant Playwright smoke path if time allows.
- For CI changes, ensure the workflow does not leave the repo in a failing or ambiguous state.

## Final Submission Readiness Checklist

Before posting the final submission, confirm:

- Public GitHub repo is accessible without signing in.
- Live app URL opens successfully.
- Final public LoopLens self-report opens successfully.
- TestSprite dashboard link opens and shows the final passed run.
- README contains screenshots or clear visual evidence.
- README states the TestSprite Hackathon fit directly.
- Discord submission includes live app, repo, final report, and TestSprite evidence.
- Mobile manual check has been completed.
- No new risky feature work is in progress.

## Recommended Order Of Work

1. Confirm repo visibility.
2. Add README hackathon-fit sentence.
3. Add README screenshots.
4. Manually check live mobile experience.
5. Submit Discord post.
6. Add optional visual loop/status arc only if time remains.
7. Consider TestSprite-in-CI only if it can be completed and verified safely.
8. Record demo video only after all required work is closed.

## Handoff Notes For Agents

- Treat this as a submission-protection plan, not a product-expansion plan.
- Favor small, reversible, presentation-focused changes.
- Preserve the evidence-first trust model.
- Keep all claims grounded in `LOOP.md`, `.testsprite/`, CI, live app, or public report evidence.
- If a proposed change is not required for submission clarity or checklist closure, defer it to `_doc/future-scope-product-roadmap.md`.
