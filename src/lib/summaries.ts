import type { GeneratedSummary, Iteration, ProjectReport, SummaryType } from "@/types/report";
import { countFixedFailures } from "./evidence";
import { createId } from "./ids";

export function generateTemplateSummaries(report: ProjectReport): GeneratedSummary[] {
  const sourceIterationIds = report.iterations.map((iteration) => iteration.id);
  const now = new Date().toISOString();

  return [
    createSummary("judge", createJudgeSummary(report), sourceIterationIds, now),
    createSummary("portfolio", createPortfolioSummary(report), sourceIterationIds, now),
    createSummary("resume", createResumeSummary(report), sourceIterationIds, now),
    createSummary("social", createSocialSummary(report), sourceIterationIds, now)
  ];
}

export function getSummary(report: ProjectReport, type: SummaryType): GeneratedSummary | undefined {
  return report.summaries.find((summary) => summary.type === type);
}

function createSummary(
  type: SummaryType,
  content: string,
  sourceIterationIds: string[],
  createdAt: string
): GeneratedSummary {
  return {
    id: createId("sum"),
    type,
    content,
    summarySource: "template",
    sourceIterationIds,
    createdAt
  };
}

function createJudgeSummary(report: ProjectReport): string {
  const loopCount = report.iterations.length;
  const fixedFailures = countFixedFailures(report.iterations);
  const strongest = findStrongestIteration(report.iterations);
  const score = report.evidenceScore?.percentage ?? 0;

  return [
    `${report.name || "This project"} includes ${loopCount} recorded engineering iteration${loopCount === 1 ? "" : "s"} with ${fixedFailures} fixed failure${fixedFailures === 1 ? "" : "s"}.`,
    `The evidence completeness score is ${score}%, based on links, raw LOOP.md evidence, iteration count, and publish status.`,
    strongest
      ? `Strongest iteration: ${strongest.title}.`
      : "No strongest iteration is selected yet because the report has no parsed iterations.",
    "This is an evidence completeness summary, not a guarantee of product quality or security."
  ].join("\n\n");
}

function createPortfolioSummary(report: ProjectReport): string {
  const fixedFailures = report.iterations
    .filter((iteration) => iteration.status === "fixed" || iteration.fixApplied)
    .slice(0, 3)
    .map((iteration) => `- ${iteration.title}`);

  return [
    `I built ${report.name || "this project"} and documented the engineering loop from raw evidence into a public proof report.`,
    report.description ? `Project context: ${report.description}` : "Project context is ready to be added.",
    fixedFailures.length
      ? `Testing improved the project through these recorded fixes:\n${fixedFailures.join("\n")}`
      : "No fixed failure has been recorded yet; adding one will strengthen the proof story."
  ].join("\n\n");
}

function createResumeSummary(report: ProjectReport): string {
  const loopCount = report.iterations.length;
  const fixedFailures = countFixedFailures(report.iterations);

  return [
    `- Built and documented ${report.name || "a software project"} through ${loopCount} AI-assisted development iteration${loopCount === 1 ? "" : "s"}.`,
    `- Preserved raw engineering evidence, parsed timeline entries, and generated judge-ready proof artifacts.`,
    `- Verified and improved the project with ${fixedFailures} recorded fixed failure${fixedFailures === 1 ? "" : "s"} and shareable evidence links.`
  ].join("\n");
}

function createSocialSummary(report: ProjectReport): string {
  const loopCount = report.iterations.length;
  const fixedFailures = countFixedFailures(report.iterations);

  return [
    `I shipped ${report.name || "a project"} with the loop visible: ${loopCount} iteration${loopCount === 1 ? "" : "s"}, ${fixedFailures} fixed failure${fixedFailures === 1 ? "" : "s"}, and a public proof report.`,
    "The goal is simple: show not just what was built, but how it was tested, broken, fixed, and verified."
  ].join("\n\n");
}

function findStrongestIteration(iterations: Iteration[]): Iteration | undefined {
  return (
    iterations.find((iteration) => iteration.status === "fixed") ??
    iterations.find((iteration) => iteration.failureFound || iteration.fixApplied) ??
    iterations[0]
  );
}
