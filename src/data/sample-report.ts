import type { ProjectReport } from "@/types/report";
import { parseLoopMarkdown } from "@/lib/parser";
import { hydrateReport } from "@/lib/report-factory";

const sampleLoop = `2026-07-09 | Iteration 0 | Built/changed: Created initial product docs and planning-only repo structure for LoopLens | Verified: Confirmed documentation files and scaffold are tracked by git status checks | Result: No app code exists yet, so TestSprite has not been run | Next: Start implementation setup after scope approval
2026-07-09 | Iteration 1 | Built/changed: Resolved setup audit findings with clearer persistence, route, AI summary, TestSprite, publishing safety, and agent-compatibility docs | Verified: Planned doc-only remediation against audit findings | Result: No app code exists yet, so TestSprite has not been run | Next: Verify docs and begin implementation setup when approved
2026-07-09 | Iteration 2 | Built/changed: Implemented parser fixtures, deterministic summaries, and report mode UI | Verified: Unit tests covered pipe-delimited LOOP.md entries and Markdown export | Result: Parser first missed fixed failures in Result fields | Fixed: Added status detection and fixed-failure scoring from full iteration text | Next: Run browser smoke flow`;

const now = "2026-07-09T00:00:00.000Z";

export const sampleReport: ProjectReport = hydrateReport({
  id: "report_sample_looplens",
  slug: "sample-looplens",
  name: "LoopLens",
  description:
    "A proof-of-work dashboard that turns AI-assisted development evidence into a public engineering timeline.",
  repoUrl: "https://github.com/example/looplens",
  liveUrl: "https://looplens.example.com",
  demoUrl: "https://www.youtube.com/watch?v=demo",
  ciUrl: "https://github.com/example/looplens/actions",
  testspriteUrl: "https://www.testsprite.com/discover",
  tags: ["Next.js", "TestSprite", "AI-assisted development"],
  loopRawText: sampleLoop,
  visibility: "public",
  publishMetadata: {
    redactionChecklistAccepted: true,
    publishConfirmedAt: now,
    warningCount: 0
  },
  iterations: parseLoopMarkdown(sampleLoop),
  summaries: [],
  createdAt: now,
  updatedAt: now,
  publishedAt: now
});
