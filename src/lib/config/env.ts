import { config } from "dotenv";
import path from "path";
import { z } from "zod";

config({
    path: path.resolve(__dirname, "../../../.env")
});

const schema = z.object({
    PORT: z.string().default("3000"),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z.string().default("5432"),
    DB_USER: z.string().default("postgres"),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_POOL_MAX: z.string().default("10"),
    DB_MIGRATION_DIR: z.string(),
    DB_MIGRATION_EXTENSION: z.string(),
    ACCESS_SECRET: z.string(),
    REFRESH_SECRET: z.string(),
    ACCESS_EXPIRES_IN: z.string(),
    REFRESH_EXPIRES_IN: z.string(),
    NODE_ENV: z.string(),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.string().default("6379"),
    REDIS_PASSWORD: z.string().default(""),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    EMAIL_HOST: z.string().default("smtp.gmail.com"),
    EMAIL_PORT: z.string().default("587"),
    INTERNAL_API_KEY: z.string().default("my-internal-api-key"),
    RABBITMQ_URL: z.string().default("amqp://guest:guest@localhost:5672"),
    RABBITMQ_CORE_EVENTS_EXCHANGE: z.string().default("core.events"),
    OUTBOX_DRAIN_CRON: z.string().default("* * * * * *"),
    OUTBOX_BATCH_SIZE: z.string().default("50")
});

const parsed = schema.parse(process.env);

export const env = {
    port: Number(parsed.PORT),
    nodeEnv: parsed.NODE_ENV,
    db: {
        host: parsed.DB_HOST,
        port: Number(parsed.DB_PORT),
        user: parsed.DB_USER,
        password: parsed.DB_PASSWORD,
        name: parsed.DB_NAME,
        poolMax: Number(parsed.DB_POOL_MAX),
        migrationDirectory: path.resolve(__dirname, "../../../", parsed.DB_MIGRATION_DIR),
        migrationExtension: parsed.DB_MIGRATION_EXTENSION
    },
    jwt: {
        accessSecret: parsed.ACCESS_SECRET,
        refreshSecret: parsed.REFRESH_SECRET,
        accessExpiresIn: parsed.ACCESS_EXPIRES_IN,
        refreshExpiresIn: parsed.REFRESH_EXPIRES_IN
    },
    cors: {
        origins: parsed.CORS_ORIGIN.split(",")
    },
    redis: {
        host: parsed.REDIS_HOST,
        port: Number(parsed.REDIS_PORT),
        password: parsed.REDIS_PASSWORD
    },
    email: {
        user: parsed.EMAIL_USER,
        pass: parsed.EMAIL_PASS,
        host: parsed.EMAIL_HOST,
        port: Number(parsed.EMAIL_PORT)
    },
    internal: {
        apiKey: parsed.INTERNAL_API_KEY
    },
    rabbitmq: {
        url: parsed.RABBITMQ_URL,
        exchange: parsed.RABBITMQ_CORE_EVENTS_EXCHANGE
    },
    outbox: {
        drainCron: parsed.OUTBOX_DRAIN_CRON,
        batchSize: Number(parsed.OUTBOX_BATCH_SIZE)
    }
};
