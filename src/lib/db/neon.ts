import { neon, neonConfig, Pool } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL
  );
}

export function isNeonConfigured() {
  return Boolean(getDatabaseUrl());
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

let pool: Pool | null = null;

export function getPool() {
  const url = getDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL is not configured");
  if (!pool) pool = new Pool({ connectionString: url });
  return pool;
}

export async function withTransaction<T>(
  fn: (query: <R>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<R[]>) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const query = async <R>(strings: TemplateStringsArray, ...values: unknown[]) => {
      const text = strings.reduce(
        (acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""),
        ""
      );
      const result = await client.query(text, values);
      return result.rows as R[];
    };
    const result = await fn(query);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
