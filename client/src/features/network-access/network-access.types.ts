export type NetworkAccessDialog = {
  type: 'NETWORK_ACCESS'
}

export type NetworkAccessDefaultValues = {
  enebledlocalIp: boolean
  address: string
}

export type ConnectionType = 'idle' | 'pending' | 'success' | 'error'
