import postgres from "postgres";

/**
 * Supabase's free plan pauses a project after about a week without activity.
 * Running one tiny query a day keeps the store's database awake.
 * Runs only on the published production deploy.
 */
export default async function dbKeepAlive() {
  const raw = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!raw) {
    console.error("db-keep-alive: DATABASE_URL is not set");
    return;
  }

  // postgres.js forwards unknown URL params to the server; drop pooler hints.
  const url = new URL(raw);
  url.searchParams.delete("pgbouncer");
  url.searchParams.delete("supa");

  const sql = postgres(url.toString(), { prepare: false, ssl: "require", max: 1 });
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM products`;
    console.log(`db-keep-alive: ok (${count} products)`);
  } catch (error) {
    console.error("db-keep-alive: query failed", error);
  } finally {
    await sql.end();
  }
}

export const config = {
  schedule: "@daily",
};
