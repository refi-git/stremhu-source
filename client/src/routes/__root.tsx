import {
  Outlet,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { DialogsRoot } from '@/components/dialogs-root'
import type { RouterContext } from '@/main'
import { getReferenceData } from '@/queries/reference-data'
import { getSettingsSetupStatus } from '@/queries/settings-setup'

import { AppLayout } from './-components/layouts/app-layout'

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context, location }) => {
    const { queryClient } = context
    await queryClient.ensureQueryData(getReferenceData)

    const { configured } = await queryClient.ensureQueryData(
      getSettingsSetupStatus,
    )

    const onSetup = location.pathname.startsWith('/setup')

    if (!configured && !onSetup) {
      throw redirect({ to: '/setup' })
    }

    if (configured && onSetup) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
      <ConfirmDialog />
      <DialogsRoot />
      <Toaster position="top-center" />
    </AppLayout>
  ),
})
