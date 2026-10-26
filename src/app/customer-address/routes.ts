import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { requireInternalApiKey } from "../../lib/auth/api-key";
import { container } from "../../lib/di/container";
import { Tokens } from "../../lib/di/tokens";
import { CustomerAddressesController } from "./controller/customer-address.controller";

export const adressRouter = Router();

const customerAddressesController = container.
    resolve<CustomerAddressesController>(Tokens.CustomerAddressesController);

adressRouter.get("/internal/:id", requireInternalApiKey, customerAddressesController.getInternalAddress);
adressRouter.post("/", authenticate, customerAddressesController.createAddress);

adressRouter.get("/:addressId", authenticate, customerAddressesController.getAddressById);
adressRouter.patch("/:addressId", authenticate, customerAddressesController.updateAddress);
adressRouter.delete("/:addressId", authenticate, customerAddressesController.deleteAddress);