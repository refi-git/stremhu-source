import { createFileRoute } from '@tanstack/react-router'

import { Settings } from '../-components/settings'

export const Route = createFileRoute('/_protected/settings/system/')({
  component: SystemRoute,
})

function SystemRoute() {
  return (
    <div className="flex flex-col gap-6">
      <Settings />
    </div>
  )
}
