import { Module, forwardRef } from '@nestjs/common';

import { UsersModule } from '../users.module';
import { UsersMeController } from './users-me.controller';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [UsersMeController],
})
export class UsersMeModule {}
