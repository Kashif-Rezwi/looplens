import type { ProjectReport } from "@/types/report";
import { createId } from "./ids";
import { calculateEvidenceScore } from "./score";
import { generateTemplateSummaries } from "./summaries";

export function createEmptyReport(): ProjectReport {
  const now = new Date().toISOString();

  return hydrateReport({
    id: createId("report"),
    name: "",
    description: "",
    repoUrl: "",
    liveUrl: "",
    demoUrl: "",
    ciUrl: "",
    testspriteUrl: "",
    tags: [],
    loopRawText: "",
    visibility: "draft",
    publishMetadata: {
      redactionChecklistAccepted: false,
      warningCount: 0
    },
    iterations: [],
    summaries: [],
    createdAt: now,
    updatedAt: now
  });
}

export function hydrateReport(report: ProjectReport): ProjectReport {
  const withScore = {
    ...report,
    evidenceScore: calculateEvidenceScore(report)
  };

  return {
    ...withScore,
    summaries: generateTemplateSummaries(withScore)
  };
}
