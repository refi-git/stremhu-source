import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { SortableContext } from '@dnd-kit/sortable'
import { useQuery } from '@tanstack/react-query'

import type { LanguageEnum } from '@/client/app-client'
import { useReferenceDataOptionLabel } from '@/hooks/use-reference-data-option-label'
import { cn } from '@/lib/utils'
import { getReferenceData } from '@/queries/reference-data'

import { SelectorItem } from '../selector-item'
import { SortableSelectorItem } from '../sortable-selector-item'
import { Separator } from '../ui/separator'

type LanguagesSelectorProps = {
  items: Array<LanguageEnum>
  onAdd: (item: LanguageEnum) => void
  onDelete: (item: LanguageEnum) => void
  onSortableDragEnd: (event: DragEndEvent) => void
} & React.ComponentProps<'div'>

export function LanguagesSelector(props: LanguagesSelectorProps) {
  const { items, onAdd, onDelete, onSortableDragEnd, className, ...rest } =
    props

  const { data: referenceData } = useQuery(getReferenceData)
  if (!referenceData) throw new Error(`Nincs "referenceData" a cache-ben`)

  const { getLanguageLabel } = useReferenceDataOptionLabel()

  const inactiveItems = referenceData.option.languages.filter(
    (resolution) => !items.includes(resolution.value),
  )
  const hasInactiveItem = inactiveItems.length > 0

  return (
    <div className={cn('grid gap-3', className)} {...rest}>
      <DndContext
        onDragEnd={onSortableDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={items}>
          {items.map((item) => (
            <SortableSelectorItem
              key={item}
              item={item}
              label={getLanguageLabel(item)}
              isDisabled={items.length === 1}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
      {hasInactiveItem && (
        <>
          <Separator />
          {inactiveItems.map((item) => (
            <SelectorItem label={item.label} value={item.value} onAdd={onAdd} />
          ))}
        </>
      )}
    </div>
  )
}
