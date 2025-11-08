import { Injectable, NotFoundException } from '@nestjs/common';
import { verify } from '@node-rs/argon2';

import { UsersService } from 'src/users/users.service';

import { USER_NOT_FOUND } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validate(username: string, password: string) {
    const user = await this.usersService.findOne((qb) =>
      qb.where('username = :username', { username }),
    );

    if (!user || !user.passwordHash) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    const validated = await verify(user.passwordHash, password);

    if (!validated) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }
}
