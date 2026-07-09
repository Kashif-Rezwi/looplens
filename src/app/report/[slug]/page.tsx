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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <Link className="focus-ring rounded-[8px] px-3 py-2 text-sm font-semibold text-[var(--teal)]" href="/">
          Create another report
        </Link>
        <span className="rounded-[8px] bg-[var(--panel-strong)] px-3 py-2 text-sm font-medium text-[var(--teal-dark)]">
          Public report
        </span>
      </div>
      <ReportView report={report} />
    </main>
  );
}
