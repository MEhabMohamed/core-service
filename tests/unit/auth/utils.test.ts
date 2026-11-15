import { hashPassword, comparePassword } from "../../../src/app/auth/utils";

describe("Auth Utils Tests", () => {
    it("Matches the hash produced by the hash password correctly", async () => {
        const password = "StrongPass!@#$word";
        const hashedPassword = await hashPassword(password);
        const isMatch = await comparePassword(password, hashedPassword);
        expect(isMatch).toBe(true);
    });
    it("does not match an incorrect password", async () => {
        const password = "StrongPass!@#$word";
        const hashedPassword = await hashPassword(password);
        const isMatch = await comparePassword("wrongPassword", hashedPassword);
        expect(isMatch).toBe(false);
    });
});