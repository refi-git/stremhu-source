import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { appClient } from '@/client'

export function torrentsOptions() {
  return queryOptions({
    queryKey: ['torrents'],
    refetchInterval: 5000,
    queryFn: async () => {
      const torrents = await appClient.webTorrent.webTorrentControllerFind()

      return torrents
    },
  })
}

export function useDeleteTorrent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (infoHash: string) => {
      await appClient.webTorrent.webTorrentControllerDelete(infoHash)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['torrents'] })
    },
  })
}
