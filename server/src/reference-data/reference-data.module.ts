import { Module } from '@nestjs/common';

import { SettingsCoreModule } from 'src/settings/core/settings-core.module';

import { ReferenceDataController } from './reference-data.controller';

@Module({
  imports: [SettingsCoreModule],
  controllers: [ReferenceDataController],
})
export class ReferenceDataModule {}
