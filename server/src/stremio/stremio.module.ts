import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { SettingsCoreModule } from 'src/settings/core/settings-core.module';
import { UsersModule } from 'src/users/users.module';

import { StremioStreamModule } from './stream/stream.module';
import { StremioController } from './stremio.controller';
import { StremioService } from './stremio.service';

@Module({
  imports: [AuthModule, UsersModule, StremioStreamModule, SettingsCoreModule],
  controllers: [StremioController],
  providers: [StremioService],
  exports: [],
})
export class StremioModule {}
