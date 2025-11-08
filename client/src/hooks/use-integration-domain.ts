import { useQuery } from '@tanstack/react-query'

import { getReferenceData } from '@/queries/reference-data'

interface UseIntegrationDomainProps {
  stremioToken: string
}

export function useIntegrationDomain(props: UseIntegrationDomainProps) {
  const { stremioToken } = props

  const { data: referenceData } = useQuery(getReferenceData)
  if (!referenceData) throw new Error(`Nincs "reference-data" a cache-ben`)

  const endpointHost = new URL(referenceData.endpoint).host
  const endpoint = `${endpointHost}/api/${stremioToken}/manifest.json`

  const appEndpoint = `stremio://${endpoint}`
  const urlEndpoint = `https://${endpoint}`
  const webEndpoint = `https://web.stremio.com/#/addons?addon=${urlEndpoint}`

  return {
    appEndpoint,
    webEndpoint,
    urlEndpoint,
  }
}
