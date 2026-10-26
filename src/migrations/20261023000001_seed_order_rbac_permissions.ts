import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        INSERT INTO permissions (resource, action, created_at) VALUES
          -- Orders
          ('orders',     'read',          NOW()),
          ('orders',     'accept',        NOW()),
          ('orders',     'update',        NOW()),
          ('orders',     'cancel',        NOW()),
          -- Payments
          ('payments',   'read',          NOW()),
          ('payments',   'refund',        NOW()),
          -- Deliveries
          ('deliveries', 'assign',        NOW()),
          -- Finance
          ('finance',    'read',          NOW()),
          ('finance',    'payout_create', NOW())
        ON CONFLICT (resource, action) DO NOTHING;
    `);

    // Owner gets all new permissions
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'owner'
        AND p.resource IN ('orders', 'payments', 'deliveries', 'finance')
        ON CONFLICT DO NOTHING;
    `);

    // Branch manager: orders:read, orders:accept, orders:update, orders:cancel, finance:read
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'branch_manager'
        AND p.resource || ':' || p.action IN (
            'orders:read',
            'orders:accept',
            'orders:update',
            'orders:cancel',
            'finance:read'
        )
        ON CONFLICT DO NOTHING;
    `);

    // Staff: orders:read, orders:update, orders:accept
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'staff'
        AND p.resource || ':' || p.action IN (
            'orders:read',
            'orders:update',
            'orders:accept'
        )
        ON CONFLICT DO NOTHING;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DELETE FROM role_permissions WHERE permission_id IN (
            SELECT id FROM permissions WHERE resource IN ('orders', 'payments', 'deliveries', 'finance')
        );
        DELETE FROM permissions WHERE resource IN ('orders', 'payments', 'deliveries', 'finance');
    `);
}
