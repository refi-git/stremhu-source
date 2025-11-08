import { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';

export async function safeReaddir(dir: string): Promise<Dirent[]> {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}
