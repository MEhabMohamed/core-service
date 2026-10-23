import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { ProductCategory } from "../entity/product-category.entity";

const PRODUCT_CATEGORY_COLUMNS = [
    'id',
    'name',
    'restaurant_id',
    'created_at',
    'updated_at'
];

function toEntity(row: any): ProductCategory {
    return new ProductCategory({
        id: Number(row.id),
        name: String(row.name),
        restaurantId: Number(row.restaurant_id),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });
}

export async function createProductCategory(restaurantId: number, name: string, conn: Knex = db): Promise<ProductCategory> {
    const [row] = await conn('product_categories')
        .insert({
            name,
            restaurant_id: restaurantId,
            created_at: new Date(),
            updated_at: new Date()
        })
        .returning(PRODUCT_CATEGORY_COLUMNS);
    return toEntity(row);
}

export async function findCategoriesByRestaurantId(restaurantId: number): Promise<ProductCategory[]> {
    const rows = await db('product_categories')
        .select(PRODUCT_CATEGORY_COLUMNS)
        .where({ restaurant_id: restaurantId });
    return rows.map(toEntity);
}

export async function findProductCategoryByName(name: string, restaurantId: number): Promise<ProductCategory | undefined> {
    const [row] = await db('product_categories')
        .select(PRODUCT_CATEGORY_COLUMNS)
        .where({ name, restaurant_id: restaurantId });
    return row ? toEntity(row) : undefined;
}

export async function updateProductCategory(id: number, data: Partial<ProductCategory>) {
    const [row] = await db('product_categories')
        .where({ id })
        .update({
            name: data.name,
            updated_at: new Date()
        })
        .returning(PRODUCT_CATEGORY_COLUMNS);
    return toEntity(row);
}