import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { Tokens } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";
import { RestaurantController } from "./controller/restaurant.controller";

export const restaurantRoutes = Router();

const restaurantController = container.resolve<RestaurantController>(Tokens.RestaurantController);

restaurantRoutes.get("/", restaurantController.findAll);
restaurantRoutes.get("/:id", restaurantController.findRestaurantById);
restaurantRoutes.post("/", authenticate, restaurantController.create);
restaurantRoutes.patch("/:id",
    authenticate,
    rbac({
        resource: "core:restaurant",
        action: "update"
    }),
    requireRestaurantMember("id"),
    restaurantController.update);
restaurantRoutes.patch("/:id/status",
    authenticate,
    restaurantController.updateStatus);