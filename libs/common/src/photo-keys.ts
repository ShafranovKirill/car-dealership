export const PHOTO_KEYS = {
  PHOTO_XXS: "photo_card",
  PHOTO_XS: "photo_preview",
  PHOTO_SM: "photo_small",
  PHOTO_MD: "photo_medium",
  PHOTO_LG: "photo_large",
  PRODUCT_ORIGINAL: "photo_original",
} as const;

export type PhotoKey = (typeof PHOTO_KEYS)[keyof typeof PHOTO_KEYS];
