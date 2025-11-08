import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users/users.module';

import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  imports: [UsersModule],
  providers: [SetupService],
  controllers: [SetupController],
  exports: [],
})
export class SetupModule {}
