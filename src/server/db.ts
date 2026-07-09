import { Pool } from "pg";

let pool: Pool | undefined;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for production report publishing.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") ? undefined : { rejectUnauthorized: false }
    });
  }

  return pool;
}

export async function ensureReportsTable(): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query(`
      create table if not exists published_reports (
        slug text primary key,
        payload jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        published_at timestamptz not null default now()
      );
    `);
  } finally {
    client.release();
  }
}
