import "reflect-metadata";
import request from "supertest";
import { EmailStub, emailStub } from "../../helpers/stub/email-stub";
import { truncateAll } from "../../helpers/db";

jest.mock("../../../src/lib/email/init", () => ({
    emailProvider: emailStub
}))

import { createApp } from "../../../src/app";
import { db } from "../../../src/lib/knex/knex";
import { hashPassword } from "../../../src/app/auth/utils";

const app = createApp();

describe("POST api/auth/forgot-password", () => {
    beforeEach(async () => {
        await truncateAll();
        emailStub.reset();
    });
    it("persists a reset raw and email the user", async () => {
        const now = new Date();
        await db('users').insert({
            email: 'test@test.com',
            phone: '01000000001',
            name: 'hamada',
            password_hash: await hashPassword('str0ng!pass'),
            system_role: 'customer',
            created_at: now,
            updated_at: now
        });

        const res = ((await request(app).post('/api/auth/forgot-password').set('Idempotency-key', 'k1').send({
            email: "test@test.com"
        })));

        expect(res.statusCode).toBe(200);
        expect(await db('password_resets').count('* as n').first()).toEqual({ n: '1' });
        expect(emailStub.sent[0].to).toBe('test@test.com');
    });
})