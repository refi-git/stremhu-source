import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: join(process.cwd(), '../data/database/app.db'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/@migrations/*.ts'],
  synchronize: false,
});
