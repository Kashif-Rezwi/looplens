import { describe, expect, it } from "vitest";
import { sampleReport } from "@/data/sample-report";
import { exportReportMarkdown } from "@/lib/markdown";
import { hydrateReport } from "@/lib/report-factory";
import { validatePublishReport } from "@/lib/validation";

describe("report logic", () => {
  it("calculates an explainable evidence score", () => {
    expect(sampleReport.evidenceScore?.percentage).toBeGreaterThan(50);
    expect(sampleReport.evidenceScore?.items.some((item) => item.id === "fixed-failure")).toBe(true);
  });

  it("generates deterministic summaries without AI", () => {
    const summaries = sampleReport.summaries;

    expect(summaries).toHaveLength(4);
    expect(summaries.every((summary) => summary.summarySource === "template")).toBe(true);
    expect(summaries.find((summary) => summary.type === "judge")?.content).toContain("evidence completeness");
  });

  it("exports markdown with project links and timeline", () => {
    const markdown = exportReportMarkdown(sampleReport);

    expect(markdown).toContain("# LoopLens");
    expect(markdown).toContain("Repository:");
    expect(markdown).toContain("## Timeline");
    expect(markdown).toContain("Iteration 2");
  });

  it("enforces publish validation", () => {
    const invalidReport = hydrateReport({
      ...sampleReport,
      repoUrl: "",
      publishMetadata: {
        redactionChecklistAccepted: false,
        warningCount: 0
      }
    });

    const result = validatePublishReport(invalidReport);

    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toContain("repository URL");
    expect(result.errors.join(" ")).toContain("redaction checklist");
  });
});
