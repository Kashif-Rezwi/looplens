import { Bug, ExternalLink, FileCheck2, History, Link as LinkIcon, Share2, ShieldCheck, Wrench } from "lucide-react";
import type { ProjectReport } from "@/types/report";
import { collectReportEvidence, countFixedFailures } from "@/lib/evidence";
import { getSummary } from "@/lib/summaries";

const proofAccentClasses = ["border-l-[#9EFFBF]", "border-l-[#FF8C69]", "border-l-[#F4D35E]", "border-l-[#1A3C2B]"];

export function ReportView({ report }: { report: ProjectReport }) {
  const evidence = collectReportEvidence(report);
  const fixedFailureCount = countFixedFailures(report.iterations);
  const judgeSummary = getSummary(report, "judge")?.content;
  const portfolioSummary = getSummary(report, "portfolio")?.content;
  const resumeSummary = getSummary(report, "resume")?.content;
  const socialSummary = getSummary(report, "social")?.content;

  return (
    <article className="flex flex-col gap-5">
      <header className="ll-surface">
        <div className="ll-grid-shell grid gap-px lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="ll-paper p-5 sm:p-7">
            <StatusBadge label={report.publishedAt ? "Public proof live" : "Draft proof surface"} />
            <p className="font-mono-tech mt-6 text-[10px] text-[var(--muted)]">LoopLens / Proof Report</p>
            <h1 className="font-display mt-3 max-w-3xl text-5xl font-bold leading-[0.95] tracking-normal text-[var(--forest)] sm:text-6xl">
              {report.name || "Untitled report"}
            </h1>
            <p className="mt-5 max-w-3xl border-l border-[var(--forest)] pl-4 text-base leading-7 text-[var(--muted)] sm:text-lg">
              {report.description || "No description provided."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {report.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--line)] bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="ll-grid-shell mt-6 grid gap-px border border-[var(--line)] sm:grid-cols-4">
              <Metric label="Evidence completeness" value={`${report.evidenceScore?.percentage ?? 0}%`} />
              <Metric label="Iterations" value={String(report.iterations.length)} />
              <Metric label="Fixed failures" value={String(fixedFailureCount)} />
              <Metric label="Published" value={report.publishedAt ? "Yes" : "No"} />
            </div>
          </div>

          <div className="ll-paper flex items-center p-5">
              <NetworkTopologyGraph />
          </div>
        </div>
      </header>

      <ProofChain report={report} fixedFailureCount={fixedFailureCount} />

      <section className="grid gap-4 lg:grid-cols-2">
        <SummaryBlock icon={<ShieldCheck size={18} />} index="01" title="Judge Mode" content={judgeSummary} accent="coral" />
        <SummaryBlock icon={<FileCheck2 size={18} />} index="02" title="Portfolio Mode" content={portfolioSummary} accent="mint" />
      </section>

      <section className="ll-surface">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] p-5">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[var(--forest)]" />
            <h2 className="font-display text-3xl font-bold leading-none text-[var(--forest)]">Timeline</h2>
          </div>
          <span className="font-mono-tech text-[10px] text-[var(--muted)]">{report.iterations.length} loops</span>
        </div>
        <div className="ll-grid-shell grid gap-px p-px">
          {report.iterations.map((iteration, index) => (
            <div key={iteration.id} className="ll-paper p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className={`border-l-2 pl-3 ${proofAccentClasses[index % proofAccentClasses.length]}`}>
                  <p className="font-mono-tech text-[10px] text-[var(--muted)]">Iteration {iteration.index}</p>
                  <h3 className="font-display mt-1 max-w-4xl text-2xl font-bold leading-tight text-[var(--forest)]">{iteration.title}</h3>
                </div>
                <StatusBadge label={iteration.status} />
              </div>
              <dl className="ll-grid-shell mt-5 grid gap-px text-sm sm:grid-cols-2">
                <Fact label="Built/changed" value={iteration.makerAction} />
                <Fact label="Verified" value={iteration.checkerAction} />
                <Fact label="Failure found" value={iteration.failureFound || "None recorded"} />
                <Fact label="Fix applied" value={iteration.fixApplied || "None recorded"} />
              </dl>
              <details className="mt-4 border border-[var(--line)] bg-white">
                <summary className="cursor-pointer px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--forest)]">
                  Raw source evidence
                </summary>
                <p className="border-t border-[var(--line)] p-3 font-mono text-xs leading-6 text-[var(--muted)]">{iteration.sourceText}</p>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <SummaryBlock icon={<FileCheck2 size={18} />} index="03" title="Resume Bullets" content={resumeSummary} accent="gold" />
        <SummaryBlock icon={<FileCheck2 size={18} />} index="04" title="Social Draft" content={socialSummary} accent="forest" />
      </section>

      <section className="ll-surface">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] p-5">
          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-[var(--forest)]" />
            <h2 className="font-display text-3xl font-bold leading-none text-[var(--forest)]">Evidence Links</h2>
          </div>
          <span className="font-mono-tech text-[10px] text-[var(--muted)]">{evidence.length} refs</span>
        </div>
        <div className="ll-grid-shell grid gap-px p-px">
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
                <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--forest)]">
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
    </article>
  );
}

