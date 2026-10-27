import { Knex } from "knex";
import { InvalidReserveItemsError } from "../errors";
import { ReserveStockApplied, ReserveStockInput } from "../types";

export function sanitizeStockItems(items: ReserveStockInput[]): ReserveStockInput[] {
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
export async function bulkUpdateStock(trx: Knex.Transaction, branchId: number, applied: ReserveStockApplied[]): Promise<void> {
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