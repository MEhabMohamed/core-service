import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import { db } from "../knex/knex";
import { env } from "../config/env";
import { logger } from "../logger/logger";
import { corePublisher } from "./publisher";

export interface OutboxEventInput {
    aggregateType: string;
    aggregateId: string | number;
    eventType: string;
    eventId?: string;
    payload: any;
}

export async function insertOutboxEvent(
    trx: Knex.Transaction | Knex,
    event: OutboxEventInput
): Promise<void> {
    await trx("events_outbox").insert({
        aggregate_type: event.aggregateType,
        aggregate_id: String(event.aggregateId),
        event_type: event.eventType,
        event_id: event.eventId || uuidv4(),
        payload: JSON.stringify(event.payload),
        created_at: new Date(),
        dispatched_at: null,
        attempts: 0,
        last_error: null,
    });
}

export async function insertOutboxEvents(
    trx: Knex.Transaction | Knex,
    events: OutboxEventInput[]
): Promise<void> {
    if (events.length === 0) return;
    await trx("events_outbox").insert(
        events.map((event) => ({
            aggregate_type: event.aggregateType,
            aggregate_id: String(event.aggregateId),
            event_type: event.eventType,
            event_id: event.eventId || uuidv4(),
            payload: JSON.stringify(event.payload),
            created_at: new Date(),
            dispatched_at: null,
            attempts: 0,
            last_error: null,
        }))
    );
}

export async function drainOutbox(): Promise<number> {
    let drainedCount = 0;

    await db.transaction(async (trx) => {
        const rows = await trx("events_outbox")
            .select("id", "aggregate_type", "aggregate_id", "event_type", "event_id", "payload", "created_at", "attempts")
            .whereNull("dispatched_at")
            .where("attempts", "<", 5)
            .orderBy("id", "asc")
            .limit(env.outbox.batchSize)
            .forUpdate()
            .skipLocked();

        if (!rows || rows.length === 0) {
            return;
        }

        const successfulIds: number[] = [];

        for (const row of rows) {
            try {
                const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
                const envelope = {
                    eventId: row.event_id,
                    eventType: row.event_type,
                    aggregateType: row.aggregate_type,
                    aggregateId: row.aggregate_id,
                    timestamp: row.created_at,
                    payload,
                };

                await corePublisher.publish(row.event_type, envelope);
                successfulIds.push(row.id);
                drainedCount++;
            } catch (err: any) {
                logger.error(`[outbox] failed to publish event ${row.event_id}: ${err.message}`);
                await trx("events_outbox")
                    .where({ id: row.id })
                    .update({
                        attempts: row.attempts + 1,
                        last_error: err.message,
                    });
            }
        }

        if (successfulIds.length > 0) {
            await trx("events_outbox")
                .whereIn("id", successfulIds)
                .update({
                    dispatched_at: new Date(),
                });
        }
    });

    return drainedCount;
}

