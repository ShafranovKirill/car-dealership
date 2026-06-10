import type { PhotoKey } from "@car/common";

export const ImageHelper = {
  endpoint: import.meta.env.VITE_STORAGE_ENDPOINT_PUBLIC || "",
  bucket: import.meta.env.VITE_STORAGE_BUCKET_NAME || "",

  generatePublicUrl(fileKey: string | null | undefined): string | null {
    if (!fileKey || !this.endpoint || !this.bucket) {
      console.warn("ImageHelper: Missing config or fileKey", {
        endpoint: this.endpoint,
        bucket: this.bucket,
        fileKey,
      });
      return null;
    }
    const base = this.endpoint.replace(/\/$/, "");
    return `${base}/${this.bucket}/${fileKey}`;
  },

  getPhotoUrl(photos: Record<string, string | string[]> | null | undefined, type: PhotoKey): string | null {
    if (!photos) return null;

    const value = photos[type];
    const fileKey = Array.isArray(value) ? value[0] : value;

    return this.generatePublicUrl(fileKey);
  },

  getPhotoArray(photos: Record<string, any> | null | undefined, key: string): string[] {
    if (!photos) return [];

    const value = photos[key];
    if (!value) return [];

    return Array.isArray(value) ? value : [String(value)];
  },
};
