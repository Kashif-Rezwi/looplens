import Link from "next/link";
import { ReportView } from "@/features/reports/report-view";
import { sampleReport } from "@/data/sample-report";

export default function SamplePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <Link className="focus-ring rounded-[8px] px-3 py-2 text-sm font-semibold text-[var(--teal)]" href="/">
          Back to workspace
        </Link>
        <span className="rounded-[8px] bg-[var(--panel-strong)] px-3 py-2 text-sm font-medium text-[var(--teal-dark)]">
          Sample report
        </span>
      </div>
      <ReportView report={sampleReport} />
    </main>
  );
}
