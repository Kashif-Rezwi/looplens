import type { ProjectReport } from "@/types/report";
import { collectReportEvidence } from "./evidence";

export const PUBLISH_LIMITS = {
  maxRawLoopLength: 50_000,
  maxIterations: 60,
  maxEvidenceLinks: 120,
  maxPayloadBytes: 256 * 1024
};

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validatePublishReport(report: ProjectReport): ValidationResult {
  const errors: string[] = [];

  if (!report.name.trim()) errors.push("Project name is required.");
  if (!isValidUrl(report.repoUrl)) errors.push("A valid repository URL is required.");
  if (!isValidUrl(report.liveUrl)) errors.push("A valid live app URL is required.");
  if (!report.loopRawText.trim()) errors.push("LOOP.md evidence is required.");
  if (!report.publishMetadata.redactionChecklistAccepted) {
    errors.push("The redaction checklist must be accepted before publishing.");
  }
  if (report.loopRawText.length > PUBLISH_LIMITS.maxRawLoopLength) {
    errors.push(`LOOP.md evidence must be ${PUBLISH_LIMITS.maxRawLoopLength} characters or less.`);
  }
  if (report.iterations.length > PUBLISH_LIMITS.maxIterations) {
    errors.push(`Reports can include at most ${PUBLISH_LIMITS.maxIterations} iterations.`);
  }
  if (collectReportEvidence(report).length > PUBLISH_LIMITS.maxEvidenceLinks) {
    errors.push(`Reports can include at most ${PUBLISH_LIMITS.maxEvidenceLinks} evidence links.`);
  }

  const payloadBytes = new TextEncoder().encode(JSON.stringify(report)).length;
  if (payloadBytes > PUBLISH_LIMITS.maxPayloadBytes) {
    errors.push(`Published report payload must be ${PUBLISH_LIMITS.maxPayloadBytes} bytes or less.`);
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
