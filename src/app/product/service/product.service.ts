import { SystemRole } from "../../user/enums";
import { Product } from "../entity/product.entity";
import {
    createProduct,
    deleteProduct,
    findProductByBranchId,
    findProductById,
    findProductByRestaurantId,
    updateProduct
} from "../repository/product.repo";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import {
    createProductCategory,
    findCategoriesByRestaurantId,
    findProductCategoryByName
} from "../repository/product-category.repo";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { ProductNotFoundError, InvalidReserveItemsError, outOfStockError } from "../errors";
import { updateProductBranchDetails, findProductsForBranch } from "../repository/product-branch-details.repo";
import { injectable } from "tsyringe";
import { db } from "../../../lib/knex/knex";
import { EVENT_TYPES } from "../../../lib/events/event-types";
import { Knex } from "knex";
import {
    ReserveStockInput,
    ReserveStockApplied,
    ReserveStockResult,
    OutOfStockItem
} from "../types";
import { RestaurantNotFoundError } from "../../restaurant/errors";
import { UnAuthorisedError } from "../../../lib/auth/errors";
import { insertOutboxEvent, insertOutboxEvents } from "../../../lib/events/outbox.service";


@injectable()

export class ProductService {
    createProduct = async (data: CreateProductDTO, restaurantId: number, userId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }

