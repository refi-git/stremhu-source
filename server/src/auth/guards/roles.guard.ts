import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

import { UserRoleEnum } from 'src/users/enums/user-role.enum';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const { user } = req;

    if (!user) {
      throw new ForbiddenException('Nincs jogosultság');
    }

    if (!required.includes(user.userRole)) {
      throw new ForbiddenException('Nincs megfelelő szerepkör');
    }

    return true;
  }
}
