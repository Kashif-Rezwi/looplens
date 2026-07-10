import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportView } from "@/features/reports/report-view";
import { getPublishedReport } from "@/server/reports";

interface ReportPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { slug } = await params;
  const report = await getPublishedReport(slug);

  if (!report) notFound();

  return (
    <main className="ll-page-shell mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="ll-surface flex flex-wrap items-center justify-between gap-3 p-3">
        <Link className="ll-button-ghost focus-ring min-h-9 px-3 text-[10px]" href="/">
          Create another report
        </Link>
        <span className="ll-badge">
          <span className="ll-badge-dot" aria-hidden="true" />
          Public report
        </span>
      </div>
      <ReportView report={report} />
    </main>
  );
}
