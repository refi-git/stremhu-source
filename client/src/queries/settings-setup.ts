import { queryOptions } from '@tanstack/react-query'

import { appClient } from '@/client'

export const getSettingsSetupStatus = queryOptions({
  queryKey: ['setup-status'],
  staleTime: Infinity,
  gcTime: Infinity,
  queryFn: async () => {
    const setupStatus = await appClient.settingsSetup.setupControllerStatus()
    return setupStatus
  },
})
