import { create } from 'zustand'

export type ConfirmOptions = {
  title: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => Promise<void>
}

type Resolver = (ok: boolean) => void

type ConfirmState = {
  open: boolean
  options: ConfirmOptions | null
  isConfirming: boolean
  resolve: Resolver
  // actions
  confirm: (options: ConfirmOptions) => Promise<boolean>
  close: () => void
  handleConfirm: () => void
  handleCancel: () => void
}

export const useConfirmDialogStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  isConfirming: false,
  resolve: () => {},
  confirm: (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve, isConfirming: false })
    }),
  close: () => set({ open: false }),
  handleConfirm: async () => {
    const { resolve, options } = get()
    const action = options?.onConfirm

    if (action) {
      set({ isConfirming: true })
      try {
        await action()
      } catch (error) {
        return set({ isConfirming: false })
      }
    }

    resolve(true)

    set({ open: false })
    set({ options: null, resolve: undefined, isConfirming: false })
  },
  handleCancel: () => {
    const { resolve } = get()
    resolve(false)

    set({ open: false })
    set({ options: null, resolve: undefined, isConfirming: false })
  },
}))

export function useConfirmDialog() {
  return useConfirmDialogStore((store) => store.confirm)
}
