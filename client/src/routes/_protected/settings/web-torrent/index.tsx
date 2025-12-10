import { createFileRoute } from '@tanstack/react-router'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'

import { Torrents } from '../-components/torrents'
import { DownloadSpeed } from './-features/download-speed'
import { UploadSpeed } from './-features/upload-speed'

export const Route = createFileRoute('/_protected/settings/web-torrent/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 gap-4">
        <DownloadSpeed />
        <UploadSpeed />
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Aktív torrentek</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <Torrents />
        </CardContent>
      </Card>
    </div>
  )
}
