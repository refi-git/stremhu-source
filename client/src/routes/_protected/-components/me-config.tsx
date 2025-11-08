import { useQuery } from '@tanstack/react-query'
import {
  AppWindowIcon,
  LinkIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwKeyIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { parseApiError } from '@/common/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useIntegrationDomain } from '@/hooks/use-integration-domain'
import { getMe, useChangeMeStremioToken } from '@/queries/me'
import { useConfirmDialog } from '@/store/confirm-dialog-store'

export function MeConfig() {
  const confirmDialog = useConfirmDialog()
  const { mutateAsync: changeStremioToken } = useChangeMeStremioToken()

  const { data: me } = useQuery(getMe)
  if (!me) throw new Error(`Nincs "me" a cache-ben`)

  const { appEndpoint, webEndpoint, urlEndpoint } = useIntegrationDomain({
    stremioToken: me.stremioToken,
  })

  const handleChangeToken = async () => {
    await confirmDialog({
      title: 'Biztos generálsz új Stremio kulcsot?',
      description:
        'A Stremio kulcs generálása után az addont újra kell telepítened.',
      onConfirm: async () => {
        try {
          await changeStremioToken()
          toast.success('Új Stremio kulcs generálása elkészült.')
        } catch (error) {
          const message = parseApiError(error)
          toast.error(message)
          throw error
        }
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stremio integráció</CardTitle>
        <CardDescription>
          Az addon használatához telepítened kell az addont Stremio fiókodba
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Item variant="default" className="p-0">
          <ItemMedia variant="icon">
            <AppWindowIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Telepítés a Stremio appban</ItemTitle>
            <ItemDescription>
              Megnyitja a Stremio alkalmazást és hozzáadja az addont.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="icon-sm"
              variant="default"
              className="rounded-full"
              asChild
            >
              <a href={appEndpoint} target="_blank">
                <PlusIcon />
              </a>
            </Button>
          </ItemActions>
        </Item>
        <Item variant="default" className="p-0">
          <ItemMedia variant="icon">
            <LinkIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Megnyitás a Stremio weben</ItemTitle>
            <ItemDescription>
              A Stremio weboldalán jóváhagyással telepítheted az addont.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="icon-sm"
              variant="default"
              className="rounded-full"
              asChild
            >
              <a href={webEndpoint} target="_blank">
                <PlusIcon />
              </a>
            </Button>
          </ItemActions>
        </Item>
        <Item variant="default" className="p-0">
          <ItemMedia variant="icon">
            <PlayIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Új Stremio kulcs generálása</ItemTitle>
            <ItemDescription>
              A régi kulcs törlésre kerül, így az addont újra kell telepíteni!
            </ItemDescription>
          </ItemContent>
          <ItemActions onClick={handleChangeToken}>
            <Button
              size="icon-sm"
              variant="destructive"
              className="rounded-full"
            >
              <RotateCcwKeyIcon />
            </Button>
          </ItemActions>
        </Item>
        <div className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="link"
                className="text-sm font-mono tracking-tight"
              >
                Addon manuális telepítése
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[380px] grid gap-4">
              <p className="text-muted-foreground text-sm">
                Másold ki az URL-t és add hozzá a Stremio alkalmazáshoz a
                "Bővítmények" menüpontban.
              </p>
              <Input value={urlEndpoint} className="w-full" />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}
