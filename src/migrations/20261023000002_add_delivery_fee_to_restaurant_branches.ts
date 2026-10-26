import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    const hasCol = await knex.schema.hasColumn("restaurant_branches", "delivery_fee");
    if (!hasCol) {
        await knex.schema.alterTable("restaurant_branches", (table) => {
            table.integer("delivery_fee").notNullable().defaultTo(0);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasCol = await knex.schema.hasColumn("restaurant_branches", "delivery_fee");
    if (hasCol) {
        await knex.schema.alterTable("restaurant_branches", (table) => {
            table.dropColumn("delivery_fee");
        });
    }
}
