// types/activity-log.ts

export interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: {
        user_agent?: string;
        attributes?: Record<string, any>;
        old?: Record<string, any>;
    };
    created_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    } | null;
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
    log_name: string;
    start_date: string;
    end_date: string;
    causer_id: string;
    perPage: number;
}