import { ExternalLink, FileCheck2, History, Link as LinkIcon, ShieldCheck } from "lucide-react";
import type { ProjectReport } from "@/types/report";
import { collectReportEvidence, countFixedFailures } from "@/lib/evidence";
import { getSummary } from "@/lib/summaries";

export function ReportView({ report }: { report: ProjectReport }) {
  const evidence = collectReportEvidence(report);
  const judgeSummary = getSummary(report, "judge")?.content;
  const portfolioSummary = getSummary(report, "portfolio")?.content;
  const resumeSummary = getSummary(report, "resume")?.content;
  const socialSummary = getSummary(report, "social")?.content;

  return (
    <article className="flex flex-col gap-6">
      <header className="grid gap-5 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm lg:grid-cols-[1.5fr_0.8fr]">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--teal)]">LoopLens</p>
          <h1 className="text-3xl font-bold text-[var(--ink)] sm:text-4xl">{report.name || "Untitled report"}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
            {report.description || "No description provided."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {report.tags.map((tag) => (
              <span key={tag} className="rounded-[8px] border border-[var(--line)] px-3 py-1 text-sm text-[var(--muted)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 rounded-[8px] bg-[var(--panel-strong)] p-4">
          <Metric label="Evidence completeness" value={`${report.evidenceScore?.percentage ?? 0}%`} />
          <Metric label="Iterations" value={String(report.iterations.length)} />
          <Metric label="Fixed failures" value={String(countFixedFailures(report.iterations))} />
          <Metric label="Published" value={report.publishedAt ? "Yes" : "No"} />
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <SummaryBlock icon={<ShieldCheck size={18} />} title="Judge Mode" content={judgeSummary} />
        <SummaryBlock icon={<FileCheck2 size={18} />} title="Portfolio Mode" content={portfolioSummary} />
      </section>

      <section className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <History size={18} className="text-[var(--teal)]" />
          <h2 className="text-xl font-semibold">Timeline</h2>
        </div>
        <div className="grid gap-4">
          {report.iterations.map((iteration) => (
            <div key={iteration.id} className="rounded-[8px] border border-[var(--line)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--teal)]">Iteration {iteration.index}</p>
                  <h3 className="mt-1 text-lg font-semibold">{iteration.title}</h3>
                </div>
                <span className="rounded-[8px] bg-[var(--panel-strong)] px-3 py-1 text-sm font-semibold capitalize text-[var(--teal-dark)]">
                  {iteration.status}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Fact label="Built/changed" value={iteration.makerAction} />
                <Fact label="Verified" value={iteration.checkerAction} />
                <Fact label="Failure found" value={iteration.failureFound || "None recorded"} />
                <Fact label="Fix applied" value={iteration.fixApplied || "None recorded"} />
              </dl>
              <p className="mt-4 rounded-[8px] bg-[#f5f3ee] p-3 text-sm leading-6 text-[var(--muted)]">
                {iteration.sourceText}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <SummaryBlock icon={<FileCheck2 size={18} />} title="Resume Bullets" content={resumeSummary} />
        <SummaryBlock icon={<FileCheck2 size={18} />} title="Social Draft" content={socialSummary} />
      </section>

      <section className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <LinkIcon size={18} className="text-[var(--teal)]" />
          <h2 className="text-xl font-semibold">Evidence Links</h2>
        </div>
        <div className="grid gap-2">
          {evidence.length ? (
            evidence.map((link) => (
              <a
                key={`${link.url}-${link.iterationId ?? "project"}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex min-w-0 items-center justify-between gap-3 rounded-[8px] border border-[var(--line)] px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">{link.label}</span>
                <span className="flex shrink-0 items-center gap-2 text-[var(--teal)]">
                  {link.type}
                  <ExternalLink size={14} />
                </span>
              </a>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">No evidence links yet.</p>
          )}
        </div>
      </section>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <strong className="text-lg">{value}</strong>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[var(--ink)]">{label}</dt>
      <dd className="mt-1 leading-6 text-[var(--muted)]">{value || "Not specified"}</dd>
    </div>
  );
}

function SummaryBlock({ icon, title, content }: { icon: React.ReactNode; title: string; content?: string }) {
  return (
    <section className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
      <div className="mb-3 flex items-center gap-2 text-[var(--teal)]">
        {icon}
        <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>
      </div>
      <div className="whitespace-pre-line text-sm leading-7 text-[var(--muted)]">
        {content || "No summary generated yet."}
      </div>
    </section>
  );
}
