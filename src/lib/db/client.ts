import postgres from "postgres";

/** postgres.js forwards unknown URL params to the server as startup settings,
 *  so drop the pooler hints Supabase adds to its URLs (pgbouncer, supa). */
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

// Reuse clients across dev hot-reloads so connections don't leak.
const globalForDb = globalThis as unknown as { __studioSql?: Sql; __studioTxSql?: Sql };

const BASE_OPTIONS = {
  // Required by Supabase's transaction pooler (port 6543).
  prepare: false,
  ssl: "require" as const,
  // Close idle sockets before the pooler or a frozen function does, and
  // fail fast instead of hanging when the database is unreachable.
  idle_timeout: 20,
  connect_timeout: 10,
};

function requireUrl() {
  const url = getDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL is not configured");
  return url;
}

/** Client for ordinary queries. Do not call `.begin()` on it — use getTxSql(). */
export function getSql(): Sql {
  if (globalForDb.__studioSql) return globalForDb.__studioSql;
  const sql = postgres(requireUrl(), {
    ...BASE_OPTIONS,
    // Serverless functions handle one request at a time; a few connections
    // cover pages that run queries in parallel.
    max: 5,
    // Never send several queries down one connection at once: Supabase's
    // transaction pooler stalls on pipelined queries until they time out.
    // 0 means one query in flight per connection (postgres.js allows
    // max_pipeline + 1); extra queries wait for a free connection instead.
    // Side effect: postgres.js can't reserve a connection for sql.begin()
    // with this setting (it throws UNSAFE_TRANSACTION), hence getTxSql().
    // @ts-expect-error supported at runtime, missing from postgres.js types
    max_pipeline: 0,
  });
  globalForDb.__studioSql = sql;
  return sql;
}

/**
 * Client for transactions (`getTxSql().begin(...)`). Keeps postgres.js's
 * default pipelining, which sql.begin() needs to reserve its connection.
 * Queries inside a transaction are awaited one at a time, so the pooler
 * stall above doesn't apply.
 */
export function getTxSql(): Sql {
  if (globalForDb.__studioTxSql) return globalForDb.__studioTxSql;
  const sql = postgres(requireUrl(), { ...BASE_OPTIONS, max: 2 });
  globalForDb.__studioTxSql = sql;
  return sql;
}
