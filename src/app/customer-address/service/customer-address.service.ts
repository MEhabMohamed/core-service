import { CreateAddressDTO, UpdateAddressDTO } from "../dto/customer-address.dto";
import { AddressNotFoundError } from "../errors";
import { clearDefaultByUserId, createAddress, deleteAddress, findAddressById, findAddressesByUserId, updateUserAddress } from "../repository/customer-address.repo";
import { injectable } from "tsyringe";

function toResponse(address: any) {
    return {
        id: address.id,
        label: address.label,
        country: address.country,
        city: address.city,
        street: address.street,
        building: address.building,
        apartmentNumber: address.apartmentNumber,
        type: address.type,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.isDefault,
    };
}

@injectable()
export class CustomerAddressesService {

    createAddress = async (userId: number, data: Partial<CreateAddressDTO>) => {
        if (data.isDefault) {
            await clearDefaultByUserId(userId);
        }

        const address = await createAddress({
            ...data,
            userId,
            createdAt: new Date()
        });

        return toResponse(address);
    }

    getByUserId = async (userId: number) => {
        const addresses = await findAddressesByUserId(userId);
        return addresses.map(toResponse);
    }

    updateAddress = async (id: number, userId: number, data: Partial<UpdateAddressDTO>) => {
        const existingAddress = await findAddressById(id);

        if (!existingAddress || existingAddress.userId !== userId) {
            throw AddressNotFoundError;
        }

        if (data.isDefault) {
            await clearDefaultByUserId(userId);
        }

        const address = await updateUserAddress(id, data);

        return toResponse(address);
    }

    getAddressById = async (id: number) => {
        const address = await findAddressById(id);

        if (!address) {
            throw AddressNotFoundError;
        }

        return {
            id: address.id,
            userId: address.userId,
            label: address.label,
            country: address.country,
            city: address.city,
            street: address.street,
            building: address.building,
            apartmentNumber: address.apartmentNumber,
            lat: address.lat,
            lng: address.lng,
        };
    }

    deleteAddress = async (id: number, userId: number) => {
        const existingAddress = await findAddressById(id);

        if (!existingAddress || existingAddress.userId !== userId) {
            throw AddressNotFoundError;
        }

        await deleteAddress(id);
    }
}