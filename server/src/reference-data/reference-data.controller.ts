import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import {
  LANGUAGE_OPTIONS,
  RESOLUTION_OPTIONS,
  USER_ROLE_OPTIONS,
} from 'src/common/common.constant';
import { SettingsStore } from 'src/settings/core/settings.store';
import { TRACKER_OPTIONS } from 'src/trackers/trackers.constants';

import { ReferenceDataDto } from './dto/reference-data.dto';

@Controller('/reference-data')
export class ReferenceDataController {
  constructor(private settingsStore: SettingsStore) {}

  @Get('/')
  @ApiResponse({ status: 200, type: ReferenceDataDto })
  async referenceData(): Promise<ReferenceDataDto> {
    const setting = await this.settingsStore.findOneOrThrow();

    return {
      userRoles: USER_ROLE_OPTIONS,
      resolutions: RESOLUTION_OPTIONS,
      languages: LANGUAGE_OPTIONS,
      trackers: TRACKER_OPTIONS,
      endpoint: setting.endpoint,
    };
  }
}
