import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { MemberStatus } from "../enums";

const MEMBER_COLUMNS = [
    'id',
    'user_id',
    'restaurant_id',
    'role_id',
    'status',
    'created_at',
    'updated_at',
];

function toEntity(row: any): RestaurantMember {
    return new RestaurantMember({
        id: row.id,
        userId: row.user_id,
        restaurantId: row.restaurant_id,
        roleId: row.role_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createRestaurantMember(data: Partial<RestaurantMember>, conn: Knex = db): Promise<RestaurantMember> {
    const query = conn || db;
    const [row] = await query('restaurant_members')
        .insert({
            user_id: data.userId,
            restaurant_id: data.restaurantId,
            role_id: data.roleId,
            status: data.status,
            created_at: data.createdAt,
            updated_at: data.updatedAt
        })
        .returning(MEMBER_COLUMNS);
    return toEntity(row);
}

export async function activateMember(userId: number, conn: Knex = db) {
    const query = conn || db;
    await query('restaurant_members')
        .where({ user_id: userId })
        .update({
            status: MemberStatus.ACTIVE,
            updated_at: new Date()
        });
}

export async function findRestaurantMemberWithRole(userId: number): Promise<{ member: RestaurantMember, roleName: string } | null> {
    const row = await db('restaurant_members as rm')
        .select('rm.restaurant_id', 'rm.id', 'r.name as role_name')
        .leftJoin('roles as r', 'rm.role_id', 'r.id')
        .where({ 'rm.user_id': userId })
        .andWhere('rm.status', MemberStatus.ACTIVE)
        .first();
    if (!row) return null;
    return { member: toEntity(row), roleName: row.role_name };
}

export async function findMembersByRestaurantId(restaurantId: number) {
    const rows = await db('restaurant_members as rm')
        .select(
            'rm.id',
            'rm.user_id',
            'u.email',
            'u.phone',
            'u.system_role',
            'u.name as user_name',
            'r.display_name as display_name',
            'rm.status'
        )
        .join('users as u', 'rm.user_id', 'u.id')
        .join('roles as r', 'rm.role_id', 'r.id')
        .where('rm.restaurant_id', restaurantId);
    return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        userName: row.user_name,
        phone: row.phone,
        systemRole: row.system_role,
        displayName: row.display_name,
        status: row.status
    }))
}

export async function findMemberWithRoleName(memberId: number) {
    const row = await db('restaurant_members as rm')
        .select(...MEMBER_COLUMNS.map(c => `rm.${c}`), 'r.name as role_name')
        .leftJoin('roles as r', 'rm.role_id', 'r.id')
        .where({ 'rm.id': memberId })
        .first();

    if (!row) {
        return null;
    }

    const member = toEntity(row);
    return { member, roleName: row.role_name };
}

export async function findMemberById(memberId: number, conn: Knex = db): Promise<RestaurantMember | null> {
    const query = conn || db;
    const row = await query('restaurant_members')
        .select(MEMBER_COLUMNS)
        .where({ id: memberId })
        .first();

    return row ? toEntity(row) : null;
}

export async function updateMember(memberId: number, roleId?: number, status?: MemberStatus) {
    await db('restaurant_members')
        .where({ id: memberId })
        .update({
            ...(roleId !== undefined && { role_id: roleId }),
            ...(status !== undefined && { status: status }),
            updated_at: new Date()
        });
}

export async function deleteMember(memberId: number) {
    await db('restaurant_members')
        .where({ id: memberId })
        .delete();

    await db('member_branches')
        .where({ member_id: memberId })
        .delete();
}