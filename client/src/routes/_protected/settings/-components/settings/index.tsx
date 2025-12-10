import { NetworkAccessInfo } from './network-access-info'
import { StremhuCatalogInfo } from './stremhu-catalog-info'
import { Trackers } from './trackers'

export function Settings() {
  return (
    <div className="columns-1 md:columns-2 gap-4">
      <div className="break-inside-avoid mb-4">
        <Trackers />
      </div>
      <div className="break-inside-avoid mb-4">
        <NetworkAccessInfo />
      </div>
      <div className="break-inside-avoid mb-4">
        <StremhuCatalogInfo />
      </div>
    </div>
  )
}
