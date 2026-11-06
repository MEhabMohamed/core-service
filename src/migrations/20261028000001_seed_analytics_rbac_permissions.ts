import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        INSERT INTO permissions (resource, action, created_at) VALUES
          ('analytics', 'read', NOW())
        ON CONFLICT (resource, action) DO NOTHING;
    `);

    // Grant analytics:read to owner and branch_manager
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name IN ('owner', 'branch_manager')
        AND p.resource = 'analytics' AND p.action = 'read'
        ON CONFLICT DO NOTHING;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DELETE FROM role_permissions WHERE permission_id IN (
            SELECT id FROM permissions WHERE resource = 'analytics' AND action = 'read'
        );
        DELETE FROM permissions WHERE resource = 'analytics' AND action = 'read';
    `);
}

