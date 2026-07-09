import type { ProjectReport } from "@/types/report";
import { getSummary } from "./summaries";

export function exportReportMarkdown(report: ProjectReport): string {
  const judge = getSummary(report, "judge")?.content ?? "";
  const portfolio = getSummary(report, "portfolio")?.content ?? "";
  const resume = getSummary(report, "resume")?.content ?? "";

  const timeline = report.iterations
    .map((iteration) => {
      const links = iteration.evidenceLinks.map((link) => `- [${link.label}](${link.url})`).join("\n");

      return [
        `### Iteration ${iteration.index}: ${iteration.title}`,
        `- Status: ${iteration.status}`,
        `- Built/changed: ${iteration.makerAction || "Not specified"}`,
        `- Verified: ${iteration.checkerAction || "Not specified"}`,
        `- Failure found: ${iteration.failureFound || "None recorded"}`,
        `- Fix applied: ${iteration.fixApplied || "None recorded"}`,
        links ? `Evidence:\n${links}` : "Evidence: None linked",
        `Source: ${iteration.sourceText}`
      ].join("\n");
    })
    .join("\n\n");

  return [
    `# ${report.name || "LoopLens Report"}`,
    report.description,
    `- Repository: ${report.repoUrl || "Not provided"}`,
    `- Live app: ${report.liveUrl || "Not provided"}`,
    `- Demo: ${report.demoUrl || "Not provided"}`,
    `- CI: ${report.ciUrl || "Not provided"}`,
    `- TestSprite: ${report.testspriteUrl || "Not provided"}`,
    `- Evidence completeness: ${report.evidenceScore?.percentage ?? 0}%`,
    "## Judge Summary",
    judge,
    "## Portfolio Summary",
    portfolio,
    "## Resume Bullets",
    resume,
    "## Timeline",
    timeline || "No iterations parsed yet."
  ]
    .filter(Boolean)
    .join("\n\n");
}
