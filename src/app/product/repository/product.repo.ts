import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { Product } from "../entity/product.entity";

const PRODUCT_COLUMNS = [
    'id',
    'name',
    'description',
    'image_url',
    'restaurant_id',
    'category_id',
    'created_at',
    'updated_at'
];

function toEntity(row: any): Product {
    return new Product({
        id: Number(row.id),
        name: String(row.name),
        description: String(row.description),
        imageURL: String(row.image_url),
        restaurantId: Number(row.restaurant_id),
        categoryId: Number(row.category_id),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });
}

export async function createProduct(data: Partial<Product>, conn: Knex = db): Promise<Product> {
    const [row] = await conn('products')
        .insert({
            name: data.name,
            description: data.description,
            image_url: data.imageURL,
            restaurant_id: data.restaurantId,
            category_id: data.categoryId,
            created_at: data.createdAt,
            updated_at: data.updatedAt
        })
        .returning(PRODUCT_COLUMNS);
    return toEntity(row);
}

export async function findProductByRestaurantId(restaurantId: number): Promise<Product[]> {
    const rows = await db('products')
        .select(PRODUCT_COLUMNS)
        .where({ restaurant_id: restaurantId })
        .whereNull('deleted_at');
    return rows.map(toEntity);
}

export async function findProductById(id: number): Promise<Product | undefined> {
    const row = await db('products')
        .select(PRODUCT_COLUMNS)
        .where({ id })
        .whereNull('deleted_at')
        .first();
    return row ? toEntity(row) : undefined;
}

export async function findProductByBranchId(branchId: number) {
    const rows = await db('products as p')
        .join('product_branch_details as pbd', 'p.id', 'pbd.product_id')
        .leftJoin('product_categories as pc', 'p.category_id', 'pc.id')
        .where({ 'pbd.branch_id': branchId })
        .whereNull('p.deleted_at')
        .select(
            'p.id',
            'p.name',
            'p.description',
            'p.image_url',
            'p.restaurant_id',
            'p.category_id',
            'pc.name as category_name',
            'pbd.price',
            'pbd.stock',
            'pbd.is_available'
        );
    return rows.map((row: any) => {
        return {
            id: Number(row.id),
            name: String(row.name),
            description: String(row.description),
            imageURL: String(row.image_url),
            restaurantId: Number(row.restaurant_id),
            categoryId: Number(row.category_id),
            categoryName: String(row.category_name),
            price: Number(row.price),
            stock: Number(row.stock),
            isAvailable: Boolean(row.is_available)
        };
    });
}

export async function updateProduct(id: number, data: Partial<Product>) {
    const [row] = await db('products')
        .where({ id })
        .update({
            name: data.name,
            description: data.description,
            image_url: data.imageURL,
            category_id: data.categoryId,
            updated_at: new Date()
        })
        .returning(PRODUCT_COLUMNS);
    return toEntity(row);
}