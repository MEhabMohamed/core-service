import { Knex } from "knex";
import {
    insertOutboxEvent as repoInsertOutboxEvent,
    insertOutboxEvents as repoInsertOutboxEvents
} from "./outbox.repo";
import { InsertOutboxInput } from "./types";
import { drainOutbox as drain } from "./outbox-drain";

export type OutboxEventInput = InsertOutboxInput & { eventId?: string };

export async function insertOutboxEvent(
    trx: Knex.Transaction | Knex,
    event: OutboxEventInput
): Promise<void> {
    await repoInsertOutboxEvent(trx, event);
}

export async function insertOutboxEvents(
    trx: Knex.Transaction | Knex,
    events: OutboxEventInput[]
): Promise<void> {
    await repoInsertOutboxEvents(trx, events);
}

export async function drainOutbox(): Promise<void> {
    await drain();
}

