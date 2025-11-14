import { supabase } from '../lib/supabase';

export async function uploadProfileImage(userId: string, imageUri: string): Promise<{ url: string | null; error?: string }> {
    try {
        // For web blob URLs, we need to fetch and convert to blob
        let blob: Blob;
        
        if (imageUri.startsWith('blob:')) {
            const response = await fetch(imageUri);
            blob = await response.blob();
        } else if (imageUri.startsWith('data:')) {
            // Handle base64 data URLs
            const response = await fetch(imageUri);
            blob = await response.blob();
        } else {
            // For native file URIs, fetch the file
            const response = await fetch(imageUri);
            blob = await response.blob();
        }

        // Create a unique filename
        const fileExt = blob.type.split('/')[1] || 'jpg';
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('profiles')
            .upload(filePath, blob, {
                contentType: blob.type,
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error);
            return { url: null, error: error.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);

        return { url: publicUrl };
    } catch (error) {
        console.error('Upload error:', error);
        return { url: null, error: String(error) };
    }
}

export async function deleteProfileImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'profiles');
        
        if (bucketIndex === -1) {
            return { success: false, error: 'Invalid image URL' };
        }

        const filePath = pathParts.slice(bucketIndex + 1).join('/');

        const { error } = await supabase.storage
            .from('profiles')
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: String(error) };
    }
}
