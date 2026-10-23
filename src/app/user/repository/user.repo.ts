import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { User } from "../entity/user.entity";
import { UserUpdateDTO } from "../dto/user.dto";

const USER_COLUMNS = ["id", "email", "password_hash", "system_role", "name", "phone", "created_at", "updated_at", "deleted_at"];

function toEntity(row: any): User {
    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        systemRole: row.system_role,
        name: row.name,
        phone: row.phone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at
    };
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const row = await db("users")
        .select(USER_COLUMNS)
        .where("email", email)
        .whereNull("deleted_at")
        .first();
    return row ? toEntity(row) : undefined;
}

export async function findUserById(id: number): Promise<User | undefined> {
    const row = await db("users")
        .select(USER_COLUMNS)
        .where({ id })
        .whereNull("deleted_at")
        .first();
    return row ? toEntity(row) : undefined;
}

export async function findUserExistsByEmailOrPhone(email: string, phone: string): Promise<Boolean> {
    const result = await db.raw(`
        SELECT EXISTS (
            SELECT 1
            FROM users
            WHERE email = ? OR phone = ?
            AND deleted_at IS NULL
        ) AS exists
    `, [email, phone]);
    return result.rows[0].exists;
}

export async function findUserExistsByEmail(email: string): Promise<Boolean> {
    const result = await db.raw(`
        SELECT EXISTS (
            SELECT 1
            FROM users
            WHERE email = ?
            AND deleted_at IS NULL
        ) AS exists
    `, [email]);
    return result.rows[0].exists;
}

export async function createUser(user: Partial<User>, conn?: Knex): Promise<User> {
    const query = conn || db;
    const [row] = await query("users")
        .insert({
            email: user.email,
            password_hash: user.passwordHash,
            system_role: user.systemRole,
            name: user.name,
            phone: user.phone,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        })
        .returning(USER_COLUMNS);
    return toEntity(row);
}

export async function updateUserPassword(id: number, passwordHash: string) {
    const [row] = await db("users")
        .where({ id })
        .update({
            password_hash: passwordHash,
            updated_at: new Date()
        })
        .returning(USER_COLUMNS);
    return toEntity(row);
}

export async function updateUserProfile(id: number, data: UserUpdateDTO) {
    const [row] = await db("users")
        .where({ id })
        .update({
            name: data.name,
            phone: data.phone,
            updated_at: new Date()
        })
        .returning(USER_COLUMNS);
    return toEntity(row);
}