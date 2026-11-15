import { db } from "../../src/lib/knex/knex";

export async function truncateAll(): Promise<void> {
    const result = await db.raw<{ rows: { tablename: string }[] }>(`
        SELECT tablename from pg_tables
        where schemaname='public'
        AND tablename not in ('knex_migrations', 'knex_migrations_lock');`);

    const tableNames = result.rows.map((r) => `"${r.tablename}"`).join(', ');
    await db.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
}