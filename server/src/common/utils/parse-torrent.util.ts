import type { Instance } from 'parse-torrent';

export type ParsedTorrent = Instance;
export type ParsedFile = NonNullable<ParsedTorrent['files']>[number];

export async function parseTorrent(buffer: Uint8Array): Promise<ParsedTorrent> {
  const { default: pT } = await import('parse-torrent');
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const parsedTorrent = await pT(buffer);
  return parsedTorrent;
}

export async function toTorrentFile(
  parsedTorrent: ParsedTorrent,
): Promise<Buffer<ArrayBufferLike>> {
  const { toTorrentFile: toFile } = await import('parse-torrent');
  return toFile(parsedTorrent);
}