        let categoryId: number | undefined = undefined;
        if (data.categoryName) {
            let category = await findProductCategoryByName(data.categoryName, restaurantId)
            if (!category) {
                category = await createProductCategory(restaurantId, data.categoryName);
            }
            categoryId = category.id;
        }
        const product = await createProduct(new Product({
            name: data.name,
            description: data.description,
            imageURL: data.imageURL,
            categoryId,
            restaurantId
        }))
        return product;
    }

    findCategoriesByRestaurant = async (restaurantId: number) => {
        return await findCategoriesByRestaurantId(restaurantId);
    }

    findProductByBranch = async (branchId: number) => {
        return await findProductByBranchId(branchId);
    }

    findProduct = async (id: number) => {
        const product = await findProductById(id);
        if (!product) {
            throw ProductNotFoundError;
        }
        return product;
    }

    findProductByRestaurant = async (restaurantId: number, userId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }
        return await findProductByRestaurantId(restaurantId);
    }

    updateProduct = async (productId: number, data: UpdateProductDTO, branchId?: number, userId?: number, userRole?: SystemRole) => {
        const product = await findProductById(productId);
        if (!product) {
            throw ProductNotFoundError;
        }

        const restaurant = await findRestaurantById(product.restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }

        let categoryId: number | undefined = undefined;
        if (data.categoryName) {
            let category = await findProductCategoryByName(data.categoryName, product.restaurantId);
            if (!category) {
                category = await createProductCategory(product.restaurantId, data.categoryName);
            }
            categoryId = category.id;
        }

        let branchDetails;
        if (branchId && data.price !== undefined && data.stock !== undefined && data.isAvailable !== undefined) {
            branchDetails = await db.transaction(async (trx) => {
                const details = await updateProductBranchDetails(productId, branchId, {
                    price: data.price,
                    stock: data.stock,
                    isAvailable: data.isAvailable
                });

                await insertOutboxEvent(trx, {
                    aggregateType: "product",
                    aggregateId: productId,
                    eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                    payload: { branchId, productId, stock: data.stock }
                });

                await insertOutboxEvent(trx, {
                    aggregateType: "product",
                    aggregateId: productId,
                    eventType: EVENT_TYPES.PRODUCT_PRICE_CHANGED,
                    payload: { branchId, productId, price: data.price }
                });

                return details;
            });
        }

        const updatedProduct = await updateProduct(productId, {
            name: data.name,
            description: data.description,
            imageURL: data.imageURL,
            categoryId
        });

        return {
            product: updatedProduct,
            branchDetails
        }
    }

    deleteProduct = async (productId: number, userId: number, userRole: SystemRole) => {
        const product = await findProductById(productId);
        if (!product) {
            throw ProductNotFoundError;
        }

        const restaurant = await findRestaurantById(product.restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }
        return await deleteProduct(productId);
    }

    findProductsForBranch = async (branchId: number, productIds: number[]) => {
        return await findProductsForBranch(branchId, productIds);
    }

    /**
     * Atomically increments branch stock for each item — reverse of reserveStock.
     * Used by order-service when an order placement fails after stock was reserved.
     * Bulk-updates via a single VALUES table and bulk-inserts the outbox rows.
     */
    releaseStock = async (branchId: number, items: ReserveStockInput[]): Promise<ReserveStockResult> => {
        const sanitized = sanitizeStockItems(items);
        const productIds = sanitized.map((i) => i.productId);

        const trx = await db.transaction();
        try {
            // Lock + read current stock for the targeted rows in one round-trip.
            const rows = await trx("product_branch_details")
                .where("branch_id", branchId)
                .whereIn("product_id", productIds)
                .select("product_id", "stock")
                .forUpdate();

            const byProduct = new Map<number, number>();
            for (const r of rows) byProduct.set(Number(r.product_id), Number(r.stock));

            // Compute the new stock per item; skip unknown products (release is best-effort).
            const applied: ReserveStockApplied[] = [];
            for (const it of sanitized) {
                const current = byProduct.get(it.productId);
                if (current === undefined) continue;
                applied.push({ productId: it.productId, newStock: current + it.quantity });
            }

            if (applied.length > 0) {
                await bulkUpdateStock(trx, branchId, applied);
                await insertOutboxEvents(trx, applied.map((a) => ({
                    aggregateType: "product",
                    aggregateId: a.productId,
                    eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                    payload: { branchId, productId: a.productId, newStock: a.newStock },
                })));
            }

            await trx.commit();
            return { ok: true, applied };
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    }

    /**
     * Atomically decrements branch stock for each item. Locks the rows FOR UPDATE,
     * fails the whole batch on any underflow, then writes one UPDATE + one
     * INSERT (outbox) regardless of N items.
     */
    reserveStock = async (branchId: number, items: ReserveStockInput[]): Promise<ReserveStockResult> => {
        const sanitized = sanitizeStockItems(items);
        const productIds = sanitized.map((i) => i.productId);

        const trx = await db.transaction();
        try {
            const rows = await trx("product_branch_details")
                .where("branch_id", branchId)
                .whereIn("product_id", productIds)
                .select("product_id", "stock", "is_available")
                .forUpdate();

            const byProduct = new Map<number, { stock: number; isAvailable: boolean }>();
            for (const r of rows) byProduct.set(Number(r.product_id), { stock: Number(r.stock), isAvailable: !!r.is_available });

            const offending: OutOfStockItem[] = [];
            const applied: ReserveStockApplied[] = [];
            for (const it of sanitized) {
                const current = byProduct.get(it.productId);
                if (!current || !current.isAvailable) {
                    offending.push({ productId: it.productId, requested: it.quantity, available: 0 });
                    continue;
                }
                if (current.stock < it.quantity) {
                    offending.push({ productId: it.productId, requested: it.quantity, available: current.stock });
                    continue;
                }
                applied.push({ productId: it.productId, newStock: current.stock - it.quantity });
            }

            if (offending.length > 0) {
                throw outOfStockError(offending);
            }

            await bulkUpdateStock(trx, branchId, applied);
            await insertOutboxEvents(trx, applied.map((a) => ({
                aggregateType: "product",
                aggregateId: a.productId,
                eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                payload: { branchId, productId: a.productId, newStock: a.newStock },
            })));

            await trx.commit();
            return { ok: true, applied };
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    }
}

function sanitizeStockItems(items: ReserveStockInput[]): ReserveStockInput[] {
    const sanitized = items
        .map((it) => ({ productId: Number(it.productId), quantity: Number(it.quantity) }))
        .filter((it) => Number.isInteger(it.productId) && Number.isInteger(it.quantity) && it.quantity > 0);
    if (sanitized.length !== items.length) {
        throw InvalidReserveItemsError;
    }
    return sanitized;
}

/**
 * Single UPDATE that sets product_branch_details.stock from a derived VALUES
 * table — one row, regardless of how many items.
 *
 *   UPDATE product_branch_details AS pbd
 *   SET stock = v.new_stock
 *   FROM (VALUES (1, 5), (2, 7)) AS v(product_id, new_stock)
 *   WHERE pbd.branch_id = ? AND pbd.product_id = v.product_id;
 */
async function bulkUpdateStock(trx: Knex.Transaction, branchId: number, applied: ReserveStockApplied[]): Promise<void> {
    if (applied.length === 0) return;

    const placeholders = applied.map(() => "(?, ?)").join(",");
    const bindings: (number | string)[] = [];
    for (const a of applied) bindings.push(a.productId, a.newStock);
    bindings.push(branchId);
    // Casts are required: parameters inside VALUES default to `text`, which
    // breaks `pbd.product_id (bigint) = v.product_id` and `SET stock (int) = v.new_stock`.
    await trx.raw(
        `UPDATE product_branch_details AS pbd
         SET stock = v.new_stock::int
         FROM (VALUES ${placeholders}) AS v(product_id, new_stock)
         WHERE pbd.branch_id = ? AND pbd.product_id = v.product_id::bigint`,
        bindings
    );
}

