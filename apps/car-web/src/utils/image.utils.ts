import type { PhotoKey } from "@car/common";

export const ImageHelper = {
  endpoint: import.meta.env.STORAGE_ENDPOINT_PUBLIC || import.meta.env.VITE_STORAGE_ENDPOINT_PUBLIC || "",
  bucket: import.meta.env.STORAGE_BUCKET_NAME || import.meta.env.VITE_STORAGE_BUCKET_NAME || "",

  generatePublicUrl(fileKey: string | null | undefined): string | null {
    if (!fileKey || !this.endpoint || !this.bucket) {
      return null;
    }
    const base = this.endpoint.replace(/\/$/, "");
    return `${base}/${this.bucket}/${fileKey}`;
  },

  getPhotoUrl(photos: Record<string, string | string[]> | null | undefined, type: PhotoKey): string | null {
    if (!photos) return null;

    let fileKey = photos[type];
    if (Array.isArray(fileKey)) {
      fileKey = fileKey[0];
    }
    return this.generatePublicUrl(fileKey);
  },

  getPhotoArray(photos: Record<string, any> | null | undefined, key: string): string[] {
    if (!photos) return [];
    const value = photos[key];
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return [value];
    return [];
  },
};
