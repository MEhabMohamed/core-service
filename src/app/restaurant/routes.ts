import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { Tokens } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";
import { RestaurantController } from "./controller/restaurant.controller";

export const restaurantRouter = Router();

const restaurantController = container.resolve<RestaurantController>(Tokens.RestaurantController);

restaurantRouter.get("/", restaurantController.findAll);
restaurantRouter.get("/:id", restaurantController.findRestaurantById);
restaurantRouter.post("/", authenticate, restaurantController.create);
restaurantRouter.patch("/:id",
    authenticate,
    rbac({
        resource: "core:restaurant",
        action: "update"
    }),
    requireRestaurantMember("id"),
    restaurantController.update);
restaurantRouter.patch("/:id/status",
    authenticate,
    restaurantController.updateStatus);