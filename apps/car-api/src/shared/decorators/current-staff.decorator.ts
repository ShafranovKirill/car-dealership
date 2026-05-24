import { AccessStaffTokenPayload } from '@car/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentStaff = createParamDecorator(
  (key: keyof AccessStaffTokenPayload, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    return req.staff?.[key];
  },
);
