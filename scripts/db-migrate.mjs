import { readFileSync } from "fs";
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

const migrationPath = join(__dirname, "../db/migrations/001_ecommerce.sql");
const migration = readFileSync(migrationPath, "utf-8");

async function migrate() {
  const pool = new Pool({ connectionString: url });
  console.log("Running Neon migrations...");
  try {
    await pool.query(migration);
    console.log("Migration complete.");
  } finally {
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
