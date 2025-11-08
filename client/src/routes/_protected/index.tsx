import { createFileRoute } from '@tanstack/react-router'

import { LoginAndSecurity } from './-components/login-and-security'
import { MeConfig } from './-components/me-config'
import { TorrentsPreferences } from './-components/torrents-preferences'

export const Route = createFileRoute('/_protected/')({
  component: ProfileRoute,
})

function ProfileRoute() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-medium tracking-tight">Fiókom</h2>
      <div className="columns-1 md:columns-2 gap-4">
        <div className="break-inside-avoid mb-4">
          <LoginAndSecurity />
        </div>
        <div className="break-inside-avoid mb-4">
          <MeConfig />
        </div>
        <div className="break-inside-avoid mb-4">
          <TorrentsPreferences />
        </div>
      </div>
    </div>
  )
}
