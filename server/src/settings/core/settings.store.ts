import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUndefined, omitBy } from 'lodash';
import { EntityManager, Repository } from 'typeorm';

import { GLOBAL_ID } from 'src/common/common.constant';

import { Setting } from '../entities/setting.entity';
import { SettingToCreate, SettingToUpdate } from '../settings.types';

@Injectable()
export class SettingsStore {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  protected getRepository(manager?: EntityManager): Repository<Setting> {
    return manager ? manager.getRepository(Setting) : this.settingRepository;
  }

  async create(payload: SettingToCreate): Promise<Setting> {
    const settingEntity = this.settingRepository.create(payload);
    const setting = await this.settingRepository.save(settingEntity);

    return setting;
  }

  async findOne(): Promise<Setting | null> {
    const setting = await this.settingRepository.findOne({
      where: { id: GLOBAL_ID },
    });

    return setting;
  }

  async findOneOrThrow(): Promise<Setting> {
    const setting = await this.findOne();

    if (!setting) {
      throw new InternalServerErrorException('A beállítások nem érhetők el');
    }

    return setting;
  }

  async update(
    payload: SettingToUpdate,
    manager?: EntityManager,
  ): Promise<Setting> {
    const repository = this.getRepository(manager);

    const setting = await this.findOneOrThrow();

    const updateData = omitBy(payload, isUndefined);

    await repository.update({ id: GLOBAL_ID }, updateData);

    return { ...setting, ...updateData };
  }
}
