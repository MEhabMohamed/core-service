import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { PasswordReset } from "../entity/password-reset.entity";

const PASSWORD_RESET_COLUMNS = ["id", "user_id", "otp_hash", "expires_at", "consumed_at", "created_at"];

function toEntity(row: any): PasswordReset {
    return new PasswordReset({
        id: row.id,
        userId: row.user_id,
        otpHash: row.otp_hash,
        consumedAt: row.consumed_at,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
    });
}

export async function createPasswordReset(PasswordReset: Partial<PasswordReset>, trx?: Knex) {
    const query = trx || db;
    await query("password_resets").insert({
        user_id: PasswordReset.userId,
        otp_hash: PasswordReset.otpHash,
        expires_at: PasswordReset.expiresAt,
        consumed_at: PasswordReset.consumedAt,
        created_at: PasswordReset.createdAt,
    });
}

export async function findLatestPasswordResetByUserId(userId: number): Promise<PasswordReset | undefined> {
    const row = await db("password_resets")
        .select(PASSWORD_RESET_COLUMNS)
        .where({ user_id: userId })
        .whereNull("consumed_at")
        .orderBy("id", "desc")
        .first();

    return toEntity(row);
}

export async function updatePasswordResetConsumedAt(id: number) {
    await db("password_resets")
        .where({ id })
        .update({
            consumed_at: new Date()
        })
}