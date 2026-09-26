import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL;

if (!url) {
  console.error("Set DATABASE_URL in .env.local");
  process.exit(1);
}

// postgres.js forwards unknown URL params to the server; drop pooler hints.
const cleanUrl = new URL(url);
cleanUrl.searchParams.delete("pgbouncer");
cleanUrl.searchParams.delete("supa");

const migrationsDir = join(__dirname, "../db/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

async function migrate() {
  const sql = postgres(cleanUrl.toString(), { ssl: "require", max: 1, onnotice: () => {} });
  console.log("Running Postgres migrations...");
  try {
    for (const file of files) {
      const text = readFileSync(join(migrationsDir, file), "utf-8");
      console.log(`  → ${file}`);
      await sql.unsafe(text);
    }
    console.log("All migrations complete.");
  } finally {
    await sql.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
