import { Router } from "express";
import { healthRouter } from "./app/health/health.routes";
import { authRouter } from "./app/auth/routes";
import { userRouter } from "./app/user/routes";
import { adressRouter } from "./app/customer-address/routes";
import { restaurantRoutes } from "./app/restaurant/routes";
import { branchRoutes } from "./app/branch/routes";
import { productRoutes } from "./app/product/routes";
import { rbacRoutes } from "./app/rbac/routes";

export const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/user", userRouter);
routes.use("/customer/addresses", adressRouter);
routes.use("/restaurants", restaurantRoutes);
routes.use("/", branchRoutes);
routes.use("/", productRoutes);
routes.use("/", rbacRoutes);