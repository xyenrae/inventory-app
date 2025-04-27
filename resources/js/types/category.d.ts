export interface Category {
    id: number;
    name: string;
    description: string | null;
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
    status: string;
    perPage: number;
}

export interface CategoryForm {
    name: string;
    description: string;
    status: string;
}
