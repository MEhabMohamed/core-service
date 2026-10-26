import type { Knex } from "knex";

/**
 * Migration to add a partial index on events_outbox (id) WHERE dispatched_at IS NULL.
 *
 * This partial index accelerates the outbox drain worker batch claim query:
 *   SELECT ... FROM events_outbox WHERE dispatched_at IS NULL ORDER BY id ASC LIMIT N FOR UPDATE SKIP LOCKED
 *
 * Since dispatched events are excluded, this index stays minimal in size and fast
 * even when millions of historical events have been processed.
 */
export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_events_outbox_pending 
        ON events_outbox (id) 
        WHERE dispatched_at IS NULL;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP INDEX IF EXISTS idx_events_outbox_pending;
    `);
}
