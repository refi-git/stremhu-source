import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TrackerEnum } from 'src/trackers/enum/tracker.enum';

@Entity('tracker_credentials')
export class TrackerCredential {
  @PrimaryColumn({ type: 'simple-enum', enum: TrackerEnum })
  tracker!: TrackerEnum;

  @Column({ type: 'text' })
  username!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ name: 'hit_and_run', type: 'boolean', default: false })
  hitAndRun!: boolean;

  @Column({ name: 'download_full_torrent', type: 'boolean', default: false })
  downloadFullTorrent!: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
