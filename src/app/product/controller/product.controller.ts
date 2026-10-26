import { Response, Request, NextFunction } from "express";
import { ProductService } from "../service/product.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { InvalidReserveItemsError } from "../errors";
import { SystemRole } from "../../user/enums";
import { injectable, inject } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";

@injectable()
export class ProductController {
    constructor(
        @inject(Tokens.ProductService)
        private readonly productService: ProductService
    ) { }

    createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateProductDTO, req.body);
            const result = await this.productService.createProduct(data, Number(req.params.restaurantId), Number(req.user?.userId), req.user?.role as SystemRole);
            sendSuccess(res,
                { message: "Product created successfully", data: result },
                httpStatus.CREATED
            );
        } catch (error) {
            next(error)
        }
    }

    findProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = Number(req.params.productId);
            const result = await this.productService.findProduct(productId);
            sendSuccess(res, result, httpStatus.OK);
        } catch (error) {
            next(error)
        }
    }

    findProductByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const result = await this.productService.findProductByRestaurant(restaurantId, Number(req.user?.userId), req.user?.role as SystemRole);
            sendSuccess(res, { data: result }, httpStatus.OK);
        } catch (error) {
            next(error)
        }
    }

    findProductByBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.branchId);
            const result = await this.productService.findProductByBranch(branchId);
            sendSuccess(res, result, httpStatus.OK);
        } catch (error) {
            next(error)
        }
    }

    findCategoriesByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const result = await this.productService.findCategoriesByRestaurant(restaurantId);
            sendSuccess(res, result, httpStatus.OK);
        } catch (error) {
            next(error)
        }
    }

    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateProductDTO, req.body);
            const result = await this.productService.updateProduct(Number(req.params.productId), data, Number(req.query.branchId), Number(req.user?.userId), req.user?.role as SystemRole);
            sendSuccess(res,
                { message: "Product updated successfully", data: result },
                httpStatus.OK
            );
        } catch (error) {
            next(error)
        }
    }

    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.productService.deleteProduct(Number(req.params.productId), Number(req.user?.userId), req.user?.role as SystemRole);
            sendSuccess(res,
                { message: "Product deleted successfully", data: result },
                httpStatus.OK
            );
        } catch (error) {
            next(error)
        }
    }

    getInternalBranchProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const idsStr = String(req.query.ids || "");
            const productIds = idsStr.split(",").map(id => Number(id.trim())).filter(id => !isNaN(id) && id > 0);
            const products = await this.productService.findProductsForBranch(branchId, productIds);
            sendSuccess(res, products, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    reserveStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const items = req.body?.items;
            if (!Array.isArray(items) || items.length === 0) {
                throw InvalidReserveItemsError;
            }
            const result = await this.productService.reserveStock(branchId, items);
            sendSuccess(res, result, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    releaseStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const items = req.body?.items;
            if (!Array.isArray(items) || items.length === 0) {
                throw InvalidReserveItemsError;
            }
            const result = await this.productService.releaseStock(branchId, items);
            sendSuccess(res, result, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }
}

