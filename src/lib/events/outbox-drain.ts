import { db } from "../knex/knex";
import { env } from "../config/env";
import { logger } from "../logger/logger";
import { messageBroker } from "./init";
import { claimBatch, markDispatchedBatch, markFailedBatch } from "./outbox.repo";

/**
 * One pass over the outbox: claim a batch with FOR UPDATE SKIP LOCKED, publish
 * all rows concurrently with publisher confirms (`Promise.allSettled`), and
 * update dispatched/failed status in bulk (`markDispatchedBatch` / `markFailedBatch`)
 * so no `for` loop ever executes N+1 sequential queries or I/O calls.
 *
 * Call site is the worker's scheduler (Croner). This function is idempotent
 * with respect to itself thanks to SKIP LOCKED, so running more than one worker
 * in parallel is safe.
 */
export async function drainOutbox(): Promise<void> {
    await messageBroker.connect().catch(() => { });

    const trx = await db.transaction();
    try {
        const rows = await claimBatch(trx, env.rabbit.batchSize);
        if (rows.length === 0) {
            await trx.commit();
            return;
        }

        const nowIso = new Date().toISOString();
        const results = await Promise.allSettled(
            rows.map(async (row) => {
                const envelope = {
                    eventId: row.event_id,
                    eventType: row.event_type,
                    occurredAt: nowIso,
                    aggregateType: row.aggregate_type,
                    aggregateId: row.aggregate_id,
                    payload: row.payload,
                };
                await messageBroker.publishConfirmed(
                    env.rabbit.exchange,
                    row.event_type,
                    Buffer.from(JSON.stringify(envelope), "utf8"),
                );
                return row.id;
            }),
        );

        const dispatchedIds: string[] = [];
        const failedIds: string[] = [];
        let firstErrorMsg = "";

        results.forEach((res, idx) => {
            if (res.status === "fulfilled") {
                dispatchedIds.push(res.value);
            } else {
                const rowId = rows[idx].id;
                const msg = describeError(res.reason);
                failedIds.push(rowId);
                if (!firstErrorMsg) firstErrorMsg = msg;
                logger.error("outbox publish failed", { id: rowId, error: msg });
            }
        });

        if (dispatchedIds.length > 0) {
            await markDispatchedBatch(trx, dispatchedIds);
        }
        if (failedIds.length > 0) {
            await markFailedBatch(trx, failedIds, firstErrorMsg);
        }

        await trx.commit();
    } catch (err) {
        await trx.rollback();
        throw err;
    }
}

function describeError(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    if (err && typeof err === "object" && "errors" in err) {
        const inner = (err as { errors: unknown[] }).errors;
        if (Array.isArray(inner) && inner.length > 0) {
            return inner.map(describeError).filter(Boolean).join("; ");
        }
    }
    try {
        return JSON.stringify(err);
    } catch {
        return String(err);
    }
}
