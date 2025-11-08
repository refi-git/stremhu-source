import { Item, ItemContent, ItemMedia, ItemTitle } from './ui/item'
import { Spinner } from './ui/spinner'

export function DefaultLoading() {
  return (
    <div className="flex justify-center py-4">
      <Item variant="muted" className="rounded-4xl">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1 pr-2">
            Komponensek betöltése
          </ItemTitle>
        </ItemContent>
      </Item>
    </div>
  )
}
