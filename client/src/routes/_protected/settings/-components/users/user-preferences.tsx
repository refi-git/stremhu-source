import { DndContext } from '@dnd-kit/core'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { SortableContext } from '@dnd-kit/sortable'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import type { ResolutionEnum, UserDto } from '@/client/app-client'
import { LanguageEnum } from '@/client/app-client'
import { SEED_OPTIONS } from '@/common/constrants'
import { userPreferencesSchema } from '@/common/schemas'
import { parseApiError } from '@/common/utils'
import { SortableItem } from '@/components/form/resolution-sortable-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemContent, ItemTitle } from '@/components/ui/item'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { getReferenceData } from '@/queries/reference-data'
import { useUpdateProfile } from '@/queries/users'

interface UserPreferencesProps {
  user: UserDto
}

export function UserPreferences(props: UserPreferencesProps) {
  const { user } = props

  const { data: referenceData } = useQuery(getReferenceData)
  if (!referenceData) throw new Error(`Nincs "referenceData" a cache-ben`)

  const { mutateAsync: updateProfile } = useUpdateProfile()

  const form = useForm({
    defaultValues: {
      torrentLanguages: user.torrentLanguages,
      torrentResolutions: user.torrentResolutions,
      torrentSeed: user.torrentSeed,
    },
    validators: {
      onChange: userPreferencesSchema,
    },
    listeners: {
      onChangeDebounceMs: 2000,
      onChange: ({ formApi }) => {
        if (formApi.state.isValid) {
          formApi.handleSubmit()
        }
      },
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await updateProfile({ userId: user.id, payload: value })
        toast.success('Módosítások elmentve')
      } catch (error) {
        formApi.reset()
        const message = parseApiError(error)
        toast.error(message)
      }
    },
  })

  return (
    <Card className="break-inside-avoid mb-4">
      <CardHeader>
        <CardTitle>Preferenciák</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Item variant="default" className="p-0">
          <ItemContent>
            <ItemTitle>Filmek, sorozatok nyelve</ItemTitle>
            <form.Field name="torrentLanguages" mode="array">
              {(field) => (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {referenceData.option.languages.map((language) => {
                    const checked = field.state.value.includes(language.value)
                    const isDisabled = field.state.value.length === 1 && checked
                    return (
                      <div
                        key={language.value}
                        className="flex items-center space-x-2"
                      >
                        <Switch
                          id={language.value}
                          checked={checked}
                          disabled={
                            isDisabled || language.value === LanguageEnum.HU
                          }
                          onCheckedChange={(check) => {
                            if (check) {
                              field.pushValue(language.value)
                            } else {
                              const index = field.state.value.findIndex(
                                (value) => value === language.value,
                              )
                              field.removeValue(index)
                            }
                          }}
                        />
                        <Label htmlFor={language.value}>{language.label}</Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </form.Field>
          </ItemContent>
        </Item>
        <form.Field name="torrentResolutions" mode="array">
          {(field) => {
            const inactiveResolutions = referenceData.option.resolutions.filter(
              (resolution) => !field.state.value.includes(resolution.value),
            )
            const hasInactiveResolution = inactiveResolutions.length > 0

            return (
              <>
                <Item variant="default" className="p-0">
                  <ItemContent>
                    <ItemTitle>Filmek, sorozatok minősége</ItemTitle>
                    <div className="grid gap-3 mt-2">
                      <DndContext
                        onDragEnd={(event) => {
                          console.log(event)
                          const { active, over } = event

                          if (!over || active.id === over.id) return
                          const oldIndex = field.state.value.indexOf(
                            active.id as ResolutionEnum,
                          )
                          const newIndex = field.state.value.indexOf(
                            over.id as ResolutionEnum,
                          )
                          if (oldIndex < 0 || newIndex < 0) return
                          field.moveValue(oldIndex, newIndex)
                        }}
                        modifiers={[
                          restrictToVerticalAxis,
                          restrictToWindowEdges,
                        ]}
                      >
                        <SortableContext items={field.state.value}>
                          {field.state.value.map((resolution) => (
                            <SortableItem
                              key={resolution}
                              resolution={resolution}
                              isDisabled={field.state.value.length === 1}
                              onDelete={() => {
                                const index = field.state.value.findIndex(
                                  (value) => value === resolution,
                                )
                                field.removeValue(index)
                              }}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </ItemContent>
                </Item>
                {hasInactiveResolution && (
                  <Item variant="default" className="p-0">
                    <ItemContent>
                      <ItemTitle>Inaktív felbontások</ItemTitle>
                      <div className="grid gap-3 mt-2">
                        {inactiveResolutions.map((inactiveResolution) => (
                          <div
                            key={inactiveResolution.value}
                            className="flex justify-between"
                          >
                            <Label htmlFor={inactiveResolution.value}>
                              {inactiveResolution.label}
                            </Label>
                            <Button
                              size="icon"
                              className="rounded-full size-6"
                              onClick={() => {
                                field.pushValue(inactiveResolution.value)
                              }}
                            >
                              <PlusIcon />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ItemContent>
                  </Item>
                )}
              </>
            )
          }}
        </form.Field>

        <Item variant="default" className="p-0">
          <ItemContent>
            <ItemTitle>Torrent elrejtése</ItemTitle>
            <form.Field name="torrentSeed">
              {(field) => (
                <RadioGroup
                  className="mt-2"
                  value={`${field.state.value}`}
                  onValueChange={(value) => {
                    const number = Number(value)

                    if (Number.isNaN(number)) {
                      field.setValue(null)
                    } else {
                      field.setValue(number)
                    }
                  }}
                >
                  {SEED_OPTIONS.map((seedOption) => (
                    <div
                      key={seedOption.value}
                      className="flex items-center gap-3"
                    >
                      <RadioGroupItem
                        value={seedOption.value}
                        id={seedOption.value}
                      />
                      <Label htmlFor={seedOption.value}>
                        {seedOption.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </form.Field>
          </ItemContent>
        </Item>
      </CardContent>
    </Card>
  )
}
