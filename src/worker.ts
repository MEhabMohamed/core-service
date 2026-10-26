import "reflect-metadata";
import { Cron } from "croner";
import { env } from "./lib/config/env";
import { logger } from "./lib/logger/logger";
import { db } from "./lib/knex/knex";
import { messageBroker } from "./lib/events/init";
import { drainOutbox } from "./lib/events/outbox-drain";

/**
 * Outbox worker — runs independently of the HTTP server.
 *
 * API instances write to `events_outbox` in the same trx as their domain
 * mutation. This worker process polls that table on a schedule and publishes
 * pending rows to RabbitMQ with publisher confirms. Scales horizontally: the
 * repository's `claimBatch` uses FOR UPDATE SKIP LOCKED so N workers can run
 * in parallel without duplicate publishes.
 */
async function startWorker() {
    logger.info("[worker] starting core-service outbox worker...");

    try {
        await messageBroker.connect();
        await messageBroker.declareExchange(env.rabbit.exchange);
        logger.info("[worker] broker connected, exchange declared", { exchange: env.rabbit.exchange });
    } catch (err: any) {
        logger.warn("[worker] broker not reachable at boot — will retry on every drain", {
            error: err?.message ?? String(err),
        });
    }

    const pattern = env.rabbit.drainCron;
    const job = new Cron(pattern, { protect: true }, async () => {
        try {
            await drainOutbox();
        } catch (err: any) {
            logger.error("[worker] outbox drain error", { error: err?.message ?? String(err) });
        }
    });

    logger.info(`[worker] outbox drain scheduled with cron: "${pattern}"`, {
        pattern,
        batchSize: env.rabbit.batchSize,
    });

    const shutdown = async () => {
        logger.info("[worker] shutdown requested, stopping worker...");
        job.stop();
        try {
            await messageBroker.close();
        } catch (err: any) {
            logger.warn("[worker] broker close error", { error: err?.message ?? String(err) });
        }
        try {
            await db.destroy();
        } catch {}
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

startWorker().catch((err: any) => {
    logger.error("[worker] fatal startup error", {
        error: err?.message ?? String(err),
        stack: err?.stack,
    });
    process.exit(1);
});
