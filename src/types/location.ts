export type Location = {
    id: string;
    created_at?: string;
    name: string | null;
    street_name?: string | null;
    street_nr?: string | null;
    city?: string | null;
    country?: string | null;
    description?: string | null;
    image_url?: string | null;
    rating?: number | null;
};
