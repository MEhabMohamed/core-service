import { Router } from "express";
import { healthRouter } from "./app/health/health.routes";
import { authRouter } from "./app/auth/routes";
import { userRouter } from "./app/user/routes";
import { adressRouter } from "./app/customer-address/routes";
import { restaurantRoutes } from "./app/restaurant/routes";
import { branchRoutes } from "./app/branch/routes";
import { productRoutes } from "./app/product/routes";
import { rbacRoutes } from "./app/rbac/routes";
import { requireInternalApiKey } from "./lib/auth/api-key";
import { container } from "./lib/di/container";
import { Tokens } from "./lib/di/tokens";
import { CustomerAddressesController } from "./app/customer-address/controller/addresses.controller";
import { UserController } from "./app/user/controller/user.controller";

export const routes = Router();

const customerAddressesController = container.resolve<CustomerAddressesController>(Tokens.CustomerAddressesController);
const userController = container.resolve<UserController>(Tokens.UserController);

// Internal routes (with full alias compatibility for order-service and Service B contracts)
routes.get("/internal/customer-addresses/:id", requireInternalApiKey, customerAddressesController.getInternalAddress);
routes.get("/customer/addresses/internal/:id", requireInternalApiKey, customerAddressesController.getInternalAddress);

routes.get("/internal/agents/:id", requireInternalApiKey, userController.getInternalAgent);
routes.get("/internal/users/:id", requireInternalApiKey, userController.getInternalAgent);
routes.get("/user/internal/agents/:id", requireInternalApiKey, userController.getInternalAgent);


routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/user", userRouter);
routes.use("/customer/addresses", adressRouter);
routes.use("/restaurants", restaurantRoutes);
routes.use("/", branchRoutes);
routes.use("/", productRoutes);
routes.use("/", rbacRoutes);
