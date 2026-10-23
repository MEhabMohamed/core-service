import { CustomerAddresses } from "../entity/addresses.entity";
import { AddressNotCreatedError, AddressNotDeletedError, AddressNotFoundError } from "../errors";
import { createAddress, deleteAddress, findAddressById, getAllCustomerAddresses, updateUserAddress, updateUserDefaultAddress } from "../repository/addresses.repo";
import { injectable } from "tsyringe";

@injectable()
export class CustomerAddressesService {
    createAddress = async (data: CustomerAddresses) => {
        const address = await createAddress({
            ...data,
            createdAt: new Date()
        });

        if (!address) {
            throw AddressNotCreatedError;
        }

        return address;
    }

    getAllCustomerAddresses = async () => {
        const addresses = await getAllCustomerAddresses();

        if (!addresses) {
            throw AddressNotFoundError;
        }

        return addresses;
    }

    updateAddress = async (id: number, data: Partial<CustomerAddresses>) => {
        const existingAddress = await findAddressById(id);

        if (!existingAddress) {
            throw AddressNotFoundError;
        }

        const address = await updateUserAddress(id, data);

        if (!address) {
            throw AddressNotFoundError;
        }

        return address;
    }

    getAddressById = async (id: number) => {
        const address = await findAddressById(id);

        if (!address) {
            throw AddressNotFoundError;
        }

        return address;
    }

    deleteAddress = async (id: number) => {
        const existingAddress = await findAddressById(id);

        if (!existingAddress) {
            throw AddressNotFoundError;
        }


        const address = await deleteAddress(id);

        if (!address) {
            throw AddressNotDeletedError;
        }

        return address;
    }

    updateAddressDefault = async (id: number) => {
        const existingAddress = await findAddressById(id);

        if (!existingAddress) {
            throw AddressNotFoundError;
        }


        const address = await updateUserDefaultAddress(id);

        if (!address) {
            throw AddressNotFoundError;
        }

        return address;
    }
}