# TestSprite Runbook

## Purpose

This runbook explains how to use TestSprite during the LoopLens MVP verification loop once the app is runnable and deployed.

Use this file during the verify/fix/verify phase. Do not treat it as proof by itself; record meaningful results in `LOOP.md`.

## Target URL

Live app URL:

```text
<LIVE_PUBLIC_URL>
```

Do not run final hackathon verification only against localhost.

## CLI Command Placeholder

Fill in the exact command after TestSprite CLI setup is complete:

```text
<TESTSPRITE_CLI_COMMAND> <LIVE_PUBLIC_URL>
```

If the CLI requires authentication, keep credentials outside the repo.

## Flows To Verify

- Create a project report
- Add repo URL and live app URL
- Paste sample `LOOP.md`
- Parse timeline entries
- Edit an iteration card
- Switch between Timeline, Judge Mode, and Portfolio Mode
- Publish a public report
- Open the public share page in a fresh session
- Export Markdown

## Result Summary Format

After each meaningful run, add a concise line to `LOOP.md`:

```text
YYYY-MM-DD | Iteration N | Built/changed: ... | Verified: TestSprite checked ... | Result: ... | Next: ...
```

If TestSprite catches an issue, include:

- What flow failed
- What evidence showed the failure
- What was fixed
- Whether the rerun passed

## Artifact Policy

Safe to commit:

- Small notes summarizing TestSprite findings
- Links to public TestSprite or CI evidence
- Sanitized screenshots if useful for README or demo

Do not commit:

- Credentials
- Private account tokens
- Large generated run artifacts
- Sensitive logs
- Private project data

## Final Hackathon Check

Before submission, confirm:

- TestSprite ran against the live public URL
- At least one real issue was fixed if discovered
- `LOOP.md` records the verification loop
- README explains what TestSprite covered
- The public LoopLens report works without local browser state

