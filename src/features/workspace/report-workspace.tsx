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

const accentClasses = ["border-l-[#FF8C69]", "border-l-[#9EFFBF]", "border-l-[#F4D35E]", "border-l-[#1A3C2B]"];

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
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
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [storageKey]);

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
    <div className="ll-page-shell min-h-screen text-[var(--ink)]">
      <TechnicalHeader onPreviewMode={setActiveMode} />

      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 pb-10 pt-24 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:px-8">
        <section
          id="workspace"
          className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto"
        >
          <header className="ll-surface p-5">
            <StatusBadge label="Draft workspace" />
            <h1 className="font-display mt-4 max-w-sm text-4xl font-bold leading-[0.95] tracking-normal text-[var(--forest)] sm:text-5xl">
              Proof dashboard
            </h1>
            <p className="ll-muted-copy mt-4 border-l border-[var(--forest)] pl-3">
              Turn project links and LOOP.md evidence into a judge-ready proof report.
            </p>
            <WorkflowSteps />
          </header>

          <Panel eyebrow="01" title="Project">
            <div className="grid gap-3 border-b border-[var(--line)] pb-3">
              <p className="ll-label text-[var(--forest)]">Required proof identity</p>
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
              <p className="ll-label text-[var(--forest)]">Optional evidence links</p>
              <Field label="Demo URL" value={report.demoUrl} onChange={(value) => updateProjectField("demoUrl", value)} placeholder="Demo video or walkthrough" />
              <Field label="CI URL" value={report.ciUrl} onChange={(value) => updateProjectField("ciUrl", value)} placeholder="Build, check, or CI run" />
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
              Paste the build loop exactly as written. LoopLens keeps the raw source text so the public report can show its evidence trail.
            </p>
            <textarea
              ref={loopTextareaRef}
              className="ll-input focus-ring min-h-40 resize-y font-mono"
              value={report.loopRawText}
              onChange={(event) => updateReport({ loopRawText: event.target.value })}
              placeholder="YYYY-MM-DD | Iteration N | Built/changed: ... | Verified: ... | Result: ... | Next: ..."
            />
            <button className="ll-button-primary focus-ring w-full sm:w-auto" type="button" onClick={parseLoop}>
              <RefreshCw size={15} />
              Parse evidence
            </button>
          </Panel>

          <Panel eyebrow="03" title="Publish" marker>
            <p className="ll-muted-copy">
              Publish only after the timeline looks right and sensitive details have been removed.
            </p>
            {sensitiveWarnings.length > 0 && (
              <div className="border border-[#b98338] bg-[#fff8e1] p-3">
                <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--warning)]">
                  <ShieldAlert size={15} />
                  Review warnings
                </div>
                <ul className="mt-2 grid gap-1 text-sm leading-6 text-[var(--muted)]">
                  {sensitiveWarnings.map((warning) => (
                    <li key={warning.label}>{warning.detail}</li>
                  ))}
                </ul>
              </div>
            )}
            <label className="flex items-start gap-3 text-sm leading-6 text-[var(--muted)]">
              <input
                className="mt-1 h-4 w-4 rounded-none accent-[var(--forest)]"
                checked={redactionAccepted}
                type="checkbox"
                onChange={(event) => setRedactionAccepted(event.target.checked)}
              />
              <span>I reviewed this report for secrets, tokens, private URLs, customer data, internal notes, and sensitive logs.</span>
            </label>
            <button
              className="ll-button-secondary focus-ring w-full sm:w-auto"
              type="button"
              disabled={publishState.loading}
              onClick={publish}
            >
              <Rocket size={15} />
              {publishState.loading ? "Publishing" : "Publish report"}
            </button>
            {publishState.error && (
              <p className="border border-[#d08a9b] bg-[#fff1f4] p-3 text-sm leading-6 text-[var(--danger)]">
                {publishState.error}
              </p>
            )}
            {publishState.result && (
              <a
                className="focus-ring inline-flex min-w-0 items-center justify-between gap-3 rounded-[2px] border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--forest)]"
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

        <section id="preview" className="min-w-0">
          <div className="ll-grid-shell mb-4 grid gap-px border border-[var(--line)] lg:grid-cols-[1fr_260px]">
            <div className="ll-grid-shell grid grid-cols-2 gap-px sm:grid-cols-4">
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
            <div className="ll-grid-shell grid grid-cols-3 gap-px text-center">
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
            <div className="ll-surface p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
                <div>
                  <p className="font-mono-tech text-[10px] text-[var(--muted)]">04. Export</p>
                  <h2 className="font-display mt-1 text-2xl font-bold text-[var(--forest)]">Markdown Export</h2>
                </div>
                <button
                  className="ll-button-ghost focus-ring"
                  type="button"
                  onClick={copyMarkdown}
                >
                  <Clipboard size={15} />
                  Copy
                </button>
              </div>
              <textarea
                className="ll-input focus-ring min-h-[520px] resize-y font-mono"
                readOnly
                value={markdown}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function TechnicalHeader({ onPreviewMode }: { onPreviewMode: (mode: PreviewMode) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[#F7F7F5]">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[260px_1fr_auto] lg:px-8">
        <Link className="focus-ring flex min-w-0 items-center gap-3" href="/" aria-label="LoopLens home">
          <span className="ll-logo-mark">
            <Sparkles size={16} />
          </span>
          <span className="font-display text-xl font-bold leading-none text-[var(--forest)]">LoopLens</span>
        </Link>

        <nav className="hidden items-center justify-center gap-6 md:flex" aria-label="Workspace sections">
          <a className="font-mono-tech text-[10px] text-[var(--muted)] hover:text-[var(--forest)]" href="#workspace">
            01. Workspace
          </a>
          <a className="font-mono-tech text-[10px] text-[var(--muted)] hover:text-[var(--forest)]" href="#preview">
            02. Preview
          </a>
          <a className="font-mono-tech text-[10px] text-[var(--muted)] hover:text-[var(--forest)]" href="#publish">
            03. Publish
          </a>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            className="ll-button-ghost focus-ring hidden min-h-9 px-3 text-[10px] sm:inline-flex"
            href="/sample"
          >
            Sample
          </Link>
          <button
            className="ll-button-primary focus-ring min-h-9 px-3 text-[10px]"
            type="button"
            onClick={() => onPreviewMode("judge")}
          >
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
  children: React.ReactNode;
  marker?: boolean;
}) {
  return (
    <section
      id={title === "Publish" ? "publish" : undefined}
      className={`ll-surface p-4 ${marker ? "corner-markers" : ""}`}
    >
      {marker && <span className="corner-marker" aria-hidden="true" />}
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
        <h2 className="font-mono-tech text-[11px] text-[var(--forest)]">
          {eyebrow}. {title}
        </h2>
        <span className="h-px flex-1" style={{ background: "var(--line)" }} aria-hidden="true" />
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
  icon: React.ReactNode;
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ll-paper px-3 py-2">
      <p className="font-mono-tech text-[10px] text-[var(--muted)]">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold leading-none text-[var(--forest)]">{value}</p>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="ll-badge">
      <span className="ll-badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function WorkflowSteps() {
  const steps = [
    ["01", "Project links"],
    ["02", "Parse LOOP.md"],
    ["03", "Publish proof"]
  ];

  return (
    <div className="ll-grid-shell mt-5 grid gap-px border border-[var(--line)] sm:grid-cols-3">
      {steps.map(([index, label]) => (
        <div key={index} className="ll-paper p-3">
          <p className="font-mono-tech text-[10px] text-[var(--muted)]">{index}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--forest)]">{label}</p>
        </div>
      ))}
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
          <p className="font-mono-tech text-[10px] text-[var(--muted)]">01. Evidence Matrix</p>
          <h2 className="font-display mt-2 text-3xl font-bold leading-none text-[var(--forest)]">Evidence Completeness</h2>
          <p className="ll-muted-copy mt-3">
            {passed} of {total} required proof signals are present. Add project links, parse LOOP.md, then publish when the report is safe.
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <strong className="font-display text-5xl font-bold leading-none text-[var(--forest)]">{percentage}%</strong>
          <div className="ll-progress mt-3" aria-hidden="true">
            <div className="ll-progress-bar" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>
      <div className="grid border-t border-[var(--line)] sm:grid-cols-2">
        {report.evidenceScore?.items.map((item, index) => (
          <div
            key={item.id}
            className={`border-b border-r border-[var(--line)] bg-[#F7F7F5] p-4 ${accentClasses[index % accentClasses.length]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono-tech text-[10px] text-[var(--forest)]">{item.label}</p>
              <span
                className={`h-2 w-2 shrink-0 ${item.passed ? "bg-[#1A3C2B]" : "border border-[var(--line-strong)] bg-white"}`}
                aria-hidden="true"
              />
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
        <History className="mx-auto text-[var(--forest)]" size={28} />
        <h2 className="font-display mt-3 text-3xl font-bold text-[var(--forest)]">No timeline yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          Paste `LOOP.md` evidence in step 02 and click Parse evidence. Aim for at least two iterations and one fixed failure for a stronger proof story.
        </p>
      </section>
    );
  }

  return (
    <section className="ll-grid-shell grid gap-px border border-[var(--line)]">
      {report.iterations.map((iteration, index) => (
        <div key={iteration.id} className="ll-paper p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div className={`border-l-2 pl-3 ${accentClasses[index % accentClasses.length]}`}>
              <p className="font-mono-tech text-[10px] text-[var(--muted)]">Iteration {iteration.index}</p>
              <h3 className="font-display mt-1 text-2xl font-bold leading-none text-[var(--forest)]">{iteration.title}</h3>
            </div>
            <select
              className="focus-ring min-h-10 rounded-[2px] border border-[var(--line)] bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink)]"
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
            <div className="border border-[var(--line)] bg-white p-3 font-mono text-xs leading-6 text-[var(--muted)]">
              {iteration.sourceText}
            </div>
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

function SummaryCard({ title, content }: { title: string; content?: string }) {
  return (
    <section className="ll-surface p-5">
      <p className="font-mono-tech text-[10px] text-[var(--muted)]">Portfolio Surface</p>
      <h2 className="font-display mt-1 text-3xl font-bold leading-none text-[var(--forest)]">{title}</h2>
      <div className="mt-4 whitespace-pre-line border-l border-[var(--line)] pl-4 text-sm leading-7 text-[var(--muted)]">
        {content || "No summary generated yet."}
      </div>
    </section>
  );
}
