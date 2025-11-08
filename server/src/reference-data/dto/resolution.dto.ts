import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { ResolutionEnum } from 'src/common/enums/resolution.enum';

export class ResolutionDto {
  @IsEnum(ResolutionEnum)
  @ApiProperty({ enum: ResolutionEnum, enumName: 'ResolutionEnum' })
  value: ResolutionEnum;

  @IsString()
  @ApiProperty()
  label: string;
}
