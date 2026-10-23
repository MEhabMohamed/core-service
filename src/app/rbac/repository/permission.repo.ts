import { Permission } from "../entity/permission.entity";
import { db } from "../../../lib/knex/knex";
import { Knex } from "knex";

function toEntity(row: any): Permission {
    return new Permission({
        id: row.id,
        action: row.action,
        resource: row.resource,
        createdAt: row.created_at,
    });
}

export async function getPermissionByRoleName(roleName: string, trx?: Knex.Transaction): Promise<string[]> {
    const query = trx || db;
    const rows = await query('permissions as p')
        .select('p.id', 'p.resource', 'p.action', 'p.created_at')
        .join('role_permissions as rp', 'p.id', 'rp.permission_id')
        .join('roles as r', 'rp.role_id', 'r.id')
        .where({ 'r.name': roleName });
    return rows.map((row: any) => {
        const entity = toEntity(row);
        return `${entity.resource}:${entity.action}`;
    });
}

export async function getPermissionsDetailsByRoleName(roleName: string): Promise<{ permission: string }[]> {
    const rows = await db("permissions as p")
        .select("p.resource", "p.action")
        .join("role_permissions as rp", "p.id", "rp.permission_id")
        .join("roles as r", "rp.role_id", "r.id")
        .where("r.name", roleName);
    return rows.map(row => ({
        permission: `${row.resource}:${row.action}`,
    }));
}
