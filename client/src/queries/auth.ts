import { useMutation, useQueryClient } from '@tanstack/react-query'

import { appClient } from '@/client'
import type { AuthLoginDto, CreateSetupDto } from '@/client/app-client'

import { getSettingsSetupStatus } from './settings-setup'

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AuthLoginDto) => {
      const me = await appClient.authentication.authControllerLogin(payload)
      return me
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await appClient.authentication.authControllerLogout()
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateSetupDto) => {
      await appClient.settingsSetup.setupControllerCreate(payload)
    },
    onSuccess: () => {
      queryClient.setQueryData(getSettingsSetupStatus.queryKey, {
        configured: true,
      })
    },
  })
}
