import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { appClient } from '@/client'
import type { UpdateSettingDto } from '@/client/app-client'

import { getReferenceData } from './reference-data'

export const getSettings = queryOptions({
  queryKey: ['settings'],
  queryFn: async () => {
    const setting = await appClient.settings.settingsControllerFindOne()
    let uploadLimit: string | null = null

    if (setting.uploadLimit !== -1) {
      uploadLimit = `${setting.uploadLimit / 125_000}`
    }

    return { ...setting, uploadLimit }
  },
})

export function useUpdateSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateSettingDto) => {
      let uploadLimit: number | undefined

      if (payload.uploadLimit !== undefined) {
        uploadLimit = -1

        if (payload.uploadLimit !== -1) {
          uploadLimit = payload.uploadLimit * 125_000
        }
      }

      const setting = await appClient.settings.settingsControllerUpdate({
        ...payload,
        uploadLimit,
      })
      return setting
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated)
      queryClient.invalidateQueries({ queryKey: getReferenceData.queryKey })
    },
  })
}
