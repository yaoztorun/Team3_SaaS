import { supabase } from '../lib/supabase';
import type { Tables } from '../types/supabase';

export type DBShopItem = Tables<'ShopItem'>;

export async function fetchShopItems(): Promise<DBShopItem[]> {
    const { data, error } = await supabase
        .from('ShopItem')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching shop items:', error);
        return [];
    }

    return (data ?? []) as DBShopItem[];
}

export async function fetchShopItemById(itemId: string): Promise<DBShopItem | null> {
    const { data, error } = await supabase
        .from('ShopItem')
        .select('*')
        .eq('id', itemId)
        .single();

    if (error) {
        console.error('Error fetching shop item:', error);
        return null;
    }

    return data as DBShopItem;
}
