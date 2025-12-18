import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Torrent } from 'src/torrents/entity/torrent.entity';
import { User } from 'src/users/entity/user.entity';

@Entity('stream_sessions')
export class StreamSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Torrent, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'torrent_info_hash',
  })
  torrent: Torrent;

  @Column({ name: 'torrent_info_hash' })
  torrentInfoHash: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
