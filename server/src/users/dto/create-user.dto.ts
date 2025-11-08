import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'A jelszó nem lehet üres' })
  @ApiProperty({ type: String, nullable: true })
  password: string | null;
}
