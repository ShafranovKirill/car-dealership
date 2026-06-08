import { type PhotoKey } from "@car/common";

export const ImageHelper = {
  endpoint: import.meta.env.STORAGE_ENDPOINT_PUBLIC,
  bucket: import.meta.env.STORAGE_BUCKET_NAME,

  generatePublicUrl(fileKey: string | null | undefined): string | null {
    if (!fileKey || !this.endpoint || !this.bucket) {
      return null;
    }
    const base = this.endpoint.replace(/\/$/, "");
    return `${base}/${this.bucket}/${fileKey}`;
  },

  getPhotoUrl(photos: Record<string, string> | null | undefined, type: PhotoKey): string | null {
    if (!photos) return null;

    const fileKey = photos[type];
    return this.generatePublicUrl(fileKey);
  },
};
