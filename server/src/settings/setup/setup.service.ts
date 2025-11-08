import { HttpException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { UserRoleEnum } from 'src/users/enums/user-role.enum';
import { UsersService } from 'src/users/users.service';

import { CreateSetupDto } from './dto/create-setup.dto';

@Injectable()
export class SetupService {
  constructor(private usersService: UsersService) {}

  async create(payload: CreateSetupDto, manager?: EntityManager) {
    const users = await this.usersService.find();

    if (users.length > 0) {
      throw new HttpException('Szerver már kofigurálva van', 410);
    }

    const user = await this.usersService.create(
      {
        ...payload,
        userRole: UserRoleEnum.ADMIN,
      },
      manager,
    );

    return user;
  }

  async status(): Promise<boolean> {
    const users = await this.usersService.find();
    return users.length > 0;
  }
}
