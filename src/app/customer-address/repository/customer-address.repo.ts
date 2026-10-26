import { db } from "../../../lib/knex/knex";
import { CustomerAddresses } from "../entity/customer-address.entity";

const ADDRESS_COLUMNS = [
    "id",
    "user_id",
    "label",
    "country",
    "city",
    "street",
    "building",
    "aparment_number",
    "type",
    "lat",
    "lng",
    "is_default",
    "created_at"
];

function toEntity(row: any): CustomerAddresses {
    return new CustomerAddresses({
        id: row.id,
        userId: row.user_id,
        label: row.label,
        country: row.country,
        city: row.city,
        street: row.street,
        building: row.building,
        apartmentNumber: row.aparment_number,
        type: row.type,
        lat: row.lat,
        lng: row.lng,
        isDefault: row.is_default,
        createdAt: row.created_at
    });
}


export async function createAddress(address: Partial<CustomerAddresses>): Promise<CustomerAddresses> {
    const [row] = await db("customer_addresses")
        .insert({
            user_id: address.userId,
            label: address.label,
            country: address.country,
            city: address.city,
            street: address.street,
            building: address.building,
            aparment_number: address.apartmentNumber,
            type: address.type,
            lat: address.lat,
            lng: address.lng,
            is_default: address.isDefault,
            created_at: address.createdAt
        })
        .returning(ADDRESS_COLUMNS);
    return toEntity(row);
}

export async function findAddressById(id: number): Promise<CustomerAddresses | undefined> {
    const [row] = await db("customer_addresses")
        .select(ADDRESS_COLUMNS)
        .where({ id });
    return row ? toEntity(row) : undefined;
}

export async function findAddressesByUserId(userId: number): Promise<CustomerAddresses[]> {
    const rows = await db("customer_addresses")
        .select(ADDRESS_COLUMNS)
        .where("user_id", userId);

    return rows.map(toEntity);
}

export async function updateUserAddress(id: number, data: Partial<CustomerAddresses>): Promise<CustomerAddresses | undefined> {
    const [row] = await db("customer_addresses")
        .where({ id })
        .update({
            label: data.label,
            country: data.country,
            city: data.city,
            street: data.street,
            building: data.building,
            aparment_number: data.apartmentNumber,
            type: data.type,
            lat: data.lat,
            lng: data.lng,
            is_default: data.isDefault
        })
        .returning(ADDRESS_COLUMNS);
    return row ? toEntity(row) : undefined;
}

export async function clearDefaultByUserId(userId: number): Promise<void> {
    await db("customer_addresses")
        .where("user_id", userId)
        .where("is_default", true)
        .update({ is_default: false });
}

export async function deleteAddress(id: number) {
    await db("customer_addresses")
        .where({ id })
        .delete();
}