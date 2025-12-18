import {
  BadRequestException,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

import { SettingsStore } from 'src/settings/core/settings.store';
import { TorrentsService } from 'src/torrents/torrents.service';

import { BithumenAdapter } from './adapters/bithumen/bithumen.adapter';
import { MajomparadeAdapter } from './adapters/majomparade/majomparade.adapter';
import { NcoreAdapter } from './adapters/ncore/ncore.adapter';
import { TrackerCredentialsService } from './credentials/tracker-credentials.service';
import { TrackerEnum } from './enum/tracker.enum';
import { TrackerAdapter } from './tracker.types';

@Injectable()
export class TrackerMaintenanceService implements OnApplicationBootstrap {
  private readonly adapters: TrackerAdapter[];

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    ncoreAdapter: NcoreAdapter,
    bithumenAdapter: BithumenAdapter,
    majomparadeAdapter: MajomparadeAdapter,
    private trackerCredentialsService: TrackerCredentialsService,
    private torrentsService: TorrentsService,
    private settingsStore: SettingsStore,
  ) {
    this.adapters = [ncoreAdapter, bithumenAdapter, majomparadeAdapter];
  }

  async onApplicationBootstrap() {
    const setting = await this.settingsStore.findOneOrThrow();
    const job = this.schedulerRegistry.getCronJob('cleanupTorrents');

    if (!setting.hitAndRun) {
      await job.stop();
    }
  }

  async setHitAndRunCron(enabled: boolean): Promise<void> {
    const job = this.schedulerRegistry.getCronJob('cleanupTorrents');

    if (enabled && !job.isActive) {
      job.start();
    }

    if (!enabled && job.isActive) {
      await job.stop();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM, { name: 'cleanupTorrents' })
  async cleanupHitAndRun(): Promise<void> {
    const credentials = await this.trackerCredentialsService.find();
    await Promise.all(
      credentials.map((credential) => {
        const adapter = this.getAdapter(credential.tracker);
        return this.cleanupHitAndRunTracker(adapter);
      }),
    );
  }

  private async cleanupHitAndRunTracker(adapter: TrackerAdapter) {
    const seedReqTorrentIds = await adapter.seedRequirement();
    await this.torrentsService.purgeTrackerExcept(
      adapter.tracker,
      seedReqTorrentIds,
    );
  }

  private getAdapter(tracker: TrackerEnum): TrackerAdapter {
    const adapter = this.adapters.find((a) => a.tracker === tracker);
    if (!adapter) {
      throw new BadRequestException(`Nem regisztrált tracker: ${tracker}`);
    }
    return adapter;
  }
}
