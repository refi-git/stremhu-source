import { QueryClient } from '@tanstack/react-query'

import { AppClient } from './app-client'

export const appClient = new AppClient({
  WITH_CREDENTIALS: true,
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})
