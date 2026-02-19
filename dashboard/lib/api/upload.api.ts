/**
 * Dummy upload: no API. Images are converted to data URLs (base64) for local preview.
 * Used by ImageUpload when no backend is connected.
 */

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export interface MultipleUploadResponse {
  images: UploadResponse[];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const url = await readFileAsDataUrl(file);
    return { url, publicId: `dummy-${Date.now()}`, width: 0, height: 0 };
  },

  uploadMultipleImages: async (files: File[]): Promise<MultipleUploadResponse> => {
    const images = await Promise.all(
      files.map(async (file, i) => ({
        url: await readFileAsDataUrl(file),
        publicId: `dummy-${Date.now()}-${i}`,
        width: 0,
        height: 0,
      }))
    );
    return { images };
  },

  deleteImage: async (_publicId: string): Promise<void> => {
    // Dummy: no-op
  },
};
