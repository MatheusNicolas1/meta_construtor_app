
import { supabase } from '@/integrations/supabase/client';

export const uploadFileToStorage = async (
    file: File,
    bucket: string,
    path: string
): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
};
