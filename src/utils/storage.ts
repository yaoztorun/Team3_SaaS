import { supabase } from '@/src/lib/supabase';

const BUCKET_NAME = 'Log images';

async function uriToBlob(uri: string) {
        const res = await fetch(uri);
        const blob = await res.blob();
        return blob;
}

export async function uploadImageUri(uri: string, destinationPath?: string) {
        try {
                const blob = await uriToBlob(uri);

                const extMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                const ext = extMatch ? `.${extMatch[1]}` : '.jpg';

                const filename = destinationPath || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;

                const { data, error: uploadError } = await supabase.storage
                        .from(BUCKET_NAME)
                        .upload(filename, blob, { cacheControl: '3600', upsert: false });

                if (uploadError) {
                        console.error('Upload error', uploadError);
                        throw uploadError;
                }

                const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
                return urlData.publicUrl;
        } catch (e) {
                console.error('uploadImageUri error', e);
                throw e;
        }
}

export default uploadImageUri;
