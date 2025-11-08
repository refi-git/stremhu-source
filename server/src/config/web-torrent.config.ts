import { registerAs } from '@nestjs/config';
import _ from 'lodash';
import { join } from 'node:path';
import { z } from 'zod';

import { WebTorrentConfig } from './interfaces/web-torrent.interface';
import ZodUtil, { ZodConfig } from './utils/zod-util';

export default registerAs('web-torrent', () => {
  const webTorrentPort =
    process.env.WEB_TORRENT_PORT && _.parseInt(process.env.WEB_TORRENT_PORT);

  const configs: ZodConfig<WebTorrentConfig> = {
    port: {
      value: webTorrentPort || 6881,
      zod: z.number(),
    },
    'downloads-dir': {
      value: join(process.cwd(), '../data/downloads'),
      zod: z.string().trim().nonempty(),
    },
    'torrents-dir': {
      value: join(process.cwd(), '../data/torrents'),
      zod: z.string().trim().nonempty(),
    },
  };

  return ZodUtil.validate<WebTorrentConfig>(configs);
});
