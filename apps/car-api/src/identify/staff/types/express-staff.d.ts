import { AccessStaffTokenPayload } from '@car/types';

declare global {
  namespace Express {
    interface Request {
      staff: AccessStaffTokenPayload;
    }
  }
}
