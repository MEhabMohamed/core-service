import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { MemberBranch } from "../entity/member-branch.entity.";

export async function setMemberBranch(memberId: number, rows: MemberBranch[], trx?: Knex.Transaction) {
    const query = trx || db;
    await query('member_branches').where({ member_id: memberId }).delete();

    if (rows.length > 0) {
        await query('member_branches').insert(rows.map(row => ({
            member_id: row.memberId,
            branch_id: row.branchId,
            created_at: row.createdAt
        })));
    }
}

export async function findBranchesByMemberId(memberId: number): Promise<number[]> {
    const rows = await db('member_branches')
        .select('branch_id')
        .where({ member_id: memberId });
    return rows?.map(row => row.branch_id);
}

export async function countBranchesByIdsAndRestaurantId(branchIds: number[], restaurantId: number): Promise<number> {
    const [{ count }] = await db('restaurant_branches')
        .count('id as count')
        .whereIn('id', branchIds)
        .andWhere({ 'restaurant_id': restaurantId });
    return Number(count);
}