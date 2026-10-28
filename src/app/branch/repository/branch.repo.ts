import { Knex } from "knex";
import { Branch } from "../entity/branch.entity";
import { db } from "../../../lib/knex/knex";
import { UpdateBranchStatusDTO } from "../dto/branch.dto";

const BRANCH_COLUMNS = [
    'id',
    'restaurant_id',
    'country_code',
    'address_text',
    'label',
    'lat',
    'lng',
    'is_active',
    'opens_at',
    'closes_at',
    'accept_orders',
    'created_at',
    'updated_at',
    'delivery_radius',
    'currency',
    'commission',
    'delivery_fee'
];

function toEntity(row: any): Branch {
    return new Branch({
        id: row.id,
        restaurantId: row.restaurant_id,
        countryCode: row.country_code,
        addressText: row.address_text,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        isActive: row.is_active,
        opensAt: row.opens_at,
        closesAt: row.closes_at,
        acceptOrders: row.accept_orders,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deliveryRadius: row.delivery_radius,
        currency: row.currency,
        commission: row.commission,
        deliveryFee: row.delivery_fee != null ? Number(row.delivery_fee) : 10
    });
}

export async function createBranch(data: Partial<Branch>, conn: Knex = db) {
    const [row] = await conn('restaurant_branches')
        .insert({
            restaurant_id: data.restaurantId,
            country_code: data.countryCode,
            address_text: data.addressText,
            label: data.label,
            lat: data.lat,
            lng: data.lng,
            is_active: data.isActive,
            opens_at: data.opensAt,
            closes_at: data.closesAt,
            accept_orders: data.acceptOrders,
            created_at: data.createdAt,
            updated_at: data.updatedAt,
            delivery_radius: data.deliveryRadius,
            currency: data.currency,
            commission: data.commission,
            delivery_fee: data.deliveryFee
        })
        .returning(BRANCH_COLUMNS);

    return toEntity(row);
}

export async function findNearByBranches(lat: number, lng: number) {
    const result = await db.raw(`
        SELECT
        b.id,
        b.restaurant_id,
        b.address_text,
        b.label,
        b.lat,
        b.lng,
        b.is_active,
        b.accept_orders,
        b.currency,
        r.name as restaurant_name,
        r.logo_url

        FROM restaurant_branches b
        JOIN restaurants r ON b.restaurant_id = r.id

        WHERE 
        b.is_active = true
        AND r.status = 'active'
        AND ST_DWithin(
            b.location,
            ST_MakePoint(?, ?)::geography,
            b.delivery_radius *1000
        )`,
        [lng, lat])

    return result.rows.map((row: any) => ({
        id: row.id,
        restaurantId: row.restaurant_id,
        addressText: row.address_text,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        isActive: row.is_active,
        acceptOrders: row.accept_orders,
        currency: row.currency,
        restaurantName: row.restaurant_name,
        logoURL: row.logo_url
    }));
}

export async function findByRestaurantId(restaurantId: number, conn: Knex = db): Promise<Branch[]> {
    const rows = await conn('restaurant_branches')
        .where({ restaurant_id: restaurantId })
        .select(BRANCH_COLUMNS);

    return rows.map(toEntity);
}

export async function updateBranch(branchId: number, data: Partial<Branch>, conn: Knex = db) {
    const [row] = await conn('restaurant_branches')
        .where({ id: branchId })
        .update({
            country_code: data.countryCode,
            address_text: data.addressText,
            label: data.label,
            lat: data.lat,
            lng: data.lng,
            is_active: data.isActive,
            opens_at: data.opensAt,
            closes_at: data.closesAt,
            accept_orders: data.acceptOrders,
            updated_at: new Date(),
            delivery_radius: data.deliveryRadius,
            currency: data.currency,
            commission: data.commission
        })
        .returning(BRANCH_COLUMNS);

    return toEntity(row);
}

export async function findBranchById(id: number): Promise<Branch | undefined> {
    const row = await db("restaurant_branches").select(BRANCH_COLUMNS).where("id", id).first();
    return row ? toEntity(row) : undefined;
}

export async function findBranchesByIds(ids: number[]): Promise<Branch[]> {
    if (ids.length === 0) return [];
    const rows = await db("restaurant_branches").select(BRANCH_COLUMNS).whereIn("id", ids);
    return rows.map(toEntity);
}

export async function updateBranchStatus(branchId: number, data: UpdateBranchStatusDTO, conn: Knex = db) {
    const [row] = await conn('restaurant_branches')
        .where({ id: branchId })
        .update({
            is_active: data.isActive,
            commission: data.commission,
            updated_at: new Date()
        })
        .returning(BRANCH_COLUMNS);

    return toEntity(row);
}