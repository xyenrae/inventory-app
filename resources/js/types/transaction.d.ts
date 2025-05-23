export interface Transaction {
    id: number;
    type: 'in' | 'out' | 'transfer' | 'all';
    quantity: number;
    transaction_date: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
    };
    item: {
        id: number;
        name: string;
        quantity: number;
        category: {
            id: number;
            name: string;
        } | null;
    };
    fromRoom: {
        id: number;
        name: string;
        location: string;
    } | null;
    toRoom: {
        id: number;
        name: string;
        location: string;
    } | null;
}

export interface Item {
    id: number;
    name: string;
    category: string;
    current_room: Room;
    current_quantity: number;
}

export interface Room {
    id: number;
    name: string;
    location: string;
    display_name: string;
}

export interface Filters {
    search?: string;
    type?: 'in' | 'out' | 'transfer' | 'all';
    userType?: 'admin' | 'staff' | 'all';
    item?: number | 'all';
    fromRoom?: number | 'all';
    toRoom?: number | 'all';
    dateFrom?: string;
    dateTo?: string;
    perPage?: number;
};

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
};


export interface FormData {
    item_id: number | null;
    item_name?: string;
    type: 'in' | 'out' | 'transfer' | 'all';
    quantity: number | string;
    from_room_id: number | null;
    to_room_id: number | null;
    transaction_date: Date | null;
    max_quantity?: number;
    available_rooms?: Array<{
        id: number;
        display_name: string;
        location?: string;
        current_quantity: number;
    }>;
}