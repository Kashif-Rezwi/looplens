import Link from "next/link";
import { ReportView } from "@/features/reports/report-view";
import { sampleReport } from "@/data/sample-report";

export default function SamplePage() {
  return (
    <main className="ll-page-shell mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="ll-surface flex flex-wrap items-center justify-between gap-3 p-3">
        <Link className="ll-button-ghost focus-ring min-h-9 px-3 text-[10px]" href="/">
          Back to workspace
        </Link>
        <span className="ll-badge">
          <span className="ll-badge-dot" aria-hidden="true" />
          Sample report
        </span>
      </div>
      <ReportView report={sampleReport} />
    </main>
  );
}
