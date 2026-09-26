import postgres from "postgres";

/** postgres.js forwards unknown URL params to the server as startup settings,
 *  so drop the pooler hints that Supabase/Vercel add (pgbouncer, supa). */
function cleanUrl(raw: string) {
  const url = new URL(raw);
  url.searchParams.delete("pgbouncer");
  url.searchParams.delete("supa");
  return url.toString();
}

function getDatabaseUrl() {
  const raw =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;
  return raw ? cleanUrl(raw) : undefined;
}

export function isDbConfigured() {
  return Boolean(getDatabaseUrl());
}

export type Sql = postgres.Sql;

// Reuse one client across dev hot-reloads so connections don't leak.
const globalForDb = globalThis as unknown as { __studioSql?: Sql };

export function getSql(): Sql {
  if (globalForDb.__studioSql) return globalForDb.__studioSql;
  const url = getDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL is not configured");
  // prepare: false is required by Supabase's transaction pooler (port 6543).
  const sql = postgres(url, { prepare: false, ssl: "require", max: 5 });
  globalForDb.__studioSql = sql;
  return sql;
}
