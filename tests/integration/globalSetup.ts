import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env.test"), override: true });

export default async function globalSetup() {
    const { db } = require("../../src/lib/knex/knex");
    await db.migrate.latest();
}