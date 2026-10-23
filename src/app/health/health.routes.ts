import { Router } from "express";
import { pingDB } from "../../lib/knex/knex";

export const healthRouter = Router();

healthRouter.get('/', async (req, res, next) => {
    try {
        await pingDB();
        res.status(200).send("Health OK");
    } catch (err) {
        res.status(500).send({
            message: "db down"
        });
    }
});
