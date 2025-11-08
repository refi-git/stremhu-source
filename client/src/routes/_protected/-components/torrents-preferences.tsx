import { useForm } from '@tanstack/react-form'
import { useQueries } from '@tanstack/react-query'
import { toast } from 'sonner'

import { LanguageEnum } from '@/client/app-client'
import { SEED_OPTIONS } from '@/common/constrants'
import { userPreferencesSchema } from '@/common/schemas'
import { parseApiError } from '@/common/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { getMe, useUpdateMePreferences } from '@/queries/me'
import { getReferenceData } from '@/queries/reference-data'

export function TorrentsPreferences() {
  const [{ data: me }, { data: referenceData }] = useQueries({
    queries: [getMe, getReferenceData],
  })

  if (!referenceData) throw new Error(`Nincs "reference-data" a cache-ben`)
  if (!me) throw new Error(`Nincs "me" a cache-ben`)

  const { mutateAsync: updatePreferences } = useUpdateMePreferences()

  const form = useForm({
    defaultValues: {
      torrentLanguages: me.torrentLanguages,
      torrentResolutions: me.torrentResolutions,
      torrentSeed: me.torrentSeed,
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
        await updatePreferences(value)
        toast.success('Módosítások elmentve')
      } catch (error) {
        formApi.reset()
        const message = parseApiError(error)
        toast.error(message)
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferenciák</CardTitle>
        <CardDescription>
          Konfiguráld, hogy a Stremio-ban megjelenő torrenteknél mik a
          preferenciáid és ennek megfelelően fognak megjelenni.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Item variant="default" className="p-0">
          <ItemContent>
            <ItemTitle>Filmek, sorozatok nyelve</ItemTitle>
            <ItemDescription>
              Milyen nyelvű filmhez, sorozathoz kapcsolódó torrentek jelenjenek
              meg?
            </ItemDescription>
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
        <Item variant="default" className="p-0">
          <ItemContent>
            <ItemTitle>Filmek, sorozatok minősége</ItemTitle>
            <ItemDescription>
              Milyen minőségű filmhez, sorozathoz kapcsolódó torrentek
              jelenjenek meg?
            </ItemDescription>
            <form.Field name="torrentResolutions" mode="array">
              {(field) => (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {referenceData.option.resolutions.map((resolution) => {
                    const checked = field.state.value.includes(resolution.value)
                    const isDisabled = field.state.value.length === 1 && checked

                    return (
                      <div
                        key={resolution.value}
                        className="flex items-center space-x-2"
                      >
                        <Switch
                          id={resolution.value}
                          checked={checked}
                          disabled={isDisabled}
                          onCheckedChange={(check) => {
                            if (check) {
                              field.pushValue(resolution.value)
                            } else {
                              const index = field.state.value.findIndex(
                                (value) => value === resolution.value,
                              )
                              field.removeValue(index)
                            }
                          }}
                        />
                        <Label htmlFor={resolution.value}>
                          {resolution.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </form.Field>
          </ItemContent>
        </Item>
        <Item variant="default" className="p-0">
          <ItemContent>
            <ItemTitle>Torrent elérhetősége</ItemTitle>
            <ItemDescription>
              Kevés seeder esetén, akadozhat a lejátszás, mennyi seeder alatt
              legyen rejtve a torrent?
            </ItemDescription>
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
