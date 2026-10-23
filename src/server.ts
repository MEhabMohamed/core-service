import "reflect-metadata";
import http from "http";
import { createApp } from "./app.js";
import { env } from "./lib/config/env";
import { db } from "./lib/knex/knex";

const app = createApp();

const server = http.createServer(app);

server.listen(env.port, () => {
    console.log(`server is listening on port ${env.port}`);
});

async function shutdown() {
    server.close(async () => {
        console.log("DB Shutdown");
        await db.destroy();
        process.exit(0);
    })
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);