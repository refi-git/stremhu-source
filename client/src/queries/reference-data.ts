import { queryOptions } from '@tanstack/react-query'

import { appClient } from '@/client'
import type {
  LanguageEnum,
  ResolutionEnum,
  TrackerEnum,
  UserRoleEnum,
} from '@/client/app-client'

export const getReferenceData = queryOptions({
  queryKey: ['reference-data'],
  staleTime: Infinity,
  gcTime: Infinity,
  queryFn: async () => {
    const referenceData =
      await appClient.referenceData.referenceDataControllerReferenceData()

    const userRoleLabelMap = referenceData.userRoles.reduce(
      (previousValue, value) => ({
        ...previousValue,
        [value.value]: value.label,
      }),
      {} as Record<UserRoleEnum, string>,
    )

    const resolutionLabelMap = referenceData.resolutions.reduce(
      (previousValue, value) => ({
        ...previousValue,
        [value.value]: value.label,
      }),
      {} as Record<ResolutionEnum, string>,
    )

    const languageLabelMap = referenceData.languages.reduce(
      (previousValue, value) => ({
        ...previousValue,
        [value.value]: value.label,
      }),
      {} as Record<LanguageEnum, string>,
    )

    const trackerLabelMap = referenceData.trackers.reduce(
      (previousValue, value) => ({
        ...previousValue,
        [value.value]: value.label,
      }),
      {} as Record<TrackerEnum, string>,
    )

    const { endpoint, ...rest } = referenceData

    return {
      option: rest,
      labelMap: {
        userRole: userRoleLabelMap,
        resolution: resolutionLabelMap,
        language: languageLabelMap,
        tracker: trackerLabelMap,
      },
      endpoint: endpoint,
    }
  },
})
