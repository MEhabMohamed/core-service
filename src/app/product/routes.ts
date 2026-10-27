import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import {
    rbac,
    requireBranchAccess,
    requireRestaurantMember
} from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { Tokens } from "../../lib/di/tokens";
import { ProductController } from "./controller/product.controller";

import { requireInternalApiKey } from "../../lib/auth/api-key";

export const productRouter = Router();

const productController = container.resolve<ProductController>(Tokens.ProductController);

productRouter.get('/internal/branches/:id/products', requireInternalApiKey, productController.findByBranchAndIds);
productRouter.post('/internal/branches/:id/reserve-stock', requireInternalApiKey, productController.reserveStock);
productRouter.post('/internal/branches/:id/release-stock', requireInternalApiKey, productController.releaseStock);



productRouter.post("/restaurants/:restaurantId/products",
    authenticate,
    rbac({
        resource: "core:product",
        action: "create"
    }),
    requireRestaurantMember("restaurantId"),
    productController.createProduct);
productRouter.get("/restaurants/:restaurantId/products",
    authenticate,
    rbac({
        resource: "core:product",
        action: "read"
    }),
    requireRestaurantMember("restaurantId"),
    productController.findProductByRestaurant);
productRouter.get("/products/:productId", productController.findProduct);
productRouter.patch("/products/:productId",
    authenticate,
    rbac({
        resource: "core:product",
        action: "update"
    }),
    requireBranchAccess("branchId"),
    productController.updateProduct);
productRouter.get("/restaurants/:restaurantId/categories", productController.findCategoriesByRestaurant);
productRouter.get("/branches/:branchId/products", productController.findProductByBranch);