import type { EvidenceScore, EvidenceScoreItem, ProjectReport } from "@/types/report";
import { countFixedFailures } from "./evidence";

export function calculateEvidenceScore(report: ProjectReport): EvidenceScore {
  const items: EvidenceScoreItem[] = [
    {
      id: "repo-url",
      label: "Repository URL present",
      passed: Boolean(report.repoUrl),
      detail: report.repoUrl || "Add a public repository link."
    },
    {
      id: "live-url",
      label: "Live URL present",
      passed: Boolean(report.liveUrl),
      detail: report.liveUrl || "Add the deployed app URL."
    },
    {
      id: "loop-imported",
      label: "LOOP.md imported",
      passed: report.loopRawText.trim().length > 0,
      detail: report.loopRawText.trim() ? "Raw loop evidence is preserved." : "Paste the build loop."
    },
    {
      id: "two-iterations",
      label: "At least 2 iterations",
      passed: report.iterations.length >= 2,
      detail: `${report.iterations.length} iteration${report.iterations.length === 1 ? "" : "s"} found.`
    },
    {
      id: "fixed-failure",
      label: "At least 1 failed/fixed iteration",
      passed: countFixedFailures(report.iterations) > 0,
      detail: `${countFixedFailures(report.iterations)} fixed failure${countFixedFailures(report.iterations) === 1 ? "" : "s"} found.`
    },
    {
      id: "testsprite-link",
      label: "TestSprite evidence link present",
      passed: Boolean(report.testspriteUrl) || report.iterations.some((iteration) => iteration.evidenceLinks.some((link) => link.type === "testsprite")),
      detail: report.testspriteUrl || "Add a TestSprite run link when available."
    },
    {
      id: "ci-link",
      label: "CI/CD evidence link present",
      passed: Boolean(report.ciUrl) || report.iterations.some((iteration) => iteration.evidenceLinks.some((link) => link.type === "ci")),
      detail: report.ciUrl || "Add a CI run link when available."
    },
    {
      id: "demo-link",
      label: "Demo video link present",
      passed: Boolean(report.demoUrl),
      detail: report.demoUrl || "Optional but useful for judges."
    },
    {
      id: "published",
      label: "Public report published",
      passed: report.visibility === "public" && Boolean(report.publishedAt),
      detail: report.publishedAt ? `Published ${report.publishedAt}` : "Publish after review."
    }
  ];

  const passed = items.filter((item) => item.passed).length;

  return {
    total: items.length,
    passed,
    percentage: Math.round((passed / items.length) * 100),
    items
  };
}
