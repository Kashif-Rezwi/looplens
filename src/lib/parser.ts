import type { Iteration, IterationStatus } from "@/types/report";
import { createEvidenceLink, extractUrls } from "./evidence";
import { createId } from "./ids";

type LabeledSegments = Record<string, string>;

const ENTRY_START_REGEX =
  /^(\d{4}-\d{2}-\d{2}\s*\||[-*]\s+|\d+[\).]\s+|iteration\s+\d+|iter\s+\d+)/i;

const LABEL_ALIASES: Record<string, keyof LabeledSegments> = {
  "built/changed": "built",
  built: "built",
  changed: "built",
  maker: "built",
  verified: "verified",
  checked: "verified",
  tested: "verified",
  result: "result",
  failed: "failed",
  failure: "failed",
  fixed: "fixed",
  fix: "fixed",
  next: "next",
  status: "status"
};

export function parseLoopMarkdown(rawText: string): Iteration[] {
  const entries = splitIntoEntries(rawText);
  const now = new Date().toISOString();

  return entries.map((entry, position) => {
    const normalizedEntry = entry.replace(/^[-*]\s+/, "").trim();
    const labels = extractLabels(normalizedEntry);
    const iterationNumber = detectIterationNumber(normalizedEntry) ?? position + 1;
    const urls = extractUrls(normalizedEntry);
    const id = createId("it");

    const makerAction = labels.built ?? "";
    const checkerAction = labels.verified ?? "";
    const failureFound = labels.failed ?? inferFailureText(labels.result ?? normalizedEntry);
    const fixApplied = labels.fixed ?? inferFixText(normalizedEntry);
    const status = labels.status
      ? detectStatus(labels.status)
      : labels.fixed
        ? "fixed"
        : detectStatus(labels.result ?? normalizedEntry);

    return {
      id,
      index: iterationNumber,
      title: createTitle(iterationNumber, makerAction, normalizedEntry),
      makerAction,
      checkerAction,
      failureFound,
      fixApplied,
      status,
      evidenceLinks: urls.map((url) => createEvidenceLink(url, "Source evidence", id)),
      sourceText: normalizedEntry,
      createdAt: now,
      updatedAt: now
    };
  });
}

export function detectStatus(text: string): IterationStatus {
  const lowerText = text.toLowerCase();

  if (/\b(blocked|stuck|cannot proceed)\b/.test(lowerText)) return "blocked";
  if (/\b(fixed|resolved|rerun passed|verified after fix)\b/.test(lowerText)) return "fixed";
  if (/\b(failed|failure|broken|error|regression)\b/.test(lowerText)) return "failed";
  if (/\b(passed|pass|verified|complete|working)\b/.test(lowerText)) return "verified";

  return "unknown";
}

function splitIntoEntries(rawText: string): string[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.toLowerCase().startsWith("purpose:"));

  const entries: string[] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    const startsEntry = ENTRY_START_REGEX.test(line) || line.includes(" | Iteration ");

    if (startsEntry && current.length > 0) {
      entries.push(current.join(" "));
      current = [line];
      return;
    }

    if (startsEntry || current.length > 0) {
      current.push(line);
    }
  });

  if (current.length > 0) entries.push(current.join(" "));

  if (entries.length === 0 && rawText.trim()) {
    return [rawText.trim()];
  }

  return entries;
}

function extractLabels(entry: string): LabeledSegments {
  const labels: LabeledSegments = {};
  const parts = entry.split("|").map((part) => part.trim());

  parts.forEach((part) => {
    const match = part.match(/^([^:]{2,32}):\s*(.+)$/);
    if (!match) return;

    const rawLabel = match[1].trim().toLowerCase();
    const value = match[2].trim();
    const normalizedLabel = LABEL_ALIASES[rawLabel];

    if (normalizedLabel) {
      labels[normalizedLabel] = value;
    }
  });

  const labelRegex =
    /\b(Built\/changed|Built|Changed|Maker|Verified|Checked|Tested|Result|Failed|Failure|Fixed|Fix|Next|Status):\s*/gi;
  const matches = Array.from(entry.matchAll(labelRegex));

  matches.forEach((match, index) => {
    const rawLabel = match[1].trim().toLowerCase();
    const normalizedLabel = LABEL_ALIASES[rawLabel];
    if (!normalizedLabel) return;

    const valueStart = match.index === undefined ? 0 : match.index + match[0].length;
    const nextMatch = matches[index + 1];
    const valueEnd = nextMatch?.index ?? entry.length;
    const value = entry.slice(valueStart, valueEnd).replace(/\s+\|\s*$/, "").trim();

    if (value) {
      labels[normalizedLabel] = value;
    }
  });

  return labels;
}

function detectIterationNumber(entry: string): number | undefined {
  const match = entry.match(/\bIteration\s+(\d+)\b/i) ?? entry.match(/\bIter\s+(\d+)\b/i);
  if (!match) return undefined;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function inferFailureText(text: string): string {
  return /\b(fail|failed|failure|broken|error|regression)\b/i.test(text) ? text : "";
}

function inferFixText(text: string): string {
  const fixMatch = text.match(/(?:fixed|resolved|fix applied)[:\s-]+(.+)/i);
  return fixMatch?.[1]?.trim() ?? "";
}

function createTitle(iterationNumber: number, makerAction: string, sourceText: string): string {
  if (makerAction) {
    return `Iteration ${iterationNumber}: ${truncate(makerAction, 72)}`;
  }

  return `Iteration ${iterationNumber}: ${truncate(sourceText, 72)}`;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}
