import "reflect-metadata";
import http from "http";
import { createApp } from "./app.js";
import { env } from "./lib/config/env";
import { db } from "./lib/knex/knex";
import { logger } from "./lib/logger/logger.js";

const app = createApp();

const server = http.createServer(app);

server.listen(env.port, () => {
    logger.info(`Server listening on ${env.port}`);
});

async function shutdown() {
    logger.info("Shutdown requested");
    server.close(async () => {
        try {
            await db.destroy();
        } catch { }
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);