import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { appClient } from '@/client'
import type { LoginTrackerDto, TrackerEnum } from '@/client/app-client'

export const getTrackers = queryOptions({
  queryKey: ['trackers'],
  queryFn: async () => {
    const trackers = await appClient.trackers.trackersControllerTrackers()
    return trackers
  },
})

export function useLoginTracker() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: LoginTrackerDto) => {
      await appClient.trackers.trackersControllerLoginTracker(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getTrackers.queryKey })
    },
  })
}

export function useDeleteTracker() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tracker: TrackerEnum) => {
      await appClient.trackers.trackersControllerDeleteTracker(tracker)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getTrackers.queryKey })
    },
  })
}
