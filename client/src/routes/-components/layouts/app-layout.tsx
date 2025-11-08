import type { ReactNode } from 'react'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-3xl">
      <div className="p-4">{children}</div>
    </div>
  )
}
