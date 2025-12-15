// Prisma 7 configuration (ESM) pour Supabase PostgreSQL
import * as dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE || ".env" });

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  throw new Error(
    "SUPABASE_DB_URL manquant : ajoutez-le dans votre .env (URL PostgreSQL Supabase)."
  );
}

export default {
  datasources: {
    db: {
      url: dbUrl,
    },
  },
};

