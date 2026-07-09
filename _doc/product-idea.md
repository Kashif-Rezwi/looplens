# LoopLens Product Idea Doc

Created: 2026-07-09

## Purpose

This document captures the product idea behind LoopLens: the problem, target users, real-world use cases, positioning, and product risks.

Use this doc to understand what LoopLens is and why it should exist. Do not use it as the implementation checklist; that belongs in `mvp-development.md`.

## Reader

This document is written for:

- The founder/builder shaping the product
- Hackathon mentors or reviewers evaluating the idea
- AI agents that need product context before coding
- Future contributors who need to understand the product thesis

## Scope

This document focuses on product understanding and brainstorming. It intentionally avoids detailed MVP task planning, implementation steps, and technical architecture.

## How To Use This Doc

Read this before changing product positioning, target users, or feature priorities. If a product decision changes because of this doc, record it in `decisions.md`.

## One-Line Idea

LoopLens is a proof-of-work dashboard that turns AI coding loops, TestSprite runs, commits, and `LOOP.md` entries into a shareable engineering timeline.

## Product Thesis

AI-assisted development is making it easier to generate working-looking software. The harder and more valuable signal is whether a builder can prove that the software was tested, failed in meaningful ways, improved, and passed after real fixes.

LoopLens focuses on that proof.

Instead of only showing the final app, LoopLens shows how the app got better.

## Core Problem

Developers increasingly build with coding agents, test tools, CI systems, commit history, bug notes, README files, and public demos. The evidence of real engineering work is often scattered across many places:

- Git commits
- Testing logs
- Bug reports
- Agent-generated notes
- `LOOP.md`
- README files
- CI/CD runs
- Demo videos
- Hackathon submission posts

Judges, recruiters, collaborators, clients, and even the developer themselves rarely have time to reconstruct the full story.

This creates a credibility gap:

> The work may be real, but the proof is hard to read.

LoopLens turns that scattered evidence into a clear, trustworthy, shareable artifact.

## Target Users

### Primary Users

- Hackathon builders using AI coding agents
- Developers participating in TestSprite Hackathon Season 3
- Junior and full-stack developers building portfolio projects
- Developers who want to prove their debugging and iteration process

### Secondary Users

- Indie hackers sharing build-in-public progress
- Open-source maintainers preparing releases
- Bootcamp students documenting learning projects
- Freelancers and agencies delivering client work
- Small teams that want lightweight QA and release evidence

## User Needs

LoopLens users need to:

- Show that a project was built through real iteration, not only generated once
- Convert messy engineering notes into a readable story
- Demonstrate testing, failures, fixes, and final verification
- Share credible proof with judges, recruiters, clients, or collaborators
- Preserve a useful project history for future maintenance
- Turn technical work into portfolio, resume, and social proof

## Real-World Use Cases

### Hackathon Submission

A builder can share a LoopLens report with judges to prove that their app went through a real write, verify, fix, and verify-again loop. The report helps judges understand the project faster and trust that the loop actually happened.

### Developer Portfolio

Instead of only saying "I built this app", a developer can show how they debugged, tested, and improved it. This makes the portfolio stronger because it demonstrates judgment and problem-solving, not only output.

### Resume Proof

LoopLens can help convert technical iteration history into resume-ready evidence, such as:

> Built and verified a full-stack dashboard using AI-assisted development, TestSprite testing loops, and CI/CD-based quality checks.

### Open Source Release Notes

Maintainers can summarize what changed, what was tested, what failed, and what risks were reduced before a release. This creates a more credible release story than a plain changelog.

### Client Delivery Report

Freelancers and agencies can share a clean report proving that key flows were tested and fixed before handoff. This can reduce client uncertainty and make delivery feel more professional.

### Learning Journal

Students and early-career developers can document what broke, what they learned, and how the project improved over time. This helps turn learning into visible evidence.

## Product Positioning

LoopLens should not be positioned as only a hackathon helper. The stronger positioning is:

> LoopLens makes AI-assisted development verifiable.

The TestSprite hackathon is the first excellent wedge because it already requires `LOOP.md`, public repos, live URLs, and a visible verification loop. But the broader product category is proof-of-work for AI-assisted software projects.

## Value Proposition

LoopLens helps builders:

- Make the engineering process readable
- Prove that testing and fixes happened
- Turn raw logs into a clean timeline
- Share a judge-ready or recruiter-ready artifact
- Increase trust in AI-assisted development
- Keep a durable record of project quality work

LoopLens helps reviewers:

- Understand a project faster
- See which flows were tested
- See which bugs were caught and fixed
- Evaluate engineering maturity
- Avoid digging through commits, CI logs, and markdown files manually

## Trust Principles

LoopLens should be designed around trust, not hype.

### Evidence First

Generated summaries should be grounded in imported source evidence such as `LOOP.md`, TestSprite notes, commit links, and CI links.

### Clear Source Traceability

Important claims should point back to the loop entry or evidence item that supports them.

### Human Editable

Parsing will never be perfect. Users should be able to correct, clarify, or refine imported iterations.

### Sensitive Data Awareness

Users may paste logs that contain secrets, internal URLs, or private notes. LoopLens should make publishing feel intentional and warn users before making a report public.

### Process Over Performance Theater

The product should reward honest iteration. A failed test that led to a real fix should be treated as a strength, not something to hide.

## Why This Feels Fresh

Most portfolio and project tools emphasize final outcomes: screenshots, features, and launch links.

LoopLens emphasizes engineering process:

- What changed
- What was tested
- What failed
- What got fixed
- What passed afterward
- Why confidence improved

That matters because AI-assisted development changes what "good work" looks like. If many people can generate code quickly, then verified iteration becomes the differentiator.

## Product Risks

### Risk: The Product Feels Too Meta

If LoopLens feels like a tool only for this hackathon, it may seem narrow. The product should speak to developers, students, freelancers, and teams who need proof of engineering work.

### Risk: AI Summaries Hallucinate

If summaries claim more than the evidence supports, LoopLens loses credibility. The product should prefer conservative, source-grounded summaries.

### Risk: Parsing Is Too Fragile

Different agents may write `LOOP.md` in different styles. LoopLens should parse loosely and allow users to edit the result.

### Risk: Users Paste Sensitive Information

Publishing must be deliberate. The product should clearly separate draft/private editing from public sharing.

### Risk: It Becomes a Project Management Tool

LoopLens should stay focused on engineering evidence and proof-of-work. It should not drift into tasks, sprints, team management, or broad analytics too early.

## Product Promise

LoopLens helps developers prove that they did not just generate an app. They tested it, broke it, fixed it, and improved it through a real engineering loop.
