import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { UpdateRestaurantDTO } from "../dto/restaurant.dto";
import { applyCursorPagination, applyFilters, FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";

const RESTAURANT_COLUMNS = [
    'id',
    'owner_id',
    'name',
    'logo_url',
    'status',
    'primary_country',
    'created_at',
    'updated_at',
    'status_updated_at'
];

function toEntity(row: any): Restaurant {
    return new Restaurant({
        id: Number(row.id),
        ownerId: Number(row.owner_id),
        name: String(row.name),
        logoURL: String(row.logo_url),
        status: String(row.status) as RestaurantStatus,
        primaryCountry: String(row.primary_country),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        statusUpdatedAt: new Date(row.status_updated_at)
    });
}

export async function createRestaurant(data: Partial<Restaurant>, conn: Knex = db): Promise<Restaurant> {
    const [row] = await conn('restaurants')
        .insert({
            owner_id: data.ownerId,
            name: data.name,
            logo_url: data.logoURL,
            status: data.status,
            primary_country: data.primaryCountry,
            created_at: data.createdAt,
            updated_at: data.updatedAt,
            status_updated_at: data.statusUpdatedAt
        })
        .returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}

export async function findAllRestaurants(params: PaginationParams, filters: FilterParams[]): Promise<Restaurant[]> {
    let query = db('restaurants').select(RESTAURANT_COLUMNS);

    query = applyFilters(query, filters);
    query = applyCursorPagination(query, params);

    const rows = await query;
    return rows.map(toEntity);
}

export async function findRestaurantById(id: number): Promise<Restaurant | undefined> {
    const [row] = await db('restaurants')
        .select(RESTAURANT_COLUMNS)
        .where({ id });
    return row ? toEntity(row) : undefined;
}

export async function updateRestaurant(id: number, data: UpdateRestaurantDTO) {
    const [row] = await db('restaurants')
        .where({ id })
        .update({
            name: data.name,
            logo_url: data.logoUrl,
            primary_country: data.primaryCountry,
            updated_at: new Date()
        })
        .returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}

export async function updateRestaurantStatus(id: number, status: RestaurantStatus) {
    const [row] = await db('restaurants')
        .where({ id })
        .update({
            status: status,
            updated_at: new Date(),
            status_updated_at: new Date()
        })
        .returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}