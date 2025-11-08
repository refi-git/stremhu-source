import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

import { LanguageDto } from './language.dto';
import { ResolutionDto } from './resolution.dto';
import { TrackerDto } from './tracker.dto';
import { UserRoleDto } from './user-role.dto';

export class ReferenceDataDto {
  @IsArray()
  @ApiProperty({ type: UserRoleDto, isArray: true })
  userRoles: UserRoleDto[];

  @IsArray()
  @ApiProperty({ type: ResolutionDto, isArray: true })
  resolutions: ResolutionDto[];

  @IsArray()
  @ApiProperty({ type: LanguageDto, isArray: true })
  languages: LanguageDto[];

  @IsArray()
  @ApiProperty({ type: TrackerDto, isArray: true })
  trackers: TrackerDto[];

  @IsString()
  @ApiProperty()
  endpoint: string;
}
