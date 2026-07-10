"use client";

import {
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
import { ReportView } from "@/features/reports/report-view";
import { exportReportMarkdown } from "@/lib/markdown";
import { parseLoopMarkdown } from "@/lib/parser";
import { hydrateReport } from "@/lib/report-factory";
import { scanForSensitiveContent } from "@/lib/secret-scan";
import type { Iteration, IterationStatus, ProjectReport, PublishResult } from "@/types/report";

type PreviewMode = "timeline" | "judge" | "portfolio" | "markdown";

interface ReportWorkspaceProps {
  initialReport: ProjectReport;
  storageKey?: string;
}

const statusOptions: IterationStatus[] = ["unknown", "verified", "failed", "fixed", "blocked"];

export function ReportWorkspace({ initialReport, storageKey }: ReportWorkspaceProps) {
  const [report, setReport] = useState<ProjectReport>(initialReport);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeMode, setActiveMode] = useState<PreviewMode>("timeline");
  const [redactionAccepted, setRedactionAccepted] = useState(false);
  const loopTextareaRef = useRef<HTMLTextAreaElement | null>(null);
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

  // Load from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          setReport(hydrateReport(JSON.parse(saved) as ProjectReport));
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }
    }
    setHasLoaded(true);
  }, [storageKey]);

  // Save to localStorage when report changes
  useEffect(() => {
    if (!storageKey || !hasLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(report));
  }, [report, storageKey, hasLoaded]);

  function updateReport(updates: Partial<ProjectReport>) {
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
  }

  function updateIteration(iterationId: string, updates: Partial<Iteration>) {
    setReport((current) =>
      hydrateReport({
        ...current,
        iterations: current.iterations.map((iteration) =>
          iteration.id === iterationId
            ? {
                ...iteration,
                ...updates,
                updatedAt: new Date().toISOString()
              }
            : iteration
        ),
        updatedAt: new Date().toISOString()
      })
    );
  }

  async function publish() {
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
      setPublishState({ loading: false, error: "", result: body });
    } catch (error) {
      setPublishState({
        loading: false,
        error: error instanceof Error ? error.message : "Could not publish report."
      });
    }
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
      <section className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-5 lg:max-h-[calc(100vh-40px)] lg:overflow-y-auto">
        <header className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--teal)]">LoopLens</p>
              <h1 className="mt-1 text-2xl font-bold">Proof dashboard</h1>
            </div>
            <Link
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[var(--line)] text-[var(--teal)]"
              href="/sample"
              title="Open sample"
            >
              <Sparkles size={18} />
            </Link>
          </div>
        </header>

        <Panel title="Project">
          <Field label="Project name" value={report.name} onChange={(value) => updateProjectField("name", value)} />
          <Field
            label="Short description"
            value={report.description}
            onChange={(value) => updateProjectField("description", value)}
            textarea
          />
          <Field label="Repository URL" value={report.repoUrl} onChange={(value) => updateProjectField("repoUrl", value)} />
          <Field label="Live app URL" value={report.liveUrl} onChange={(value) => updateProjectField("liveUrl", value)} />
          <Field label="Demo URL" value={report.demoUrl} onChange={(value) => updateProjectField("demoUrl", value)} />
          <Field label="CI URL" value={report.ciUrl} onChange={(value) => updateProjectField("ciUrl", value)} />
          <Field
            label="TestSprite URL"
            value={report.testspriteUrl}
            onChange={(value) => updateProjectField("testspriteUrl", value)}
          />
        </Panel>

        <Panel title="LOOP.md">
          <textarea
            ref={loopTextareaRef}
            className="focus-ring min-h-44 w-full resize-y rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-sm leading-6"
            value={report.loopRawText}
            onChange={(event) => updateReport({ loopRawText: event.target.value })}
            placeholder="YYYY-MM-DD | Iteration N | Built/changed: ... | Verified: ... | Result: ... | Next: ..."
          />
          <button
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--teal-dark)]"
            type="button"
            onClick={parseLoop}
          >
            <RefreshCw size={16} />
            Parse evidence
          </button>
        </Panel>

        <Panel title="Publish">
          {sensitiveWarnings.length > 0 && (
            <div className="rounded-[8px] border border-[#f3c17b] bg-[#fff8ed] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--amber)]">
                <ShieldAlert size={16} />
                Review warnings
              </div>
              <ul className="mt-2 grid gap-1 text-sm text-[var(--muted)]">
                {sensitiveWarnings.map((warning) => (
                  <li key={warning.label}>{warning.detail}</li>
                ))}
              </ul>
            </div>
          )}
          <label className="flex items-start gap-3 text-sm leading-6 text-[var(--muted)]">
            <input
              className="mt-1 h-4 w-4 accent-[var(--teal)]"
              checked={redactionAccepted}
              type="checkbox"
              onChange={(event) => setRedactionAccepted(event.target.checked)}
            />
            <span>I reviewed this report for secrets, tokens, private URLs, customer data, internal notes, and sensitive logs.</span>
          </label>
          <button
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={publishState.loading}
            onClick={publish}
          >
            <Rocket size={16} />
            {publishState.loading ? "Publishing" : "Publish report"}
          </button>
          {publishState.error && (
            <p className="rounded-[8px] border border-[#f0b3c1] bg-[#fff1f4] p-3 text-sm text-[var(--rose)]">
              {publishState.error}
            </p>
          )}
          {publishState.result && (
            <a
              className="focus-ring inline-flex min-w-0 items-center justify-between gap-3 rounded-[8px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--teal)]"
              href={publishState.result.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="truncate">{publishState.result.url}</span>
              <ExternalLink size={14} />
            </a>
          )}
        </Panel>
      </section>

      <section className="min-w-0">
        <div className="mb-4 grid gap-3 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-3 shadow-sm lg:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ModeButton active={activeMode === "timeline"} icon={<History size={16} />} label="Timeline" onClick={() => setActiveMode("timeline")} />
            <ModeButton active={activeMode === "judge"} icon={<ShieldCheck size={16} />} label="Judge" onClick={() => setActiveMode("judge")} />
            <ModeButton active={activeMode === "portfolio"} icon={<Save size={16} />} label="Portfolio" onClick={() => setActiveMode("portfolio")} />
            <ModeButton active={activeMode === "markdown"} icon={<FileDown size={16} />} label="Markdown" onClick={() => setActiveMode("markdown")} />
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[8px] bg-[var(--panel-strong)] p-3 text-center text-sm">
            <Metric label="Score" value={`${report.evidenceScore?.percentage ?? 0}%`} />
            <Metric label="Loops" value={String(report.iterations.length)} />
            <Metric label="Links" value={String(report.iterations.flatMap((iteration) => iteration.evidenceLinks).length)} />
          </div>
        </div>

        {activeMode === "timeline" && (
          <div className="grid gap-4">
            <EvidenceScore report={report} />
            <TimelineEditor report={report} onUpdateIteration={updateIteration} />
          </div>
        )}

        {activeMode === "judge" && <ReportView report={report} />}

        {activeMode === "portfolio" && (
          <div className="grid gap-4">
            <SummaryCard title="Portfolio Summary" content={report.summaries.find((summary) => summary.type === "portfolio")?.content} />
            <SummaryCard title="Resume Bullets" content={report.summaries.find((summary) => summary.type === "resume")?.content} />
            <SummaryCard title="Social Draft" content={report.summaries.find((summary) => summary.type === "social")?.content} />
          </div>
        )}

        {activeMode === "markdown" && (
          <div className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Markdown Export</h2>
              <button
                className="focus-ring inline-flex items-center gap-2 rounded-[8px] border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--teal)]"
                type="button"
                onClick={copyMarkdown}
              >
                <Clipboard size={16} />
                Copy
              </button>
            </div>
            <textarea
              className="focus-ring min-h-[520px] w-full resize-y rounded-[8px] border border-[var(--line)] bg-[#fbfcfa] p-3 font-mono text-sm leading-6"
              readOnly
              value={markdown}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--teal)]">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Field({
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
  const sharedClass =
    "focus-ring w-full rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-sm leading-6";

  return (
    <label className="grid gap-1 text-sm font-medium text-[var(--ink)]">
      {label}
      {textarea ? (
        <textarea className={`${sharedClass} min-h-24 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={sharedClass} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold ${
        active ? "bg-[var(--teal)] text-white" : "border border-[var(--line)] text-[var(--muted)]"
      }`}
      type="button"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function EvidenceScore({ report }: { report: ProjectReport }) {
  return (
    <section className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Evidence Completeness</h2>
          <p className="text-sm text-[var(--muted)]">
            {report.evidenceScore?.passed ?? 0} of {report.evidenceScore?.total ?? 0} signals present
          </p>
        </div>
        <strong className="text-3xl text-[var(--teal)]">{report.evidenceScore?.percentage ?? 0}%</strong>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {report.evidenceScore?.items.map((item) => (
          <div
            key={item.id}
            className={`rounded-[8px] border px-3 py-2 text-sm ${
              item.passed ? "border-[#a8d7c6] bg-[#f0faf6]" : "border-[var(--line)] bg-[#fbfcfa]"
            }`}
          >
            <p className="font-semibold">{item.label}</p>
            <p className="mt-1 truncate text-[var(--muted)]">{item.detail}</p>
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
      <section className="rounded-[8px] border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center">
        <History className="mx-auto text-[var(--teal)]" size={28} />
        <h2 className="mt-3 text-xl font-semibold">No timeline yet</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Paste `LOOP.md` evidence and parse it.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {report.iterations.map((iteration) => (
        <div key={iteration.id} className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--teal)]">Iteration {iteration.index}</p>
            <select
              className="focus-ring rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-sm capitalize"
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
            <div className="rounded-[8px] bg-[#f5f3ee] p-3 text-sm leading-6 text-[var(--muted)]">{iteration.sourceText}</div>
            {iteration.evidenceLinks.length > 0 && (
              <div className="grid gap-2">
                {iteration.evidenceLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex min-w-0 items-center justify-between gap-3 rounded-[8px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--teal)]"
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
  const className = "focus-ring w-full rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-sm leading-6";

  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {textarea ? (
        <textarea className={`${className} min-h-24 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={className} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function SummaryCard({ title, content }: { title: string; content?: string }) {
  return (
    <section className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{content || "No summary generated yet."}</div>
    </section>
  );
}
