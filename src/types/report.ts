export type IterationStatus = "unknown" | "verified" | "failed" | "fixed" | "blocked";

export type EvidenceType =
  | "repo"
  | "live"
  | "demo"
  | "ci"
  | "testsprite"
  | "source"
  | "other";

export type SummaryType = "judge" | "portfolio" | "resume" | "social";

export type SummarySource = "template" | "ai";

export type Visibility = "draft" | "public";

export interface EvidenceLink {
  id: string;
  url: string;
  label: string;
  type: EvidenceType;
  iterationId?: string;
}

export interface Iteration {
  id: string;
  index: number;
  title: string;
  makerAction: string;
  checkerAction: string;
  failureFound: string;
  fixApplied: string;
  status: IterationStatus;
  evidenceLinks: EvidenceLink[];
  sourceText: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedSummary {
  id: string;
  type: SummaryType;
  content: string;
  summarySource: SummarySource;
  sourceIterationIds: string[];
  createdAt: string;
}

export interface EvidenceScoreItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface EvidenceScore {
  total: number;
  passed: number;
  percentage: number;
  items: EvidenceScoreItem[];
}

export interface PublishMetadata {
  redactionChecklistAccepted: boolean;
  publishConfirmedAt?: string;
  warningCount: number;
}

export interface ProjectReport {
  id: string;
  slug?: string;
  name: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  demoUrl: string;
  ciUrl: string;
  testspriteUrl: string;
  tags: string[];
  loopRawText: string;
  visibility: Visibility;
  publishMetadata: PublishMetadata;
  iterations: Iteration[];
  summaries: GeneratedSummary[];
  evidenceScore?: EvidenceScore;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PublishResult {
  slug: string;
  url: string;
  report: ProjectReport;
}
