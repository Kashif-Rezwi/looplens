"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileDown,
  History,
  Link as LinkIcon,
  RefreshCw,
  Rocket,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { collectReportEvidence, countFixedFailures } from "@/lib/evidence";
import { exportReportMarkdown } from "@/lib/markdown";
import { parseLoopMarkdown } from "@/lib/parser";
import { hydrateReport } from "@/lib/report-factory";
import { scanForSensitiveContent } from "@/lib/secret-scan";
import type { EvidenceLink, Iteration, IterationStatus, ProjectReport, PublishResult, SummaryType } from "@/types/report";

type PreviewMode = "timeline" | "judge" | "portfolio" | "markdown";
type StatusTone = IterationStatus | "draft" | "public" | "complete" | "warning" | "danger" | "muted";
type MarkdownBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

interface ReportWorkspaceProps {
  initialReport: ProjectReport;
  storageKey?: string;
}

const statusOptions: IterationStatus[] = ["unknown", "verified", "failed", "fixed", "blocked"];

export function ReportWorkspace({ initialReport, storageKey }: ReportWorkspaceProps) {
  const [report, setReport] = useState<ProjectReport>(initialReport);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeMode, setActiveMode] = useState<PreviewMode>("timeline");
  const [redactionAccepted, setRedactionAccepted] = useState(initialReport.publishMetadata.redactionChecklistAccepted);
  const [copyState, setCopyState] = useState("");
  const loopTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const [publishState, setPublishState] = useState<{
    loading: boolean;
    error: string;
    result?: PublishResult;
  }>({ loading: false, error: "" });

  const sensitiveWarnings = useMemo(
    () =>
      scanForSensitiveContent(
        [report.loopRawText, report.repoUrl, report.liveUrl, report.demoUrl, report.ciUrl, report.testspriteUrl].join("\n")
      ),
    [report.ciUrl, report.demoUrl, report.liveUrl, report.loopRawText, report.repoUrl, report.testspriteUrl]
  );
  const markdown = useMemo(() => exportReportMarkdown(report), [report]);
  const evidenceLinks = useMemo(() => collectReportEvidence(report), [report]);
  const fixedFailureCount = useMemo(() => countFixedFailures(report.iterations), [report.iterations]);
  const publishBlockers = useMemo(
    () => getPublishBlockers(report, redactionAccepted),
    [redactionAccepted, report]
  );
  const canPublish = publishBlockers.length === 0 && !publishState.loading;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (storageKey) {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          try {
            const restoredReport = hydrateReport(JSON.parse(saved) as ProjectReport);
            setReport(restoredReport);
            setRedactionAccepted(restoredReport.publishMetadata.redactionChecklistAccepted);
          } catch {
            window.localStorage.removeItem(storageKey);
          }
        }
      }
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !hasLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(report));
  }, [report, storageKey, hasLoaded]);

  function updateReport(updates: Partial<ProjectReport>) {
    setPublishState((current) => ({ ...current, result: undefined }));
    setReport((current) =>
      hydrateReport({
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      })
    );
  }

  function updateProjectField(field: keyof ProjectReport, value: string) {
    updateReport({ [field]: value } as Partial<ProjectReport>);
  }

  function updateTags(value: string) {
    updateReport({ tags: splitTags(value) });
  }

  function parseLoop() {
    const rawText = loopTextareaRef.current?.value ?? report.loopRawText;
    const iterations = parseLoopMarkdown(rawText);

    setReport((current) =>
      hydrateReport({
        ...current,
        loopRawText: rawText,
        iterations,
        updatedAt: new Date().toISOString()
      })
    );
    setActiveMode("timeline");
    window.requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateIteration(iterationId: string, updates: Partial<Iteration>) {
    updateReport({
      iterations: report.iterations.map((iteration) =>
        iteration.id === iterationId
          ? {
              ...iteration,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : iteration
      )
    });
  }

  async function publish() {
    if (publishBlockers.length > 0) {
      setPublishState({ loading: false, error: "Resolve the publish checklist before creating a public report." });
      return;
    }

    setPublishState({ loading: true, error: "" });

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          report: hydrateReport({
            ...report,
            publishMetadata: {
              redactionChecklistAccepted: redactionAccepted,
              warningCount: sensitiveWarnings.length
            }
          })
        })
      });

      const body = (await response.json()) as PublishResult | { error: string };

      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : "Could not publish report.");
      }

      setReport(body.report);
      setRedactionAccepted(body.report.publishMetadata.redactionChecklistAccepted);
      setPublishState({ loading: false, error: "", result: body });
    } catch (error) {
      setPublishState({
        loading: false,
        error: error instanceof Error ? error.message : "Could not publish report."
      });
    }
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState(""), 1800);
    } catch {
      setCopyState("Copy failed");
    }
  }

  return (
    <div className="ll-page-shell min-h-screen text-[var(--ink)]">
      <TechnicalHeader onPreviewMode={setActiveMode} />

      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 pb-10 pt-24 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:px-8">
        <section id="workspace" className="ll-anchor flex min-w-0 flex-col gap-4">
          <header className="ll-surface p-5">
            <StatusBadge label="Draft workspace" tone="draft" />
            <h1 className="font-display mt-4 max-w-sm text-4xl font-extrabold leading-[0.98] text-[var(--forest)] sm:text-5xl">
              Proof dashboard
            </h1>
            <p className="ll-muted-copy mt-4 border-l-2 border-[var(--forest)] pl-3">
              Paste evidence, review the parsed loop, then publish a judge-ready proof report.
            </p>
            <WorkflowSteps />
          </header>

          <Panel eyebrow="01" title="Project">
            <div className="grid gap-3 border-b border-[var(--line)] pb-3">
              <p className="ll-label text-[var(--forest)]">Required identity</p>
              <Field
                label="Project name"
                value={report.name}
                onChange={(value) => updateProjectField("name", value)}
                placeholder="LoopLens"
              />
              <Field
                label="Short description"
                value={report.description}
                onChange={(value) => updateProjectField("description", value)}
                placeholder="What did you build, and why should a judge care?"
                textarea
              />
              <Field
                label="Repository URL"
                value={report.repoUrl}
                onChange={(value) => updateProjectField("repoUrl", value)}
                placeholder="https://github.com/you/project"
              />
              <Field
                label="Live app URL"
                value={report.liveUrl}
                onChange={(value) => updateProjectField("liveUrl", value)}
                placeholder="https://your-app.vercel.app"
              />
            </div>
            <div className="grid gap-3">
              <p className="ll-label text-[var(--forest)]">Optional proof context</p>
              <Field
                label="Tags / tools"
                value={report.tags.join(", ")}
                onChange={updateTags}
                placeholder="Next.js, TestSprite, AI-assisted development"
              />
              <Field
                label="Demo URL"
                value={report.demoUrl}
                onChange={(value) => updateProjectField("demoUrl", value)}
                placeholder="Demo video or walkthrough"
              />
              <Field
                label="CI URL"
                value={report.ciUrl}
                onChange={(value) => updateProjectField("ciUrl", value)}
                placeholder="Build, check, or CI run"
              />
              <Field
                label="TestSprite URL"
                value={report.testspriteUrl}
                onChange={(value) => updateProjectField("testspriteUrl", value)}
                placeholder="TestSprite run or dashboard link"
              />
            </div>
          </Panel>

          <Panel eyebrow="02" title="LOOP.md">
            <p className="ll-muted-copy">
              Paste the build loop exactly as written. Raw source text stays attached to the public report as evidence.
            </p>
            <label className="grid gap-1.5">
              <span className="ll-label">Raw LOOP.md evidence</span>
              <textarea
                ref={loopTextareaRef}
                className="ll-input focus-ring min-h-44 resize-y font-mono text-sm"
                value={report.loopRawText}
                onChange={(event) => updateReport({ loopRawText: event.target.value })}
                placeholder="YYYY-MM-DD | Iteration N | Built/changed: ... | Verified: ... | Result: ... | Next: ..."
              />
            </label>
            <button className="ll-button-primary focus-ring w-full sm:w-auto" type="button" onClick={parseLoop}>
              <RefreshCw size={16} />
              Parse evidence
            </button>
          </Panel>

          <Panel eyebrow="03" title="Publish" marker>
            <p className="ll-muted-copy">
              Publish when the report is complete, reviewed, and safe to make public.
            </p>
            <PublishChecklist blockers={publishBlockers} />
            {sensitiveWarnings.length > 0 && (
              <div className="rounded-[6px] border border-[#c9a02e66] bg-[#fff8e1] p-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--warning)]">
                  <ShieldAlert size={16} />
                  Review warnings
                </div>
                <ul className="mt-2 grid gap-1 text-sm leading-6 text-[var(--muted)]">
                  {sensitiveWarnings.map((warning) => (
                    <li key={warning.label}>{warning.detail}</li>
                  ))}
                </ul>
              </div>
            )}
            <label className="focus-ring flex cursor-pointer items-start gap-3 rounded-[6px] border border-[var(--line)] bg-white p-3 text-sm leading-6 text-[var(--muted)]">
              <input
                className="mt-1 h-5 w-5 shrink-0 rounded-[4px] accent-[var(--forest)]"
                checked={redactionAccepted}
                type="checkbox"
                onChange={(event) => setRedactionAccepted(event.target.checked)}
              />
              <span>I reviewed this report for secrets, tokens, private URLs, customer data, internal notes, and sensitive logs.</span>
            </label>
            <button
              className="ll-button-secondary focus-ring w-full sm:w-auto"
              type="button"
              disabled={!canPublish}
              onClick={publish}
            >
              <Rocket size={16} />
              {publishState.loading ? "Publishing" : "Publish report"}
            </button>
            {publishState.error && (
              <p className="rounded-[6px] border border-[#d08a9b] bg-[#fff1f4] p-3 text-sm leading-6 text-[var(--danger)]">
                {publishState.error}
              </p>
            )}
            {publishState.result && (
              <div className="ll-success-callout p-3">
                <p className="mb-2 text-sm font-bold text-[var(--forest)]">Public proof report is live</p>
                <a
                  className="focus-ring inline-flex min-w-0 items-center justify-between gap-3 rounded-[6px] border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--forest)]"
                  href={publishState.result.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="truncate">{publishState.result.url}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </Panel>
        </section>

        <section id="preview" ref={previewRef} className="ll-anchor min-w-0">
          <div className="ll-grid-shell mb-4 grid grid-cols-2 gap-px border border-[var(--line)] sm:grid-cols-4">
            <ModeButton
              active={activeMode === "timeline"}
              index="01"
              icon={<History size={16} />}
              label="Timeline"
              onClick={() => setActiveMode("timeline")}
            />
            <ModeButton
              active={activeMode === "judge"}
              index="02"
              icon={<ShieldCheck size={16} />}
              label="Judge"
              onClick={() => setActiveMode("judge")}
            />
            <ModeButton
              active={activeMode === "portfolio"}
              index="03"
              icon={<Save size={16} />}
              label="Portfolio"
              onClick={() => setActiveMode("portfolio")}
            />
            <ModeButton
              active={activeMode === "markdown"}
              index="04"
              icon={<FileDown size={16} />}
              label="Markdown"
              onClick={() => setActiveMode("markdown")}
            />
          </div>

          {activeMode === "timeline" && (
            <div className="grid gap-4">
              <EvidenceScore report={report} />
              <TimelineEditor report={report} onUpdateIteration={updateIteration} />
            </div>
          )}

          {activeMode === "judge" && (
            <JudgePreview report={report} evidenceLinks={evidenceLinks} fixedFailureCount={fixedFailureCount} />
          )}

          {activeMode === "portfolio" && (
            <div className="grid gap-4">
              <SummaryCard eyebrow="Portfolio surface" title="Portfolio Summary" content={summaryContent(report, "portfolio")} />
              <SummaryCard eyebrow="Resume surface" title="Resume Bullets" content={summaryContent(report, "resume")} />
              <SummaryCard eyebrow="Social surface" title="Social Draft" content={summaryContent(report, "social")} />
            </div>
          )}

          {activeMode === "markdown" && (
            <div className="ll-surface p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
                <div>
                  <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">04. Markdown preview</p>
                  <h2 className="font-display mt-1 text-2xl font-extrabold text-[var(--forest)]">Shareable Report</h2>
                </div>
                <div className="flex items-center gap-3">
                  {copyState && (
                    <span aria-live="polite" className="text-sm font-bold text-[var(--forest)]">
                      {copyState}
                    </span>
                  )}
                  <button className="ll-button-ghost focus-ring" type="button" onClick={copyMarkdown}>
                    <Clipboard size={16} />
                    Copy
                  </button>
                </div>
              </div>
              <MarkdownPreview markdown={markdown} />
              <details className="mt-4 rounded-[6px] border border-[var(--line)] bg-white">
                <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-bold text-[var(--forest)]">Markdown source</summary>
                <textarea className="ll-input focus-ring min-h-72 resize-y rounded-t-none border-x-0 border-b-0 font-mono text-sm" readOnly value={markdown} />
              </details>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function TechnicalHeader({ onPreviewMode }: { onPreviewMode: (mode: PreviewMode) => void }) {
  return (
    <header className="ll-app-header fixed inset-x-0 top-0 z-50 border-b border-[var(--line)]">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[260px_1fr_auto] lg:px-8">
        <Link className="focus-ring flex min-w-0 items-center gap-3 rounded-[6px]" href="/" aria-label="LoopLens home">
          <span className="ll-logo-mark">
            <Sparkles size={16} />
          </span>
          <span className="font-display text-xl font-extrabold leading-none text-[var(--forest)]">LoopLens</span>
        </Link>

        <nav className="hidden items-center justify-center gap-6 md:flex" aria-label="Workspace sections">
          <a className="font-mono-tech text-xs font-bold text-[var(--muted)] hover:text-[var(--forest)]" href="#workspace">
            01. Workspace
          </a>
          <a className="font-mono-tech text-xs font-bold text-[var(--muted)] hover:text-[var(--forest)]" href="#preview">
            02. Preview
          </a>
          <a className="font-mono-tech text-xs font-bold text-[var(--muted)] hover:text-[var(--forest)]" href="#publish">
            03. Publish
          </a>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link className="ll-button-ghost focus-ring hidden min-h-11 px-3 text-sm sm:inline-flex" href="/sample">
            Sample
          </Link>
          <button className="ll-button-primary focus-ring min-h-11 px-3 text-sm" type="button" onClick={() => onPreviewMode("judge")}>
            Preview
          </button>
        </div>
      </div>
    </header>
  );
}

function Panel({
  eyebrow,
  title,
  children,
  marker = false
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  marker?: boolean;
}) {
  return (
    <section id={title === "Publish" ? "publish" : undefined} className={`ll-anchor ll-surface p-4 ${marker ? "corner-markers" : ""}`}>
      {marker && <span className="corner-marker" aria-hidden="true" />}
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
        <h2 className="font-mono-tech text-sm font-extrabold text-[var(--forest)]">
          {eyebrow}. {title}
        </h2>
        <span className="h-px flex-1 bg-[var(--line)]" aria-hidden="true" />
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="ll-label">{label}</span>
      {textarea ? (
        <textarea
          className="ll-input focus-ring min-h-24 resize-y"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input className="ll-input focus-ring" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ModeButton({
  active,
  icon,
  index,
  label,
  onClick
}: {
  active: boolean;
  icon: ReactNode;
  index: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      data-active={active}
      className="ll-mode-button focus-ring inline-flex items-center justify-center gap-2 rounded-none px-3 py-2"
      type="button"
      onClick={onClick}
    >
      {icon}
      <span className="hidden sm:inline">
        {index}. {label}
      </span>
      <span className="sm:hidden">{label}</span>
    </button>
  );
}

function StatusBadge({ label, tone = "muted" }: { label: string; tone?: StatusTone }) {
  return (
    <span className="ll-status-badge" data-tone={tone}>
      <span className="ll-status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function WorkflowSteps() {
  const steps = [
    ["01", "Add project links"],
    ["02", "Paste LOOP.md"],
    ["03", "Review timeline"],
    ["04", "Publish proof"]
  ];

  return (
    <div className="ll-grid-shell mt-5 grid gap-px border border-[var(--line)] sm:grid-cols-2">
      {steps.map(([index, label]) => (
        <div key={index} className="ll-paper p-3">
          <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">{index}</p>
          <p className="mt-1 text-sm font-bold text-[var(--forest)]">{label}</p>
        </div>
      ))}
    </div>
  );
}

function PublishChecklist({ blockers }: { blockers: string[] }) {
  if (blockers.length === 0) {
    return (
      <div className="ll-success-callout p-3 text-sm font-bold text-[var(--forest)]">
        Ready to publish once you click the button.
      </div>
    );
  }

  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
      <p className="mb-2 text-sm font-bold text-[var(--muted-strong)]">Before publishing</p>
      <ul className="grid gap-1 text-sm leading-6 text-[var(--muted)]">
        {blockers.map((blocker) => (
          <li key={blocker} className="flex gap-2">
            <AlertCircle className="mt-1 shrink-0 text-[var(--warning)]" size={14} />
            <span>{blocker}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvidenceScore({ report }: { report: ProjectReport }) {
  const percentage = report.evidenceScore?.percentage ?? 0;
  const passed = report.evidenceScore?.passed ?? 0;
  const total = report.evidenceScore?.total ?? 0;

  return (
    <section className="ll-surface">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_160px]">
        <div>
          <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">Evidence matrix</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold leading-none text-[var(--forest)]">Evidence Completeness</h2>
          <p className="ll-muted-copy mt-3">
            {passed} of {total} required proof signals are present. This measures evidence completeness, not product quality.
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <strong className="font-display text-5xl font-extrabold leading-none text-[var(--forest)]">{percentage}%</strong>
          <div className="ll-progress mt-3" aria-hidden="true">
            <div className="ll-progress-bar" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>
      <div className="grid border-t border-[var(--line)] sm:grid-cols-2">
        {report.evidenceScore?.items.map((item) => (
          <div
            key={item.id}
            data-passed={item.passed}
            className="ll-check-row border-b border-r border-[var(--line)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono-tech text-xs font-bold text-[var(--forest)]">{item.label}</p>
              {item.passed ? (
                <CheckCircle2 className="shrink-0 text-[var(--forest)]" size={16} aria-hidden="true" />
              ) : (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--line-strong)] bg-white" aria-hidden="true" />
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineEditor({
  report,
  onUpdateIteration
}: {
  report: ProjectReport;
  onUpdateIteration: (iterationId: string, updates: Partial<Iteration>) => void;
}) {
  if (report.iterations.length === 0) {
    return (
      <section className="ll-surface border-dashed p-8 text-center">
        <History className="mx-auto text-[var(--forest)]" size={30} />
        <h2 className="font-display mt-3 text-3xl font-extrabold text-[var(--forest)]">No timeline yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          Paste LOOP.md evidence in step 02 and click Parse evidence. Aim for at least two iterations and one fixed failure for a stronger proof story.
        </p>
      </section>
    );
  }

  return (
    <section className="ll-grid-shell grid gap-px border border-[var(--line)]">
      {report.iterations.map((iteration) => (
        <div key={iteration.id} className="ll-paper p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div className="border-l-2 border-[var(--forest)] pl-3">
              <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">Iteration {iteration.index}</p>
              <h3 className="font-display mt-1 text-2xl font-extrabold leading-tight text-[var(--forest)]">{iteration.title}</h3>
            </div>
            <div className="grid gap-1.5">
              <label className="sr-only" htmlFor={`iteration-status-${iteration.id}`}>
                Status for iteration {iteration.index}
              </label>
              <select
                id={`iteration-status-${iteration.id}`}
                aria-label={`Status for iteration ${iteration.index}`}
                className="focus-ring min-h-11 rounded-[6px] border border-[var(--line-strong)] bg-white px-3 py-2 font-mono text-xs font-bold text-[var(--ink)]"
                value={iteration.status}
                onChange={(event) => onUpdateIteration(iteration.id, { status: event.target.value as IterationStatus })}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3">
            <EditField label="Title" value={iteration.title} onChange={(value) => onUpdateIteration(iteration.id, { title: value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <EditField
                label="Built/changed"
                value={iteration.makerAction}
                onChange={(value) => onUpdateIteration(iteration.id, { makerAction: value })}
                textarea
              />
              <EditField
                label="Verified"
                value={iteration.checkerAction}
                onChange={(value) => onUpdateIteration(iteration.id, { checkerAction: value })}
                textarea
              />
              <EditField
                label="Failure found"
                value={iteration.failureFound}
                onChange={(value) => onUpdateIteration(iteration.id, { failureFound: value })}
                textarea
              />
              <EditField
                label="Fix applied"
                value={iteration.fixApplied}
                onChange={(value) => onUpdateIteration(iteration.id, { fixApplied: value })}
                textarea
              />
            </div>
            <details className="rounded-[6px] border border-[var(--line)] bg-white">
              <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-bold text-[var(--forest)]">Raw source evidence</summary>
              <p className="border-t border-[var(--line)] p-3 font-mono text-xs leading-6 text-[var(--muted)]">{iteration.sourceText}</p>
            </details>
            {iteration.evidenceLinks.length > 0 && (
              <div className="ll-grid-shell grid gap-px border border-[var(--line)]">
                {iteration.evidenceLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ll-paper focus-ring inline-flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-sm text-[var(--forest)]"
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate">
                      <LinkIcon size={14} />
                      <span className="truncate">{link.url}</span>
                    </span>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

function EditField({
  label,
  value,
  onChange,
  textarea = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="ll-label">{label}</span>
      {textarea ? (
        <textarea className="ll-input focus-ring min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="ll-input focus-ring" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function JudgePreview({
  report,
  evidenceLinks,
  fixedFailureCount
}: {
  report: ProjectReport;
  evidenceLinks: EvidenceLink[];
  fixedFailureCount: number;
}) {
  const judgeSummary = summaryContent(report, "judge");
  const proofItems = [
    ["Evidence score", `${report.evidenceScore?.percentage ?? 0}%`],
    ["Iterations", String(report.iterations.length)],
    ["Fixed failures", String(fixedFailureCount)],
    ["Evidence links", String(evidenceLinks.length)]
  ];

  return (
    <section className="grid gap-4">
      <div className="ll-grid-shell grid gap-px border border-[var(--line)] sm:grid-cols-4">
        {proofItems.map(([label, value]) => (
          <div key={label} className="ll-paper p-4">
            <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">{label}</p>
            <strong className="font-display mt-2 block text-3xl font-extrabold leading-none text-[var(--forest)]">{value}</strong>
          </div>
        ))}
      </div>
      <div className="ll-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">Judge mode</p>
            <h2 className="font-display mt-1 text-3xl font-extrabold text-[var(--forest)]">Reviewer Proof Brief</h2>
          </div>
          <StatusBadge label={report.publishedAt ? "Public proof live" : "Draft proof"} tone={report.publishedAt ? "public" : "draft"} />
        </div>
        <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{judgeSummary || "No judge summary generated yet."}</div>
      </div>
      <EvidenceLinkList links={evidenceLinks} />
    </section>
  );
}

function EvidenceLinkList({ links }: { links: EvidenceLink[] }) {
  return (
    <section className="ll-surface">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] p-4">
        <div className="flex items-center gap-2">
          <LinkIcon size={18} className="text-[var(--forest)]" />
          <h2 className="font-display text-2xl font-extrabold text-[var(--forest)]">Evidence Links</h2>
        </div>
        <span className="font-mono-tech text-xs font-bold text-[var(--muted)]">{links.length} refs</span>
      </div>
      <div className="ll-grid-shell grid gap-px p-px">
        {links.length ? (
          links.slice(0, 6).map((link) => (
            <a
              key={`${link.url}-${link.iterationId ?? "project"}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="ll-paper focus-ring flex min-w-0 items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="min-w-0 truncate text-[var(--ink)]">{link.label}</span>
              <span className="flex shrink-0 items-center gap-2 font-mono text-xs font-bold text-[var(--forest)]">
                {link.type}
                <ExternalLink size={14} />
              </span>
            </a>
          ))
        ) : (
          <p className="ll-paper p-4 text-sm text-[var(--muted)]">No evidence links yet.</p>
        )}
      </div>
    </section>
  );
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  const blocks = useMemo(() => parseMarkdownBlocks(markdown), [markdown]);

  return (
    <article className="ll-markdown rounded-[6px] border border-[var(--line)] bg-white p-5">
      {blocks.map((block, index) => {
        if (block.type === "h1") {
          return (
            <h1 key={`${block.type}-${index}`} className="font-display text-4xl font-extrabold leading-tight text-[var(--forest)]">
              {renderMarkdownInline(block.text)}
            </h1>
          );
        }

        if (block.type === "h2") {
          return (
            <h2 key={`${block.type}-${index}`} className="font-display text-2xl font-extrabold leading-tight text-[var(--forest)]">
              {renderMarkdownInline(block.text)}
            </h2>
          );
        }

        if (block.type === "h3") {
          return (
            <h3 key={`${block.type}-${index}`} className="font-display text-xl font-extrabold leading-tight text-[var(--forest)]">
              {renderMarkdownInline(block.text)}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="grid gap-2 text-sm leading-7 text-[var(--muted)]">
              {block.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--forest)]" aria-hidden="true" />
                  <span>{renderMarkdownInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-sm leading-7 text-[var(--muted)]">
            {renderMarkdownInline(block.text)}
          </p>
        );
      })}
    </article>
  );
}

function SummaryCard({ eyebrow, title, content }: { eyebrow: string; title: string; content?: string }) {
  return (
    <section className="ll-surface p-5">
      <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">{eyebrow}</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold leading-none text-[var(--forest)]">{title}</h2>
      <div className="mt-4 whitespace-pre-line border-l-2 border-[var(--line-strong)] pl-4 text-sm leading-7 text-[var(--muted)]">
        {content || "No summary generated yet."}
      </div>
    </section>
  );
}

function summaryContent(report: ProjectReport, type: SummaryType) {
  return report.summaries.find((summary) => summary.type === type)?.content;
}

function getPublishBlockers(report: ProjectReport, redactionAccepted: boolean) {
  const blockers: string[] = [];
  if (!report.name.trim()) blockers.push("Add a project name.");
  if (!isHttpUrl(report.repoUrl)) blockers.push("Add a valid repository URL.");
  if (!isHttpUrl(report.liveUrl)) blockers.push("Add a valid live app URL.");
  if (!report.loopRawText.trim()) blockers.push("Paste LOOP.md evidence.");
  if (report.iterations.length === 0) blockers.push("Parse LOOP.md into at least one timeline card.");
  if (!redactionAccepted) blockers.push("Accept the redaction and privacy checklist.");
  return blockers;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
    paragraphLines.length = 0;
  }

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: [...listItems] });
    listItems.length = 0;
  }

  markdown.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: trimmed.slice(4) });
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: trimmed.slice(3) });
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h1", text: trimmed.slice(2) });
      return;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    paragraphLines.push(trimmed);
  });

  flushParagraph();
  flushList();

  return blocks;
}

function renderMarkdownInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    nodes.push(
      <a
        key={`${match[1]}-${match.index}`}
        className="font-bold text-[var(--forest)] underline decoration-[var(--line-strong)] underline-offset-4"
        href={match[2]}
        target="_blank"
        rel="noreferrer"
      >
        {match[1]}
      </a>
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes.length ? nodes : [text];
}
