import type { ProjectReport, PublishResult } from "@/types/report";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createPublicSlug } from "@/lib/slug";
import { validatePublishReport } from "@/lib/validation";
import { hydrateReport } from "@/lib/report-factory";
import { ensureReportsTable, getPool, hasDatabaseUrl } from "./db";

const devStoreDir = join(tmpdir(), "looplens-dev-reports");

export async function publishReport(report: ProjectReport): Promise<PublishResult> {
  const now = new Date().toISOString();
  const preparedReport = hydrateReport({
    ...report,
    visibility: "public",
    publishMetadata: {
      ...report.publishMetadata,
      publishConfirmedAt: now
    },
    updatedAt: now,
    publishedAt: now
  });

  const validation = validatePublishReport(preparedReport);
  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }

  const slug = await createUniqueSlug(preparedReport.name);
  const publishedReport = hydrateReport({
    ...preparedReport,
    slug
  });

  if (shouldUseDevFileStore()) {
    await saveDevReport(slug, publishedReport);
  } else {
    await ensureReportsTable();
    await getPool().query(
      `insert into published_reports (slug, payload, published_at)
       values ($1, $2::jsonb, $3)
       on conflict (slug) do update
       set payload = excluded.payload,
           updated_at = now(),
           published_at = excluded.published_at`,
      [slug, JSON.stringify(publishedReport), now]
    );
  }

  return {
    slug,
    url: `${getAppUrl()}/report/${slug}`,
    report: publishedReport
  };
}

export async function getPublishedReport(slug: string): Promise<ProjectReport | null> {
  if (shouldUseDevFileStore()) {
    return getDevReport(slug);
  }

  if (!hasDatabaseUrl()) return null;

  await ensureReportsTable();
  const result = await getPool().query<{ payload: ProjectReport }>(
    "select payload from published_reports where slug = $1 limit 1",
    [slug]
  );

  return result.rows[0]?.payload ? hydrateReport(result.rows[0].payload) : null;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function shouldUseDevFileStore(): boolean {
  return !hasDatabaseUrl() && process.env.NODE_ENV !== "production";
}

async function createUniqueSlug(name: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = createPublicSlug(name);
    const existing = await getPublishedReport(slug);
    if (!existing) return slug;
  }

  throw new Error("Could not generate a unique public slug.");
}

async function saveDevReport(slug: string, report: ProjectReport): Promise<void> {
  await mkdir(devStoreDir, { recursive: true });
  await writeFile(join(devStoreDir, `${slug}.json`), JSON.stringify(report), "utf8");
}

async function getDevReport(slug: string): Promise<ProjectReport | null> {
  try {
    const raw = await readFile(join(devStoreDir, `${slug}.json`), "utf8");
    return hydrateReport(JSON.parse(raw) as ProjectReport);
  } catch {
    return null;
  }
}
