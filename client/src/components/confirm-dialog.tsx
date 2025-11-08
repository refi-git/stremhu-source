import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

export function ConfirmDialog() {
  const { open, options, isConfirming, handleCancel, handleConfirm } =
    useConfirmDialogStore()

  const {
    title,
    description,
    confirmText = 'Megerősítés',
    cancelText = 'Mégsem',
  } = options ?? {}

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isConfirming}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
