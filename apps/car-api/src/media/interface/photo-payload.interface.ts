import { PhotoKey } from '@car/common';
import { ProjectEvent } from '../../shared/events/types.js';
import { PhotoProfile } from '../photo-configs/profiles.js';

export interface ParentPhotoQueuePayload {
  targetId: string;
  socketId: string;
  originalFileKey: string;
  succesEventType: ProjectEvent;
  failEventType: ProjectEvent;
}

export interface ChildPhotoQueuePayload {
  targetId: string;
  originalFileId: string;
  profile: PhotoProfile;
  profileKey: PhotoKey;
}
