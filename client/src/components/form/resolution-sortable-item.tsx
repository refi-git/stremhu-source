import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoveVerticalIcon, TrashIcon } from 'lucide-react'

import type { ResolutionEnum } from '@/client/app-client'
import { useReferenceDataOptionLabel } from '@/hooks/use-reference-data-option-label'

import { Button } from '../ui/button'
import { Label } from '../ui/label'

interface SortableItemProps {
  resolution: ResolutionEnum
  isDisabled: boolean
  onDelete: (resolution: ResolutionEnum) => void
}

export function SortableItem(props: SortableItemProps) {
  const { resolution, isDisabled, onDelete } = props

  const { getResolutionLabel } = useReferenceDataOptionLabel()

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: resolution })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex justify-between">
      <div key={resolution} className="flex items-center space-x-4">
        <Button
          size="icon"
          className="rounded-full size-6"
          {...attributes}
          {...listeners}
        >
          <MoveVerticalIcon />
        </Button>
        <Label htmlFor={resolution}>{getResolutionLabel(resolution)}</Label>
      </div>
      <Button
        variant="destructive"
        size="icon"
        className="rounded-full size-6"
        disabled={isDisabled}
        onClick={() => onDelete(resolution)}
      >
        <TrashIcon />
      </Button>
    </div>
  )
}
