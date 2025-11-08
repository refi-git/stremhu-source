import { useQuery } from '@tanstack/react-query'

import type {
  LanguageEnum,
  ResolutionEnum,
  TrackerEnum,
  UserRoleEnum,
} from '@/client/app-client'
import { getReferenceData } from '@/queries/reference-data'

export function useReferenceDataOptionLabel() {
  const { data: referenceData } = useQuery(getReferenceData)
  if (!referenceData) throw new Error(`Nincs "reference-data" a cache-ben`)

  const {
    labelMap: { language, resolution, tracker, userRole },
  } = referenceData

  const getUserRoleLabel = (userRoleEnum: UserRoleEnum) => {
    return userRole[userRoleEnum]
  }

  const getLanguageLabel = (languageEnum: LanguageEnum) => {
    return language[languageEnum]
  }

  const getResolutionLabel = (resolutionEnum: ResolutionEnum) => {
    return resolution[resolutionEnum]
  }

  const getTrackerLabel = (trackerEnum: TrackerEnum) => {
    return tracker[trackerEnum]
  }

  return {
    getUserRoleLabel,
    getLanguageLabel,
    getResolutionLabel,
    getTrackerLabel,
  }
}
