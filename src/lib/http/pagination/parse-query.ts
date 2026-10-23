import { FilterParams, PaginationParams } from "./cursor-pagination";

const DEFAULT_SORT_BY = "createdAt";

export function parsePaginationQuery(query: Record<string, any>, allowedSortFields: string[] = [DEFAULT_SORT_BY]): PaginationParams {
    const sortBy =
        allowedSortFields.includes(query.sortBy as string) ?
            query.sortBy as string : DEFAULT_SORT_BY;

    return {
        cursor: query.cursor as string,
        limit: Math.min(1000, Number(query.limit)),
        sortBy,
        sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc'
    }
}

export function parseFilterQuery(query: Record<string, any>, allowedFields: string[]): FilterParams[] {
    const filter = query.filter;
    if (!filter || typeof filter !== "object") return [];
    const allowedOps = new Set(["eq", "gt", "gte", "lt", "lte", "like", "in"]);
    return allowedFields.flatMap((field) => {
        const fieldFilters = filter[field];
        if (!fieldFilters || typeof fieldFilters !== "object") return [];
        return Object.entries(fieldFilters).filter(([op]) =>
            allowedOps.has(op)
        ).map(([op, value]) => ({
            field,
            operator: op as FilterParams["operator"],
            value: value as string | string[]
        }));
    })
}