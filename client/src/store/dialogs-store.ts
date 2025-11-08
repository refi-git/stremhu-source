import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import type { TrackerEnum, UserDto } from '@/client/app-client'

export enum DialogEnum {
  ADD_TRACKER = 'add-tracker',
  CHANGE_USERNAME_DIALOG = 'change-username-dialog',
  CHANGE_PASSWORD_DIALOG = 'change-password-dialog',
  ADD_USER = 'add-user',
}

type AddTrackerDialogOptions = {
  activeTrackers: Array<TrackerEnum>
}

type AddTrackerDialog = {
  dialog: DialogEnum.ADD_TRACKER
  options: AddTrackerDialogOptions
}

type UserDialogOption = {
  user?: UserDto
}

type ChangeUsernameDialog = {
  dialog: DialogEnum.CHANGE_USERNAME_DIALOG
  options?: UserDialogOption
}

type ChangePasswordDialog = {
  dialog: DialogEnum.CHANGE_PASSWORD_DIALOG
  options?: UserDialogOption
}

type AddUser = {
  dialog: DialogEnum.ADD_USER
}

type DialogOptions =
  | AddTrackerDialog
  | ChangeUsernameDialog
  | ChangePasswordDialog
  | AddUser

export type ConfirmOptions = {
  title: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
}

type Resolver = (ok: boolean) => void

type ConfirmState = {
  open: boolean
  options: DialogOptions | null
  resolve: Resolver
  // actions
  handleOpen: (options: DialogOptions) => Promise<boolean>
  handleClose: () => void
  handleConfirm: () => void
  handleCancel: () => void
}

export const useDialogsStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  confirming: false,
  resolve: () => {},
  handleOpen: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve })
    }),
  handleClose: () => {
    set({ open: false })

    setTimeout(() => {
      set({ options: null, resolve: undefined })
    }, 500)
  },
  handleConfirm: () => {
    const { resolve } = get()

    resolve(true)

    set({ open: false })

    setTimeout(() => {
      set({ options: null, resolve: undefined })
    }, 500)
  },
  handleCancel: () => {
    const { resolve } = get()

    resolve(false)

    set({ open: false })

    setTimeout(() => {
      set({ options: null, resolve: undefined })
    }, 500)
  },
}))

export function useDialogs() {
  return useDialogsStore(
    useShallow((store) => ({
      handleOpen: store.handleOpen,
      handleClose: store.handleClose,
    })),
  )
}
