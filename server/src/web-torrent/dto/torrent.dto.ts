import { ApiProperty } from '@nestjs/swagger';

export class TorrentDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  uploadSpeed: string;

  @ApiProperty()
  progress: string;

  @ApiProperty()
  downloaded: string;

  @ApiProperty()
  uploaded: string;

  @ApiProperty()
  total: string;

  @ApiProperty()
  infoHash: string;
}
