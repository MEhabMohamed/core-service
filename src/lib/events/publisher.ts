import amqp, { AmqpConnectionManager, ChannelWrapper } from "amqp-connection-manager";
import type { ConfirmChannel } from "amqplib";
import { env } from "../config/env";
import { logger } from "../logger/logger";

class CoreEventPublisher {
    private connection: AmqpConnectionManager | null = null;
    private channel: ChannelWrapper | null = null;

    async connect(): Promise<void> {
        if (this.connection) return;

        this.connection = amqp.connect([env.rabbitmq.url]);
        this.channel = this.connection.createChannel({
            json: false,
            setup: async (ch: ConfirmChannel) => {
                await ch.assertExchange(env.rabbitmq.exchange, "topic", { durable: true });
            },
        });

        await this.channel.waitForConnect();
        logger.info("[events] connected to RabbitMQ publisher");
    }

    async publish(routingKey: string, payload: any): Promise<void> {
        await this.connect();
        const body = Buffer.from(JSON.stringify(payload));
        await this.channel!.publish(env.rabbitmq.exchange, routingKey, body, {
            persistent: true,
            contentType: "application/json",
        });
    }

    async close(): Promise<void> {
        await this.channel?.close().catch(() => {});
        await this.connection?.close().catch(() => {});
        this.channel = null;
        this.connection = null;
    }
}

export const corePublisher = new CoreEventPublisher();
