import { Currency } from "../enums";

export class Branch {
    id: number;
    restaurantId: number;
    countryCode: string;
    addressText: string;
    label: string;
    lat: number;
    lng: number;
    isActive: boolean;
    opensAt: string;
    closesAt: string;
    acceptOrders: boolean;
    createdAt: Date;
    updatedAt: Date;
    deliveryRadius: number;
    currency: Currency;
    commission: number;
    deliveryFee: number;

    constructor(branch: Partial<Branch>) {
        this.id = branch.id!;
        this.restaurantId = branch.restaurantId!;
        this.countryCode = branch.countryCode!;
        this.addressText = branch.addressText!;
        this.label = branch.label!;
        this.lat = branch.lat!;
        this.lng = branch.lng!;
        this.isActive = branch.isActive!;
        this.opensAt = branch.opensAt!;
        this.closesAt = branch.closesAt!;
        this.acceptOrders = branch.acceptOrders!;
        this.createdAt = branch.createdAt ?? new Date();
        this.updatedAt = branch.updatedAt ?? new Date();
        this.deliveryRadius = branch.deliveryRadius ?? 0;
        this.currency = branch.currency!;
        this.commission = branch.commission ?? 0;
        this.deliveryFee = branch.deliveryFee ?? 0;
    }
}