import { Router } from "express";
import { healthRouter } from "./app/health/health.routes";
import { authRouter } from "./app/auth/routes";
import { userRouter } from "./app/user/routes";
import { adressRouter } from "./app/customer-address/routes";
import { restaurantRouter } from "./app/restaurant/routes";
import { branchRouter } from "./app/branch/routes";
import { productRouter } from "./app/product/routes";
import { rbacRouter } from "./app/rbac/routes";

export const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/user", userRouter);
routes.use("/customer/addresses", adressRouter);
routes.use("/restaurants", restaurantRouter);
routes.use("/", branchRouter);
routes.use("/", productRouter);
routes.use("/", rbacRouter);
