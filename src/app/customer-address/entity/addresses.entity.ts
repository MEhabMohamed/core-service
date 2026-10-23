import { AddressType } from "../enums";

export class CustomerAddresses {
    id!: number;
    userId!: number;
    label!: string;
    country!: string;
    city!: string;
    street!: string;
    building: string | null;
    aparmentNumber: string | null;
    type!: AddressType;
    lat!: number;
    lng!: number;
    isDefault!: boolean;
    createdAt: Date;

    constructor(data: Partial<CustomerAddresses>) {
        this.id = data.id!;
        this.userId = data.userId!;
        this.label = data.label!;
        this.country = data.country!;
        this.city = data.city!;
        this.street = data.street!;
        this.building = data.building ?? null;
        this.aparmentNumber = data.aparmentNumber ?? null;
        this.type = data.type!;
        this.lat = data.lat!;
        this.lng = data.lng!;
        this.isDefault = data.isDefault!;
        this.createdAt = data.createdAt ?? new Date();
    }
}