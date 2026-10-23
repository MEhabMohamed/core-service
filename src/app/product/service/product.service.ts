import { SystemRole } from "../../user/enums";
import { Product } from "../entity/product.entity";
import {
    createProduct,
    deleteProduct,
    findProductByBranchId,
    findProductById,
    findProductByRestaurantId,
    updateProduct
} from "../repository/product.repo";
import { RestaurantNotFoundError, UnauthorizedError } from "../../branch/errors";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import {
    createProductCategory,
    findCategoriesByRestaurantId,
    findProductCategoryByName
} from "../repository/product-category.repo";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { ProductNotFoundError } from "../errors";
import { updateProductBranchDetails } from "../repository/product-branch-details.repo";
import { injectable } from "tsyringe";

@injectable()
export class ProductService {
    createProduct = async (data: CreateProductDTO, restaurantId: number, userId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnauthorizedError;
        }

        let categoryId: number | undefined = undefined;
        if (data.categoryName) {
            let category = await findProductCategoryByName(data.categoryName, restaurantId)
            if (!category) {
                category = await createProductCategory(restaurantId, data.categoryName);
            }
            categoryId = category.id;
        }
        const product = await createProduct(new Product({
            name: data.name,
            description: data.description,
            imageURL: data.imageURL,
            categoryId,
            restaurantId
        }))
        return product;
    }

    findCategoriesByRestaurant = async (restaurantId: number) => {
        return await findCategoriesByRestaurantId(restaurantId);
    }

    findProductByBranch = async (branchId: number) => {
        return await findProductByBranchId(branchId);
    }

    findProduct = async (id: number) => {
        const product = await findProductById(id);
        if (!product) {
            throw ProductNotFoundError;
        }
        return product;
    }

    findProductByRestaurant = async (restaurantId: number, userId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnauthorizedError;
        }
        return await findProductByRestaurantId(restaurantId);
    }

    updateProduct = async (productId: number, data: UpdateProductDTO, branchId?: number, userId?: number, userRole?: SystemRole) => {
        const product = await findProductById(productId);
        if (!product) {
            throw ProductNotFoundError;
        }

        const restaurant = await findRestaurantById(product.restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnauthorizedError;
        }

        let categoryId: number | undefined = undefined;
        if (data.categoryName) {
            let category = await findProductCategoryByName(data.categoryName, product.restaurantId);
            if (!category) {
                category = await createProductCategory(product.restaurantId, data.categoryName);
            }
            categoryId = category.id;
        }

        let branchDetails;
        if (branchId && data.price !== undefined && data.stock !== undefined && data.isAvailable !== undefined) {
            branchDetails = await updateProductBranchDetails(productId, branchId, {
                price: data.price,
                stock: data.stock,
                isAvailable: data.isAvailable
            });
        }

        const updatedProduct = await updateProduct(productId, {
            name: data.name,
            description: data.description,
            imageURL: data.imageURL,
            categoryId
        });

        return {
            product: updatedProduct,
            branchDetails
        }
    }

    deleteProduct = async (productId: number, userId: number, userRole: SystemRole) => {
        const product = await findProductById(productId);
        if (!product) {
            throw ProductNotFoundError;
        }

        const restaurant = await findRestaurantById(product.restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnauthorizedError;
        }
        return await deleteProduct(productId);
    }
}