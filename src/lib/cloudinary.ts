/**
 * Cloudinary Unsigned Upload Helper
 * Uploads images directly to Cloudinary using unsigned upload preset.
 */

export interface CloudinaryUploadResponse {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export const isCloudinaryConfigured = Boolean(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "docs_upload_example_preset";

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `فشل رفع الصورة إلى Cloudinary (${response.status})`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error(error.message || "حدث خطأ غير متوقع أثناء رفع الصورة");
  }
}
