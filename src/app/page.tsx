import { ReportWorkspace } from "@/features/workspace/report-workspace";
import { createEmptyReport } from "@/lib/report-factory";

export default function HomePage() {
  return <ReportWorkspace initialReport={createEmptyReport()} storageKey="looplens:draft:v1" />;
}
