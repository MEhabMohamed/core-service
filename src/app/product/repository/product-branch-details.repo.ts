import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { ProductBranchDetails } from "../entity/product-branch-details.entity";

const PRODUCT_BRANCH_DETAILS_COLUMNS = [
    'id',
    'product_id',
    'branch_id',
    'price',
    'is_available',
    'stock'
];

function toEntity(row: any): ProductBranchDetails {
    return new ProductBranchDetails({
        id: Number(row.id),
        productId: Number(row.product_id),
        branchId: Number(row.branch_id),
        price: Number(row.price),
        isAvailable: Boolean(row.is_available),
        stock: Number(row.stock)
    });
}

export async function updateProductBranchDetails(productId: number, branchId: number, data: { price?: number, stock?: number, isAvailable?: boolean }): Promise<ProductBranchDetails> {
    const [row] = await db('product_branch_details')
        .where({ product_id: productId, branch_id: branchId })
        .update({
            price: data.price,
            is_available: data.isAvailable,
            stock: data.stock
        })
        .returning(PRODUCT_BRANCH_DETAILS_COLUMNS);
    return toEntity(row);
}

export async function findProductsForBranch(branchId: number, productIds: number[], conn: Knex = db) {
    const rows = await conn('product_branch_details as pbd')
        .join('products as p', 'pbd.product_id', 'p.id')
        .where('pbd.branch_id', branchId)
        .whereIn('pbd.product_id', productIds)
        .whereNull('p.deleted_at')
        .select(
            'pbd.product_id as productId',
            'p.name',
            'p.image_url as imageUrl',
            'pbd.price',
            'pbd.stock',
            'pbd.is_available as isAvailable'
        );

    return rows.map((r: any) => ({
        productId: Number(r.productId),
        name: r.name,
        imageUrl: r.imageUrl || null,
        price: Number(r.price),
        stock: Number(r.stock),
        isAvailable: Boolean(r.isAvailable)
    }));
}

