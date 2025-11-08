import { Resolution } from '@ctrl/video-filename-parser';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

import { LanguageEnum } from 'src/common/enums/language.enum';

export class UpdateMePreferencesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(Resolution, { each: true })
  @ApiProperty({ enum: Resolution, enumName: 'ResolutionEnum', isArray: true })
  torrentResolutions: Resolution[];

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(LanguageEnum, { each: true })
  @ApiProperty({ enum: LanguageEnum, enumName: 'LanguageEnum', isArray: true })
  torrentLanguages: LanguageEnum[];

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', nullable: true })
  torrentSeed: number | null;
}
