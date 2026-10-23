import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { Tokens } from "../../lib/di/tokens";
import { ProductController } from "./controller/product.controller";

export const productRoutes = Router();

const productController = container.resolve<ProductController>(Tokens.ProductController);

productRoutes.post("/restaurants/:restaurantId/products",
    authenticate,
    rbac({
        resource: "core:product",
        action: "create"
    }),
    requireRestaurantMember("restaurantId"),
    productController.createProduct);
productRoutes.get("/restaurants/:restaurantId/products",
    authenticate,
    rbac({
        resource: "core:product",
        action: "read"
    }),
    requireRestaurantMember("restaurantId"),
    productController.findProductByRestaurant);
productRoutes.get("/products/:productId", productController.findProduct);
productRoutes.patch("/products/:productId",
    authenticate,
    rbac({
        resource: "core:product",
        action: "update"
    }),
    requireBranchAccess("branchId"),
    productController.updateProduct);
productRoutes.delete("/products/:productId", authenticate, productController.deleteProduct);
productRoutes.get("/restaurants/:restaurantId/categories", productController.findCategoriesByRestaurant);
productRoutes.get("/branches/:branchId/products", productController.findProductByBranch);