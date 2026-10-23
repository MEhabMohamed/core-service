import { db } from "../../../lib/knex/knex";
import { CustomerAddresses } from "../entity/addresses.entity";

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
        aparmentNumber: row.aparment_number,
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
            aparment_number: address.aparmentNumber,
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

export async function getAllCustomerAddresses(): Promise<CustomerAddresses[]> {
    const rows = await db("customer_addresses")
        .select(ADDRESS_COLUMNS)
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
            aparment_number: data.aparmentNumber,
            type: data.type,
            lat: data.lat,
            lng: data.lng,
            is_default: data.isDefault
        })
        .returning(ADDRESS_COLUMNS);
    return row ? toEntity(row) : undefined;
}


export async function updateUserDefaultAddress(id: number): Promise<CustomerAddresses | undefined> {
    const [row] = await db("customer_addresses")
        .where({ id })
        .update({
            is_default: true
        })
        .returning(ADDRESS_COLUMNS);
    return row ? toEntity(row) : undefined;
}

export async function deleteAddress(id: number) {
    const [row] = await db("customer_addresses")
        .where({ id })
        .delete()
        .returning(ADDRESS_COLUMNS);
    return row ? toEntity(row) : undefined;
}