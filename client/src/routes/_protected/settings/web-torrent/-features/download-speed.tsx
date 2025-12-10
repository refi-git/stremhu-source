import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { isEmpty } from 'lodash'
import { TriangleAlertIcon } from 'lucide-react'
import { toast } from 'sonner'
import * as z from 'zod'

import { Alert, AlertTitle } from '@/shared/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Field, FieldError } from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/components/ui/input-group'
import { assertExists, parseApiError } from '@/shared/lib/utils'
import { getSettings, useUpdateSetting } from '@/shared/queries/settings'

const schema = z.object({
  downloadLimit: z.coerce.number<string>().positive().nullable(),
})

export function DownloadSpeed() {
  const queryClient = useQueryClient()

  const setting = queryClient.getQueryData(getSettings.queryKey)
  assertExists(setting)

  const { mutateAsync: updateSetting } = useUpdateSetting()

  const form = useForm({
    defaultValues: {
      downloadLimit: setting.downloadLimit,
    },
    validators: {
      onChange: schema,
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
        await updateSetting({
          downloadLimit: value.downloadLimit ? Number(value.downloadLimit) : -1,
        })
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
        <CardTitle>Letöltési sebesség</CardTitle>
        <CardDescription>
          Add meg a maximális letöltési sebességet. Ha üresen hagyod, a letöltés
          korlátlan lesz.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6">
        <form.Field name="downloadLimit">
          {(field) => (
            <Field>
              <InputGroup>
                <InputGroupInput
                  placeholder="Nincs limitálva"
                  inputMode="numeric"
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.value

                    if (isEmpty(value)) {
                      field.handleChange(null)
                    } else {
                      field.handleChange(e.target.value)
                    }
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>Mbit/s</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {field.state.meta.isTouched && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.Field>
        <Alert className="text-orange-400 *:data-[slot=alert-description]:text-orange-400 ">
          <TriangleAlertIcon />
          <AlertTitle className="line-clamp-2">
            200 Mbit/s felett a kliens jelentősen terhelheti a processzort.
          </AlertTitle>
        </Alert>
      </CardContent>
    </Card>
  )
}
