export type ShopItem = {
    id: string;
    created_at?: string;
    name: string;
    description?: string | null;
    price: number;
    stock?: number | null;
    store_url?: string | null;
    category?: string | null;
    image?: string | null;
};
