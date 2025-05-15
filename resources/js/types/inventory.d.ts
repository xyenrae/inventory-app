// types/item.ts

export interface Item {
    id: number;
    name: string;
    category_id: number;
    room_id: number;
    category: {
        id: number;
        name: string;
    };
    room: {
        id: number;
        name: string;
        location: string;
        description?: string;
        status: string;
    };
    quantity: number;
    price: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface Filters {
    search: string;
    category: string;
    room?: string;
    status: string;
    minPrice: string;
    maxPrice: string;
    perPage: number;
}
