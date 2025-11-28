import { supabase } from '@/src/lib/supabase';

const DEFAULT_BUCKET_NAME = 'Log images';

async function uriToBlob(uri: string) {
        const res = await fetch(uri);
        const blob = await res.blob();
        return blob;
}

/**
 * Upload an image URI to the storage bucket.
 * If `userId` is provided, the file will be uploaded under a top-level folder named after the user.
 * @param bucketName - The name of the storage bucket to upload to. Defaults to 'Log images'.
 */
export async function uploadImageUri(uri: string, userId?: string | null, destinationPath?: string, bucketName?: string) {
        try {
                const blob = await uriToBlob(uri);

                const extMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                const ext = extMatch ? `.${extMatch[1]}` : '.jpg';

                const baseName = destinationPath || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
                const filename = userId ? `${userId}/${baseName}` : baseName;
                const bucket = bucketName || DEFAULT_BUCKET_NAME;

                const { data, error: uploadError } = await supabase.storage
                        .from(bucket)
                        .upload(filename, blob, { cacheControl: '3600', upsert: false });

                if (uploadError) {
                        console.error('Upload error', uploadError);
                        throw uploadError;
                }

                const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
                return urlData.publicUrl;
        } catch (e) {
                console.error('uploadImageUri error', e);
                throw e;
        }
}

export default uploadImageUri;
