export type MenuCategoryType = 'timbang_hidup' | 'olahan' | 'eceran';

export interface MenuCategoryData {
    id: number;
    name: string;
    type: MenuCategoryType;
    slug: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface MenuItemData {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    image: string | null;
    image_url?: string | null;
    base_price: string | number | null;
    formatted_price: string;
    is_price_pending: boolean;
    unit: 'kg' | 'ekor' | 'pcs' | 'porsi' | string;
    is_available: boolean;
    stock_quantity: string | number | null;
    min_order_hours: number | null;
    sort_order: number;
    category: MenuCategoryData;
}

export interface MenuFilters {
    category: string;
    status: string;
    search: string;
    view: 'grid' | 'table';
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedMenuItems {
    data: MenuItemData[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface MenuPageProps {
    menuItems: PaginatedMenuItems;
    categories: MenuCategoryData[];
    filters: MenuFilters;
    menu?: MenuItemData | null;
    flash?: {
        success?: string;
        error?: string;
    };
}
