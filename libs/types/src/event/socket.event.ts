export const SocketEvent = {
  PHOTO_EDIT_RESULT: "photo_edit_result",
} as const;

export type SocketEventType = (typeof SocketEvent)[keyof typeof SocketEvent];
