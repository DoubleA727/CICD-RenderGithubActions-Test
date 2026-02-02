const prisma = require('../src/models/prismaClient');

async function runTruncation() {
  try {
    console.log("Removing all data from every table...");

    // 1. TRUNCATE ALL TABLES
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
          LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
          END LOOP;
      END $$;
    `);

    console.log("All tables truncated.");

    // 2. RESET ALL SEQUENCES
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
          seq RECORD;
      BEGIN
          FOR seq IN (
              SELECT sequence_name
              FROM information_schema.sequences
              WHERE sequence_schema = 'public'
          )
          LOOP
              EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq.sequence_name) || ' RESTART WITH 1;';
          END LOOP;
      END $$;
    `);

    console.log("All sequences reset to 1.");

    console.log("\nDatabase reset complete.");
  } catch (err) {
    console.error("\nError running SQL script:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTruncation();