type ProofChainTone = "complete" | "warning" | "muted";

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
    <section className="ll-grid-shell border border-[var(--line)] p-px" aria-label="Proof chain">
      <div className="grid gap-px sm:grid-cols-4">
        {items.map((item, index) => (
          <div key={item.label} className={`ll-paper border-l-2 p-4 ${proofAccentClasses[index % proofAccentClasses.length]}`}>
            <div className={`flex items-center gap-2 ${proofChainToneClass(item.tone)}`}>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-current bg-white text-current">
                {item.icon}
              </span>
              <span className="font-mono-tech text-[10px]">{item.label}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function proofChainToneClass(tone: ProofChainTone) {
  if (tone === "complete") return "text-[var(--forest)]";
  if (tone === "warning") return "text-[var(--warning)]";
  return "text-[var(--muted)]";
}

function formatCount(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ll-paper p-4">
      <span className="font-mono-tech text-[10px] text-[var(--muted)]">{label}</span>
      <strong className="font-display mt-2 block text-3xl font-bold leading-none text-[var(--forest)]">{value}</strong>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="ll-paper p-3">
      <dt className="font-mono-tech text-[10px] text-[var(--forest)]">{label}</dt>
      <dd className="mt-2 leading-6 text-[var(--muted)]">{value || "Not specified"}</dd>
    </div>
  );
}

function SummaryBlock({
  icon,
  index,
  title,
  content,
  accent
}: {
  icon: React.ReactNode;
  index: string;
  title: string;
  content?: string;
  accent: "coral" | "mint" | "gold" | "forest";
}) {
  return (
    <section className={`ll-surface border-l-2 p-5 ${summaryAccentClass(accent)}`}>
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3 text-[var(--forest)]">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display text-2xl font-bold leading-none text-[var(--forest)]">{title}</h2>
        </div>
        <span className="font-mono-tech text-[10px] text-[var(--muted)]">{index}</span>
      </div>
      <div className="whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{content || "No summary generated yet."}</div>
    </section>
  );
}

function summaryAccentClass(accent: "coral" | "mint" | "gold" | "forest") {
  if (accent === "coral") return "border-l-[#FF8C69]";
  if (accent === "mint") return "border-l-[#9EFFBF]";
  if (accent === "gold") return "border-l-[#F4D35E]";
  return "border-l-[#1A3C2B]";
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="ll-badge">
      <span className="ll-badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function NetworkTopologyGraph() {
  return (
    <div className="mx-auto aspect-square w-full max-w-[300px] border border-[var(--line)] bg-white p-4" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 450 450" role="img">
        <circle cx="225" cy="225" r="140" fill="none" stroke="var(--grid)" strokeDasharray="5 8" strokeOpacity="0.32" />
        <circle cx="225" cy="225" r="88" fill="none" stroke="var(--grid)" strokeDasharray="2 10" strokeOpacity="0.24" />
        <g className="topology-orbit">
          <line x1="225" y1="225" x2="225" y2="85" stroke="var(--grid)" strokeOpacity="0.2" />
          <line x1="225" y1="225" x2="346" y2="295" stroke="var(--grid)" strokeOpacity="0.2" />
          <line x1="225" y1="225" x2="104" y2="295" stroke="var(--grid)" strokeOpacity="0.2" />
          <rect x="217" y="77" width="16" height="16" fill="var(--coral)" />
          <rect x="338" y="287" width="16" height="16" fill="var(--mint)" />
          <rect x="96" y="287" width="16" height="16" fill="var(--gold)" />
        </g>
        <rect x="217" y="217" width="16" height="16" fill="var(--forest)" />
        <path d="M145 164h42v-28h76v28h42" fill="none" stroke="var(--grid)" strokeOpacity="0.28" />
        <path d="M145 286h42v28h76v-28h42" fill="none" stroke="var(--grid)" strokeOpacity="0.28" />
      </svg>
    </div>
  );
}
