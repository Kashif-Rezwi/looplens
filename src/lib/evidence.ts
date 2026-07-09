import type { EvidenceLink, EvidenceType, Iteration, ProjectReport } from "@/types/report";
import { createId } from "./ids";

const URL_REGEX = /https?:\/\/[^\s)\]}>"']+/gi;

export function extractUrls(text: string): string[] {
  return Array.from(new Set(text.match(URL_REGEX) ?? []));
}

export function inferEvidenceType(url: string): EvidenceType {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("github.com") && lowerUrl.includes("actions")) return "ci";
  if (lowerUrl.includes("testsprite")) return "testsprite";
  if (lowerUrl.includes("github.com")) return "repo";
  if (lowerUrl.includes("vercel.app") || lowerUrl.includes("netlify.app")) return "live";
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("loom.com")) {
    return "demo";
  }

  return "other";
}

export function createEvidenceLink(
  url: string,
  label = "Evidence link",
  iterationId?: string
): EvidenceLink {
  return {
    id: createId("ev"),
    url,
    label,
    type: inferEvidenceType(url),
    iterationId
  };
}

export function collectReportEvidence(report: ProjectReport): EvidenceLink[] {
  const projectLinks = [
    report.repoUrl && createEvidenceLink(report.repoUrl, "Repository"),
    report.liveUrl && createEvidenceLink(report.liveUrl, "Live app"),
    report.demoUrl && createEvidenceLink(report.demoUrl, "Demo"),
    report.ciUrl && createEvidenceLink(report.ciUrl, "CI"),
    report.testspriteUrl && createEvidenceLink(report.testspriteUrl, "TestSprite")
  ].filter(Boolean) as EvidenceLink[];

  const iterationLinks = report.iterations.flatMap((iteration) => iteration.evidenceLinks);
  const unique = new Map<string, EvidenceLink>();

  [...projectLinks, ...iterationLinks].forEach((link) => {
    unique.set(`${link.url}:${link.iterationId ?? "project"}`, link);
  });

  return Array.from(unique.values());
}

export function countFixedFailures(iterations: Iteration[]): number {
  return iterations.filter((iteration) => {
    const text = `${iteration.failureFound} ${iteration.fixApplied} ${iteration.status}`.toLowerCase();
    return iteration.status === "fixed" || (text.includes("fail") && text.includes("fix"));
  }).length;
}
