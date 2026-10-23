export class Product {
    id: number;
    name: string;
    description: string;
    imageURL: string;
    restaurantId: number;
    createdAt: Date;
    updatedAt: Date;
    categoryId: number | null;
    deletedAt: Date | null;

    constructor(data: Partial<Product>) {
        this.id = data.id!;
        this.name = data.name!;
        this.description = data.description!;
        this.imageURL = data.imageURL!;
        this.restaurantId = data.restaurantId!;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.categoryId = data.categoryId ?? null;
        this.deletedAt = data.deletedAt ?? null;
    }
}