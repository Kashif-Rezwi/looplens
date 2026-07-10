import { Bug, ExternalLink, FileCheck2, History, Link as LinkIcon, Share2, ShieldCheck, Wrench } from "lucide-react";
import { collectReportEvidence, countFixedFailures } from "@/lib/evidence";
import { getSummary } from "@/lib/summaries";
import type { EvidenceLink, IterationStatus, ProjectReport } from "@/types/report";

type StatusTone = IterationStatus | "draft" | "public" | "complete" | "warning" | "danger" | "muted";
type ProofChainTone = "complete" | "warning" | "muted";

export function ReportView({ report }: { report: ProjectReport }) {
  const evidence = collectReportEvidence(report);
  const fixedFailureCount = countFixedFailures(report.iterations);
  const judgeSummary = getSummary(report, "judge")?.content;
  const portfolioSummary = getSummary(report, "portfolio")?.content;
  const resumeSummary = getSummary(report, "resume")?.content;
  const socialSummary = getSummary(report, "social")?.content;

  return (
    <article className="flex flex-col gap-5">
      <header className="ll-surface overflow-hidden">
        <div className="grid gap-px bg-[var(--line)] lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="ll-paper p-5 sm:p-7">
            <StatusBadge label={report.publishedAt ? "Public proof live" : "Draft proof surface"} tone={report.publishedAt ? "public" : "draft"} />
            <p className="font-mono-tech mt-6 text-xs font-bold text-[var(--muted)]">LoopLens / Proof Report</p>
            <h1 className="font-display mt-3 max-w-3xl text-5xl font-extrabold leading-[0.98] text-[var(--forest)] sm:text-6xl">
              {report.name || "Untitled report"}
            </h1>
            <p className="mt-5 max-w-3xl border-l-2 border-[var(--forest)] pl-4 text-base leading-7 text-[var(--muted)] sm:text-lg">
              {report.description || "No description provided."}
            </p>
            {report.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {report.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--line)] bg-white px-3 py-1 font-mono text-xs font-bold text-[var(--muted)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <ProofSnapshot report={report} evidence={evidence} fixedFailureCount={fixedFailureCount} />
        </div>
      </header>

      <ProofChain report={report} fixedFailureCount={fixedFailureCount} />

      <section className="grid gap-4 lg:grid-cols-2">
        <SummaryBlock icon={<ShieldCheck size={18} />} index="01" title="Judge Mode" content={judgeSummary} />
        <SummaryBlock icon={<FileCheck2 size={18} />} index="02" title="Portfolio Mode" content={portfolioSummary} />
      </section>

      <section className="ll-surface">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] p-5">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[var(--forest)]" />
            <h2 className="font-display text-3xl font-extrabold leading-none text-[var(--forest)]">Timeline</h2>
          </div>
          <span className="font-mono-tech text-xs font-bold text-[var(--muted)]">{report.iterations.length} loops</span>
        </div>
        <div className="grid gap-px bg-[var(--line)] p-px">
          {report.iterations.map((iteration) => (
            <div key={iteration.id} className="ll-paper p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className={`border-l-2 pl-3 ${statusBorderClass(iteration.status)}`}>
                  <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">Iteration {iteration.index}</p>
                  <h3 className="font-display mt-1 max-w-4xl text-2xl font-extrabold leading-tight text-[var(--forest)]">{iteration.title}</h3>
                </div>
                <StatusBadge label={formatStatusLabel(iteration.status)} tone={iteration.status} />
              </div>
              <dl className="mt-5 grid gap-px overflow-hidden rounded-[6px] bg-[var(--line)] text-sm sm:grid-cols-2">
                <Fact label="Built/changed" value={iteration.makerAction} />
                <Fact label="Verified" value={iteration.checkerAction} />
                <Fact label="Failure found" value={iteration.failureFound || "None recorded"} />
                <Fact label="Fix applied" value={iteration.fixApplied || "None recorded"} />
              </dl>
              <details className="mt-4 rounded-[6px] border border-[var(--line)] bg-white">
                <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-bold text-[var(--forest)]">Raw source evidence</summary>
                <p className="border-t border-[var(--line)] p-3 font-mono text-xs leading-6 text-[var(--muted)]">{iteration.sourceText}</p>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <SummaryBlock icon={<FileCheck2 size={18} />} index="03" title="Resume Bullets" content={resumeSummary} />
        <SummaryBlock icon={<Share2 size={18} />} index="04" title="Social Draft" content={socialSummary} />
      </section>

      <EvidenceLinks evidence={evidence} />
    </article>
  );
}

function ProofSnapshot({
  report,
  evidence,
  fixedFailureCount
}: {
  report: ProjectReport;
  evidence: EvidenceLink[];
  fixedFailureCount: number;
}) {
  const snapshotItems = [
    ["Evidence completeness", `${report.evidenceScore?.percentage ?? 0}%`],
    ["Iterations", String(report.iterations.length)],
    ["Fixed failures", String(fixedFailureCount)],
    ["Published", report.publishedAt ? "Yes" : "No"]
  ];

  return (
    <aside className="ll-paper flex flex-col justify-between gap-5 p-5">
      <div>
        <p className="font-mono-tech text-xs font-bold text-[var(--muted)]">Proof snapshot</p>
        <div className="mt-3 grid gap-px overflow-hidden rounded-[6px] bg-[var(--line)]">
          {snapshotItems.map(([label, value]) => (
            <div key={label} className="ll-paper flex items-center justify-between gap-3 px-3 py-3">
              <span className="text-sm font-bold text-[var(--muted-strong)]">{label}</span>
              <strong className="font-display text-2xl font-extrabold leading-none text-[var(--forest)]">{value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono-tech mb-2 text-xs font-bold text-[var(--muted)]">Primary evidence</p>
        <div className="grid gap-2">
          {evidence.slice(0, 4).map((link) => (
            <a
              key={`${link.url}-${link.iterationId ?? "project"}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="focus-ring flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-[6px] border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--forest)]"
            >
              <span className="truncate">{link.label}</span>
              <ExternalLink size={14} />
            </a>
          ))}
          {evidence.length === 0 && <p className="text-sm leading-6 text-[var(--muted)]">No evidence links yet.</p>}
        </div>
      </div>
    </aside>
  );
}

function ProofChain({ report, fixedFailureCount }: { report: ProjectReport; fixedFailureCount: number }) {
  const failureSignalCount = report.iterations.filter(
    (iteration) => iteration.failureFound.trim() || iteration.fixApplied.trim() || iteration.status === "failed" || iteration.status === "fixed"
  ).length;

  const items: Array<{ label: string; value: string; icon: React.ReactNode; tone: ProofChainTone }> = [
    {
      label: "Build",
      value: formatCount(report.iterations.length, "loop"),
      icon: <History size={17} />,
      tone: report.iterations.length > 0 ? "complete" : "muted"
    },
    {
      label: "Catch",
      value: failureSignalCount > 0 ? formatCount(failureSignalCount, "finding") : "No findings yet",
      icon: <Bug size={17} />,
      tone: failureSignalCount > 0 ? "warning" : "muted"
    },
    {
      label: "Fix",
      value: fixedFailureCount > 0 ? `${fixedFailureCount} fixed` : "No fixes yet",
      icon: <Wrench size={17} />,
      tone: fixedFailureCount > 0 ? "complete" : "muted"
    },
    {
      label: "Publish",
      value: report.publishedAt ? "Public proof live" : "Draft only",
      icon: <Share2 size={17} />,
      tone: report.publishedAt ? "complete" : "muted"
    }
  ];

  return (
    <section className="overflow-hidden rounded-[6px] border border-[var(--line)] bg-[var(--line)]" aria-label="Proof chain">
      <div className="grid gap-px sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className={`ll-paper border-l-2 p-4 ${proofChainBorderClass(item.tone)}`}>
            <div className={`flex items-center gap-2 ${proofChainToneClass(item.tone)}`}>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-current bg-white text-current">
                {item.icon}
              </span>
              <span className="font-mono-tech text-xs font-bold">{item.label}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidenceLinks({ evidence }: { evidence: EvidenceLink[] }) {
  return (
    <section className="ll-surface">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] p-5">
        <div className="flex items-center gap-2">
          <LinkIcon size={18} className="text-[var(--forest)]" />
          <h2 className="font-display text-3xl font-extrabold leading-none text-[var(--forest)]">Evidence Links</h2>
        </div>
        <span className="font-mono-tech text-xs font-bold text-[var(--muted)]">{evidence.length} refs</span>
      </div>
      <div className="grid gap-px bg-[var(--line)] p-px">
        {evidence.length ? (
          evidence.map((link) => (
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

function proofChainToneClass(tone: ProofChainTone) {
  if (tone === "complete") return "text-[var(--forest)]";
  if (tone === "warning") return "text-[var(--warning)]";
  return "text-[var(--muted)]";
}

function proofChainBorderClass(tone: ProofChainTone) {
  if (tone === "complete") return "border-l-[var(--mint)]";
  if (tone === "warning") return "border-l-[var(--gold)]";
  return "border-l-[var(--line-strong)]";
}

function statusBorderClass(status: IterationStatus) {
  if (status === "fixed" || status === "verified") return "border-[var(--mint)]";
  if (status === "failed") return "border-[var(--danger)]";
  if (status === "blocked") return "border-[var(--gold)]";
  return "border-[var(--line-strong)]";
}

function formatCount(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="ll-paper p-3">
      <dt className="font-mono-tech text-xs font-bold text-[var(--forest)]">{label}</dt>
      <dd className="mt-2 leading-6 text-[var(--muted)]">{value || "Not specified"}</dd>
    </div>
  );
}

function SummaryBlock({
  icon,
  index,
  title,
  content
}: {
  icon: React.ReactNode;
  index: string;
  title: string;
  content?: string;
}) {
  return (
    <section className="ll-surface border-l-2 border-[var(--line-strong)] p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3 text-[var(--forest)]">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display text-2xl font-extrabold leading-none text-[var(--forest)]">{title}</h2>
        </div>
        <span className="font-mono-tech text-xs font-bold text-[var(--muted)]">{index}</span>
      </div>
      <div className="whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{content || "No summary generated yet."}</div>
    </section>
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

function formatStatusLabel(status: IterationStatus) {
  if (status === "fixed") return "Fixed";
  if (status === "verified") return "Verified";
  if (status === "failed") return "Failed";
  if (status === "blocked") return "Blocked";
  return "Needs review";
}
