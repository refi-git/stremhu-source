import { TrackerEnum } from '../enums/tracker.enum';

export interface TrackerCredentialToCreate {
  tracker: TrackerEnum;
  username: string;
  password: string;
}
