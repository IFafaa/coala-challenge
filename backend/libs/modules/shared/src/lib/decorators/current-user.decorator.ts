import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtValidatedUser } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtValidatedUser => {
    const user = ctx
      .switchToHttp()
      .getRequest<{ user?: JwtValidatedUser }>().user;
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  },
);
