"use client"

import { Form } from "@/lib/components/ui/form"
import { useForm, type UseFormReturn, type FieldValues, type UseFormProps } from "react-hook-form"
import { createContext, useContext } from "react"

interface FormProviderProps<T extends FieldValues> extends UseFormProps<T> {
  children: React.ReactNode
  onSubmit?: (data: T, form: UseFormReturn<T>) => void | Promise<void>
}

const FormContext = createContext<UseFormReturn<any> | null>(null)

export function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext debe usarse dentro de FormProvider")
  }
  return context
}

export function FormProvider<T extends FieldValues>({
  children,
  onSubmit,
  onInvalidSubmit,
  ...formProps
}: FormProviderProps<T> & { onInvalidSubmit?: (errors: any) => void }) {
  const form = useForm<T>(formProps)

  const handleSubmit = form.handleSubmit(
    (data) => onSubmit?.(data, form),
    (errors) => {
      form.trigger()
      onInvalidSubmit?.(errors)
    }
  )

  return (
    <FormContext.Provider value={form}>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          {children}
        </form>
      </Form>
    </FormContext.Provider>
  )
} 