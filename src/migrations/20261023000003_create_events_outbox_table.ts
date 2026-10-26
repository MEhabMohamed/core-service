import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("events_outbox", (table) => {
        table.bigIncrements("id").primary();
        table.text("aggregate_type").notNullable();
        table.text("aggregate_id").notNullable();
        table.text("event_type").notNullable();
        table.uuid("event_id").notNullable().unique();
        table.jsonb("payload").notNullable();
        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.timestamp("dispatched_at").nullable();
        table.integer("attempts").notNullable().defaultTo(0);
        table.text("last_error").nullable();

        table.index(["dispatched_at", "attempts"], "idx_events_outbox_undispatched");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("events_outbox");
}
