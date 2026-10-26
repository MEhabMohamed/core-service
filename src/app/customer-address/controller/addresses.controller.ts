import { Request, Response, NextFunction } from "express";
import { CustomerAddressesService } from "../service/addresses.service";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";

@injectable()
export class CustomerAddressesController {
    constructor(@inject(Tokens.CustomerAddressesService)
    private readonly addressesService: CustomerAddressesService) { }

    createAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.addressesService.createAddress(req.body);
            sendSuccess(res, {
                message: "address created successfully",
                address
            }, httpStatus.CREATED)
        } catch (error) {
            next(error);
        }
    }

    getAllCustomerAddresses = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.addressesService.getAllCustomerAddresses();
            sendSuccess(res, address, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    updateAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.addressesService.updateAddress(Number(req.params.addressId), req.body);
            sendSuccess(res, address, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    getAddressById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.addressesService.getAddressById(Number(req.params.addressId));
            sendSuccess(res, address, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.addressesService.deleteAddress(Number(req.params.addressId));
            sendSuccess(res, {
                message: "address deleted successfully",
                data: address
            }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    updateAddressDefault = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.addressesService.updateAddressDefault(Number(req.params.addressId));
            sendSuccess(res, address, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    getInternalAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.addressesService.getAddressById(Number(req.params.id));
            if (!address) {
                res.status(httpStatus.NOT_FOUND).json({ message: "Address not found" });
                return;
            }
            sendSuccess(res, {
                id: address.id,
                userId: address.userId,
                lat: Number(address.lat),
                lng: Number(address.lng),
                addressText: `${address.street}, ${address.city}, ${address.country}`,
                city: address.city,
                country: address.country,
                building: address.building,
                apartmentNumber: address.aparmentNumber,
                label: address.label
            }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }
}
