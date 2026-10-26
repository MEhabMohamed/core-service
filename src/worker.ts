import "reflect-metadata";
import { Cron } from "croner";
import { env } from "./lib/config/env";
import { logger } from "./lib/logger/logger";
import { drainOutbox } from "./lib/events/outbox.service";
import { corePublisher } from "./lib/events/publisher";
import { db } from "./lib/knex/knex";

async function startWorker() {
    logger.info("[worker] starting core-service outbox worker...");

    try {
        await corePublisher.connect();
        logger.info("[worker] RabbitMQ publisher ready");
    } catch (err: any) {
        logger.warn(`[worker] broker not reachable at boot — will retry on drain: ${err.message}`);
    }

    const job = new Cron(env.outbox.drainCron, { protect: true }, async () => {
        try {
            const count = await drainOutbox();
            if (count > 0) {
                logger.info(`[worker] drained ${count} outbox events`);
            }
        } catch (err: any) {
            logger.error(`[worker] drain error: ${err.message}`);
        }
    });

    logger.info(`[worker] scheduled outbox drain with cron: "${env.outbox.drainCron}"`);

    const shutdown = async () => {
        logger.info("[worker] stopping worker...");
        job.stop();
        await corePublisher.close();
        await db.destroy();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}


startWorker().catch((err) => {
    logger.error(`[worker] fatal startup error: ${err.message}`);
    process.exit(1);
});
