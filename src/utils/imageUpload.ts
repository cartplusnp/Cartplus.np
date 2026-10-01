import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates image file type and size according to production security guidelines.
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file format. Allowed formats: JPG, PNG, WEBP, GIF.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'File size exceeds 5MB limit. Please upload a smaller image.',
    };
  }

  return { isValid: true };
}

/**
 * Uploads an image file to Supabase Storage bucket ('product-images').
 * Returns storage path and public URL.
 */
export async function uploadProductImage(
  file: File,
  folder = 'products'
): Promise<{ success: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  if (!isSupabaseConfigured) {
    // Development fallback when credentials are not yet entered
    console.warn('Supabase Storage not configured. Falling back to local preview.');
    const preview = await processImagePreview(file);
    return {
      success: true,
      publicUrl: preview,
      storagePath: `local-fallback/${Date.now()}-${file.name}`,
    };
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${Date.now()}-${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      storagePath: data.path,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return { success: false, error: msg };
  }
}

/**
 * Lightweight local preview generator for instant browser feedback.
 */
export async function processImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}
