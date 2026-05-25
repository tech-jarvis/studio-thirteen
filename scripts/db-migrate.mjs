import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Pool } from "@neondatabase/serverless";

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

const migrationsDir = join(__dirname, "../db/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

async function migrate() {
  const pool = new Pool({ connectionString: url });
  console.log("Running Neon migrations...");
  try {
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      console.log(`  → ${file}`);
      await pool.query(sql);
    }
    console.log("All migrations complete.");
  } finally {
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
