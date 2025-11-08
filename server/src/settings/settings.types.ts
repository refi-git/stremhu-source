export interface SettingToCreate {
  id: string;
  enebledlocalIp: boolean;
  endpoint: string;
  uploadLimit: number;
  hitAndRun: boolean;
  cacheRetention: string | null;
}

export interface SettingToUpdate {
  enebledlocalIp?: boolean;
  endpoint?: string;
  uploadLimit?: number;
  hitAndRun?: boolean;
  cacheRetention?: string | null;
}
